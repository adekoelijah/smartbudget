#!/bin/bash

# ✅ SmartBudget Authentication - Quick Start Setup Script
# This script helps set up the authentication system

set -e

echo "🚀 SmartBudget Authentication Setup"
echo "=================================="
echo ""

# ✅ Check Node.js
echo "✓ Checking Node.js..."
node --version
npm --version
echo ""

# ✅ Backend Setup
echo "📦 Setting up Backend..."
cd smartbudget-backend

if [ ! -f .env ]; then
  echo "  Creating .env file from .env.example..."
  cp .env.example .env
  echo "  ⚠️  IMPORTANT: Edit .env with your MongoDB credentials and JWT_SECRET"
fi

echo "  Installing dependencies..."
npm install

echo ""
echo "✅ Backend setup complete!"
echo "   To start: cd smartbudget-backend && npm run dev"
echo ""

# ✅ Frontend Setup
cd ../my-project

if [ ! -f .env.local ]; then
  echo "📱 Setting up Frontend..."
  echo "  Creating .env.local file from .env.example..."
  cp .env.example .env.local
  echo "  ✓ Frontend .env.local created"
fi

echo "  Installing dependencies..."
npm install

echo ""
echo "✅ Frontend setup complete!"
echo "   To start: cd my-project && npm run dev"
echo ""

echo "=================================="
echo "🎉 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Start MongoDB service"
echo "2. In terminal 1: cd smartbudget-backend && npm run dev"
echo "3. In terminal 2: cd my-project && npm run dev"
echo "4. Open browser: http://localhost:5173"
echo "5. Create account and test login!"
echo ""
echo "📚 Documentation: See AUTHENTICATION.md for detailed setup guide"
echo ""
