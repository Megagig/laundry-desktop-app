#!/bin/bash

# Laundry Desktop App - Development Startup Script

echo "🚀 Starting Laundry Desktop App in Development Mode"
echo ""

# Check if Vite dev server is already running
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✓ Vite dev server is already running on port 5173"
else
    echo "⚠️  Vite dev server is NOT running!"
    echo ""
    echo "Please start the Vite dev server first:"
    echo "  1. Open a new terminal"
    echo "  2. Run: cd renderer && npm run dev"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo ""
echo "Building Electron backend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✓ Build successful"
    echo ""
    echo "Starting Electron app..."
    echo "Press Ctrl+C to stop"
    echo ""
    npm run dev
else
    echo "✗ Build failed"
    exit 1
fi
