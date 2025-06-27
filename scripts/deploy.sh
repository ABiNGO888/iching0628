#!/bin/bash

# Deployment script for Vercel
echo "Starting deployment preparation..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Check if schema exists
if [ ! -f "prisma/schema.prisma" ]; then
    echo "Error: prisma/schema.prisma not found!"
    exit 1
fi

echo "Prisma schema found at prisma/schema.prisma"

# Build the application
echo "Building Next.js application..."
npm run build

echo "Deployment preparation completed successfully!"