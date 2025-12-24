# 3AM Frontend - TikTok-Style Creator Platform

Mobile-first Next.js frontend with vertical scroll feed, gated content, and seamless payments.

## 🎯 **Features**

### **TikTok-Style Feed**
- ✅ Vertical scroll with snap-to-item
- ✅ Swipe up/down navigation
- ✅ Auto-play videos when active
- ✅ Progress indicators
- ✅ Desktop keyboard support

### **Content Interaction**
- ✅ Tap to expand/interact
- ✅ Gated content with blur overlay
- ✅ "Unlock for $X" CTA
- ✅ Subscribe-to-view option
- ✅ Like, comment, share actions

### **Creator Profiles**
- ✅ Banner + profile image
- ✅ Bio and stats
- ✅ Tabbed sections (Posts/Store/About)
- ✅ Customizable theme colors
- ✅ Social links

### **Store & Payments**
- ✅ Digital products only
- ✅ One-click purchase
- ✅ Balance display
- ✅ Stripe integration ready
- ✅ Internal ledger updates

### **UX**
- ✅ Modern dark theme
- ✅ Mobile-first responsive
- ✅ Non-crypto ($ only displays)
- ✅ Smooth animations (Framer Motion)
- ✅ Bottom navigation

## 🚀 **Quick Start**

```bash
cd /app/3am-frontend
yarn install
yarn dev
```

Visit: `http://localhost:3001`

## 📁 **Project Structure**

```
3am-frontend/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home feed
│   ├── [username]/          # Creator profiles
│   └── globals.css          # Global styles
├── components/
│   ├── FeedView.tsx         # TikTok-style vertical scroll
│   ├── ContentCard.tsx      # Individual content item
│   ├── GatedOverlay.tsx     # Unlock prompt
│   ├── TipModal.tsx         # Tip sending
│   ├── CreatorProfile.tsx   # Profile page
│   ├── StoreSection.tsx     # Digital products
│   ├── ProductCard.tsx      # Product item
│   └── BottomNav.tsx        # Mobile navigation
├── lib/
│   ├── api.ts               # API client
│   └── store.ts             # Zustand state
└── package.json
```

## 🎨 **Design System**

### **Colors**
- Primary: `#5a67d8` (Blue)
- Secondary: `#667eea` (Light Blue)
- Accent: `#764ba2` (Purple)
- Background: Gradient dark (`#0a0a0b` → `#1a1a2e`)

### **Typography**
- System fonts (Apple/Android native)
- Font weights: 400 (regular), 600 (semibold), 700 (bold)

### **Components**
- Glass-morphism cards
- Rounded buttons (xl = 12px)
- Backdrop blur effects
- Smooth transitions (300ms)

## 🔌 **API Integration**

### **Endpoints Used**
```typescript
// Feed
GET  /api/content/feed?limit=20

// Users
GET  /api/users/:username

// Payments
GET  /api/payments/balance/:userId
POST /api/payments/tip
POST /api/payments/credits/purchase

// Store
GET  /api/stores/:storeId
POST /api/products/:productId/purchase
```

### **State Management**
Using Zustand for:
- Feed items
- Current scroll index
- User session
- Balance tracking

## 📱 **Mobile Features**

### **Touch Gestures**
- Swipe up: Next content
- Swipe down: Previous content
- Tap: Interact/expand
- Long press: Options (future)

### **Optimizations**
- Lazy loading content
- Video preloading
- Image optimization (Next.js)
- Snap scroll for smooth UX

## 💰 **Payment Flow**

### **Add Credits**
```
User → Stripe → Backend API → Ledger Update → Frontend Balance Refresh
```

### **Tip Creator**
```
User Balance → Check Sufficient → Transfer → Update Both Ledgers → Success
```

### **Purchase Product**
```
Check Balance → Deduct Amount → Grant Access → Download Link
```

## 🧪 **Testing**

### **Test Feed Scroll**
1. Open in mobile view (DevTools)
2. Swipe up/down
3. Check snap behavior
4. Verify auto-play

### **Test Gated Content**
1. Tap on gated post
2. See blur overlay
3. Click "Unlock"
4. Verify purchase flow

### **Test Store**
1. Visit creator profile
2. Navigate to "Store" tab
3. Click "Buy Now" on product
4. Check balance deduction

## 🎬 **Demo Data**

Currently using mock data. To connect real backend:

1. Update `.env.local`:
```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

2. Ensure backend is running
3. Refresh frontend

## 🚢 **Deployment**

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Environment Variables**
Set in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## 📊 **Performance**

### **Metrics to Track**
- First Contentful Paint (FCP): <1.5s
- Time to Interactive (TTI): <3s
- Feed scroll smoothness: 60 FPS
- Video load time: <2s

### **Optimizations**
- Next.js image optimization
- Code splitting by route
- Lazy loading components
- Prefetch next content item

## 🔧 **Configuration**

### **Tailwind Config**
```javascript
// Custom colors and animations
theme: {
  extend: {
    colors: {
      primary: '#5a67d8',
      secondary: '#667eea',
      accent: '#764ba2',
    },
  },
}
```

### **Next.js Config**
```javascript
// Image domains and experimental features
images: {
  domains: ['localhost', 'supabase.co'],
},
experimental: {
  appDir: true,
},
```

## 🐛 **Known Issues**

- [ ] Store products are mocked (needs backend integration)
- [ ] Feed data is mock (needs real content)
- [ ] Auth flow not connected (use mock user)
- [ ] Stripe integration incomplete (needs keys)

## 📝 **Next Steps**

### **Phase 1 Completion**
- [ ] Connect to real backend API
- [ ] Implement Stripe payment UI
- [ ] Add Supabase auth
- [ ] Test on real mobile devices

### **Phase 2 Features**
- [ ] Comments on content
- [ ] Notifications
- [ ] Creator analytics
- [ ] Content upload flow

## 🆘 **Troubleshooting**

### **Feed not loading**
- Check API_URL in `.env.local`
- Verify backend is running
- Check browser console for errors

### **Swipe not working**
- Test in mobile view (not desktop)
- Try touch emulation in DevTools
- Check scroll container height

### **Payments failing**
- Verify user has sufficient balance
- Check Stripe keys are set
- Ensure backend API is reachable

---

**Built for 3AM Phase 1 MVP** 🌙
