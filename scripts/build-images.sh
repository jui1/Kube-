#!/bin/bash

# Build Docker images for all services

echo "Building Kube Credential Docker Images..."
echo "=========================================="

# Build Issuance Service
echo ""
echo "Building Issuance Service..."
docker build -t kube-credential-issuance:latest ./backend/issuance-service

if [ $? -eq 0 ]; then
    echo "✅ Issuance Service built successfully"
else
    echo "❌ Failed to build Issuance Service"
    exit 1
fi

# Build Verification Service
echo ""
echo "Building Verification Service..."
docker build -t kube-credential-verification:latest ./backend/verification-service

if [ $? -eq 0 ]; then
    echo "✅ Verification Service built successfully"
else
    echo "❌ Failed to build Verification Service"
    exit 1
fi

# Build Frontend
echo ""
echo "Building Frontend..."
docker build -t kube-credential-frontend:latest ./frontend

if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully"
else
    echo "❌ Failed to build Frontend"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ All images built successfully!"
echo ""
echo "Images created:"
echo "  - kube-credential-issuance:latest"
echo "  - kube-credential-verification:latest"
echo "  - kube-credential-frontend:latest"



