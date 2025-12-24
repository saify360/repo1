#!/bin/bash

echo "🔍 3AM Backend - Deployment Verification"
echo "========================================"
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env file found"
else
    echo "❌ .env file missing - copy from .env.example"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v)
echo "✅ Node version: $NODE_VERSION"

# Check if dependencies are installed
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "⚠️  Dependencies not installed - run: yarn install"
    exit 1
fi

# Check TypeScript compilation
echo "📦 Compiling TypeScript..."
yarn build
if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Test database connection
echo "🗄️  Testing database connection..."
node -e "
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(() => {
    console.log('✅ Database connection successful');
    process.exit(0);
}).catch((err) => {
    console.log('❌ Database connection failed:', err.message);
    process.exit(1);
});
"

# Summary
echo ""
echo "🎉 Verification Complete!"
echo ""
echo "Next steps:"
echo "1. Run 'yarn dev' to start the API server"
echo "2. Run 'yarn worker' to start background workers"
echo "3. Test health endpoint: curl http://localhost:4000/health"
echo ""
