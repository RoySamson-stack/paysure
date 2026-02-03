#!/bin/bash

echo "🚀 Setting up PaySure Project..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Set up database
echo "📊 Setting up database..."
sudo -u postgres psql -c "CREATE DATABASE paysure_db;" 2>/dev/null || echo "Database might already exist"
sudo -u postgres psql -c "CREATE USER paysure_user WITH PASSWORD 'your_secure_password';" 2>/dev/null || echo "User might already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE paysure_db TO paysure_user;" 2>/dev/null

echo "✅ Database setup complete"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd paysure-backend
npm install
echo "✅ Backend dependencies installed"

# Install mobile dependencies
echo "📱 Installing mobile dependencies..."
cd ../paysure-mobile
npm install
echo "✅ Mobile dependencies installed"

cd ..

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your M-Pesa credentials in paysure-backend/.env"
echo "2. Start the backend: cd paysure-backend && npm run dev"
echo "3. Start the mobile app: cd paysure-mobile && npm start"
echo ""
echo "📖 Check README.md for detailed instructions"
