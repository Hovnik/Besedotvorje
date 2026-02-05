#!/bin/bash

echo "🚀 Besedotvorje Production Build Script"
echo "========================================"
echo ""

# Check if .env files exist
if [ ! -f backend/.env ]; then
    echo "⚠️  backend/.env not found!"
    echo "📝 Creating from .env.example..."
    cp backend/.env.example backend/.env
    echo "✅ Please edit backend/.env with your actual values"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
echo ""

echo "Installing backend dependencies..."
cd backend && npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    exit 1
fi

echo ""
echo "Installing frontend dependencies..."
cd ../frontend && npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend installation failed"
    exit 1
fi

# Build frontend
echo ""
echo "🔨 Building frontend for production..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

cd ..

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit backend/.env with your MongoDB URI and OpenAI API key"
echo "2. Run 'npm start' from the backend directory to start the server"
echo "3. Visit http://localhost:3000 in your browser"
echo ""
echo "Or run: cd backend && NODE_ENV=production npm start"
