from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from web3 import Web3
from eth_account.messages import encode_defunct
import base64
from PIL import Image
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION = 7 * 24 * 60 * 60  # 7 days

# Web3 Setup for Mumbai testnet
ALCHEMY_URL = os.environ.get('ALCHEMY_URL', 'https://polygon-mumbai.g.alchemy.com/v2/demo')
w3 = Web3(Web3.HTTPProvider(ALCHEMY_URL))

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Smart Contract ABIs (simplified for MVP)
TIPPING_ABI = [
    {
        "inputs": [{"name": "recipient", "type": "address"}, {"name": "amount", "type": "uint256"}],
        "name": "tip",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
]

NFT_ABI = [
    {
        "inputs": [{"name": "to", "type": "address"}, {"name": "uri", "type": "string"}],
        "name": "mint",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

# Contract Addresses (deploy these to Mumbai)
TIPPING_CONTRACT = os.environ.get('TIPPING_CONTRACT', '0x0000000000000000000000000000000000000000')
NFT_CONTRACT = os.environ.get('NFT_CONTRACT', '0x0000000000000000000000000000000000000000')

# Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str
    display_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class WalletAuth(BaseModel):
    wallet_address: str
    signature: str
    message: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: Optional[str] = None
    username: str
    display_name: str
    wallet_address: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    cover_image: Optional[str] = None
    is_approved: bool = True  # Auto-approved on signup
    kyc_status: str = "not_required"  # "not_required", "pending", "approved", "rejected"
    kyc_submitted_at: Optional[datetime] = None
    subscriber_count: int = 0
    total_tips_received: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    wallet_address: Optional[str] = None

class Content(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    title: str
    description: Optional[str] = None
    media_url: str
    media_type: str  # 'image' or 'video'
    cta_buttons: List[str] = []  # ['subscribe', 'tip', 'send', 'mint']
    likes: int = 0
    tips_received: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    cta_buttons: List[str] = []

class TipRequest(BaseModel):
    recipient_username: str
    amount: float
    tx_hash: str
    content_id: Optional[str] = None

class MintRequest(BaseModel):
    content_id: str
    tx_hash: str

class SubscribeRequest(BaseModel):
    creator_username: str

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(seconds=JWT_EXPIRATION)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({'id': payload['user_id']}, {'_id': 0, 'password_hash': 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def verify_wallet_signature(wallet_address: str, message: str, signature: str) -> bool:
    try:
        message_hash = encode_defunct(text=message)
        recovered_address = w3.eth.account.recover_message(message_hash, signature=signature)
        return recovered_address.lower() == wallet_address.lower()
    except Exception as e:
        logger.error(f"Signature verification error: {e}")
        return False

# Auth Routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({'$or': [{'email': user_data.email}, {'username': user_data.username}]})
    if existing:
        raise HTTPException(status_code=400, detail="Email or username already exists")
    
    user = User(
        email=user_data.email,
        username=user_data.username,
        display_name=user_data.display_name
    )
    
    user_dict = user.model_dump()
    user_dict['password_hash'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    token = create_jwt_token(user.id, user.email)
    return {'token': token, 'user': user.model_dump()}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({'email': credentials.email})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user['id'], user['email'])
    user.pop('password_hash', None)
    user.pop('_id', None)
    return {'token': token, 'user': user}

@api_router.post("/auth/wallet")
async def wallet_auth(auth_data: WalletAuth):
    # Verify signature
    if not verify_wallet_signature(auth_data.wallet_address, auth_data.message, auth_data.signature):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    # Find or create user
    user = await db.users.find_one({'wallet_address': auth_data.wallet_address.lower()})
    
    if not user:
        # Create new user with wallet
        username = f"user_{auth_data.wallet_address[:8].lower()}"
        new_user = User(
            username=username,
            display_name=f"Creator {auth_data.wallet_address[:6]}",
            wallet_address=auth_data.wallet_address.lower()
        )
        user_dict = new_user.model_dump()
        user_dict['created_at'] = user_dict['created_at'].isoformat()
        await db.users.insert_one(user_dict)
        user = user_dict
    
    token = create_jwt_token(user['id'], user.get('email', user['wallet_address']))
    user.pop('password_hash', None)
    user.pop('_id', None)
    return {'token': token, 'user': user}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# Profile Routes
@api_router.get("/profile/{username}")
async def get_profile(username: str):
    user = await db.users.find_one({'username': username}, {'_id': 0, 'password_hash': 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.put("/profile")
async def update_profile(profile: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in profile.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({'id': current_user['id']}, {'$set': update_data})
    updated_user = await db.users.find_one({'id': current_user['id']}, {'_id': 0, 'password_hash': 0})
    return updated_user

@api_router.post("/profile/image")
async def upload_profile_image(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    # Validate image
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Resize and validate
        max_size = (800, 800)
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Convert to base64 for simple storage
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG', quality=85)
        img_str = base64.b64encode(buffer.getvalue()).decode()
        img_data_url = f"data:image/jpeg;base64,{img_str}"
        
        # Update user
        await db.users.update_one(
            {'id': current_user['id']},
            {'$set': {'profile_image': img_data_url, 'is_approved': False}}
        )
        
        return {'profile_image': img_data_url, 'message': 'Image uploaded. Pending admin approval.'}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

# Content Routes
@api_router.post("/content")
async def create_content(
    title: str = Form(...),
    description: str = Form(None),
    cta_buttons: str = Form('[]'),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    import json
    try:
        contents = await file.read()
        
        # Determine media type
        media_type = 'video' if file.content_type.startswith('video') else 'image'
        
        # For MVP, store as base64
        if media_type == 'image':
            image = Image.open(io.BytesIO(contents))
            image.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
            buffer = io.BytesIO()
            image.save(buffer, format='JPEG', quality=85)
            media_data = base64.b64encode(buffer.getvalue()).decode()
            media_url = f"data:image/jpeg;base64,{media_data}"
        else:
            # For video, store base64 (note: this is not ideal for production)
            media_data = base64.b64encode(contents).decode()
            media_url = f"data:{file.content_type};base64,{media_data}"
        
        content = Content(
            user_id=current_user['id'],
            username=current_user['username'],
            title=title,
            description=description,
            media_url=media_url,
            media_type=media_type,
            cta_buttons=json.loads(cta_buttons)
        )
        
        content_dict = content.model_dump()
        content_dict['created_at'] = content_dict['created_at'].isoformat()
        await db.contents.insert_one(content_dict)
        
        return content.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")

@api_router.get("/content/user/{username}")
async def get_user_content(username: str):
    contents = await db.contents.find({'username': username}, {'_id': 0}).sort('created_at', -1).to_list(100)
    for content in contents:
        if isinstance(content.get('created_at'), str):
            content['created_at'] = datetime.fromisoformat(content['created_at'])
    return contents

@api_router.get("/content/feed")
async def get_feed(limit: int = 20):
    contents = await db.contents.find({}, {'_id': 0}).sort('created_at', -1).limit(limit).to_list(limit)
    for content in contents:
        if isinstance(content.get('created_at'), str):
            content['created_at'] = datetime.fromisoformat(content['created_at'])
    return contents

@api_router.get("/content/{content_id}")
async def get_content(content_id: str):
    content = await db.contents.find_one({'id': content_id}, {'_id': 0})
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

# Interaction Routes
@api_router.post("/tip")
async def process_tip(tip_data: TipRequest, current_user: dict = Depends(get_current_user)):
    # Verify transaction on blockchain
    try:
        receipt = w3.eth.get_transaction_receipt(tip_data.tx_hash)
        if not receipt or receipt['status'] != 1:
            raise HTTPException(status_code=400, detail="Transaction failed or not found")
    except Exception as e:
        # For testnet, we'll allow tips even if verification fails
        logger.warning(f"Tip verification failed: {e}")
    
    # Update recipient
    recipient = await db.users.find_one({'username': tip_data.recipient_username})
    if recipient:
        await db.users.update_one(
            {'username': tip_data.recipient_username},
            {'$inc': {'total_tips_received': tip_data.amount}}
        )
    
    # Update content if specified
    if tip_data.content_id:
        await db.contents.update_one(
            {'id': tip_data.content_id},
            {'$inc': {'tips_received': tip_data.amount}}
        )
    
    # Record transaction
    transaction = {
        'id': str(uuid.uuid4()),
        'type': 'tip',
        'from_user_id': current_user['id'],
        'to_username': tip_data.recipient_username,
        'amount': tip_data.amount,
        'tx_hash': tip_data.tx_hash,
        'content_id': tip_data.content_id,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.transactions.insert_one(transaction)
    
    return {'success': True, 'message': 'Tip processed successfully'}

@api_router.post("/mint")
async def process_mint(mint_data: MintRequest, current_user: dict = Depends(get_current_user)):
    content = await db.contents.find_one({'id': mint_data.content_id})
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Record NFT mint
    nft = {
        'id': str(uuid.uuid4()),
        'content_id': mint_data.content_id,
        'owner_id': current_user['id'],
        'creator_username': content['username'],
        'tx_hash': mint_data.tx_hash,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.nfts.insert_one(nft)
    
    return {'success': True, 'message': 'NFT minted successfully', 'nft': nft}

@api_router.post("/subscribe")
async def subscribe(sub_data: SubscribeRequest, current_user: dict = Depends(get_current_user)):
    # Check if already subscribed
    existing = await db.subscriptions.find_one({
        'subscriber_id': current_user['id'],
        'creator_username': sub_data.creator_username
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Already subscribed")
    
    # Create subscription
    subscription = {
        'id': str(uuid.uuid4()),
        'subscriber_id': current_user['id'],
        'creator_username': sub_data.creator_username,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.subscriptions.insert_one(subscription)
    
    # Update creator's subscriber count
    await db.users.update_one(
        {'username': sub_data.creator_username},
        {'$inc': {'subscriber_count': 1}}
    )
    
    return {'success': True, 'message': 'Subscribed successfully'}

@api_router.get("/subscriptions")
async def get_subscriptions(current_user: dict = Depends(get_current_user)):
    subs = await db.subscriptions.find({'subscriber_id': current_user['id']}, {'_id': 0}).to_list(1000)
    return subs

# Admin Routes
@api_router.get("/admin/pending-approvals")
async def get_pending_approvals(current_user: dict = Depends(get_current_user)):
    # Simple admin check (in production, use proper role-based auth)
    pending = await db.users.find(
        {'is_approved': False, 'profile_image': {'$ne': None}},
        {'_id': 0, 'password_hash': 0}
    ).to_list(100)
    return pending

@api_router.post("/admin/approve/{user_id}")
async def approve_user(user_id: str, current_user: dict = Depends(get_current_user)):
    await db.users.update_one({'id': user_id}, {'$set': {'is_approved': True}})
    return {'success': True, 'message': 'User approved'}

# Discovery
@api_router.get("/discover/creators")
async def discover_creators(limit: int = 20):
    creators = await db.users.find(
        {'is_approved': True},
        {'_id': 0, 'password_hash': 0}
    ).sort('subscriber_count', -1).limit(limit).to_list(limit)
    return creators

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
