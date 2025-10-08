#!/bin/bash

# Start services locally using Docker Compose

echo "Starting Kube Credential (Local Development)..."
echo "==============================================="

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed"
    exit 1
fi

# Start services
docker-compose up --build

echo ""
echo "Services started!"
echo "  Frontend: http://localhost:3000"
echo "  Issuance API: http://localhost:3001"
echo "  Verification API: http://localhost:3002"



