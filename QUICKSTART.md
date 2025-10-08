# Quick Start Guide

Get Kube Credential running in under 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)

## Option 1: Docker Compose (Recommended)

```bash
# Navigate to project directory
cd /Users/juimandal/Documents/Kube

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Issuance API: http://localhost:3001
# Verification API: http://localhost:3002
```

That's it! The application is now running.

## Option 2: Kubernetes (Minikube)

```bash
# Start Minikube
minikube start

# Build images
./scripts/build-images.sh

# Load images into Minikube
minikube image load kube-credential-issuance:latest
minikube image load kube-credential-verification:latest
minikube image load kube-credential-frontend:latest

# Deploy
./scripts/deploy-k8s.sh

# Access frontend
kubectl port-forward service/frontend 3000:80

# Open http://localhost:3000
```

## Try It Out

### Issue a Credential

1. Go to http://localhost:3000
2. Fill in the form:
   - **ID**: `DEMO-001`
   - **Holder Name**: `John Doe`
   - **Type**: `Identity`
   - **Date**: Today's date
3. Click "Issue Credential"
4. Note the worker ID in the response

### Verify the Credential

1. Click "Verify Credential" in the navigation
2. Enter the same details:
   - **ID**: `DEMO-001`
   - **Holder Name**: `John Doe`
   - **Type**: `Identity`
   - **Date**: Same date
3. Click "Verify Credential"
4. See it verified with issuance details!

## Running Tests

```bash
./scripts/run-tests.sh
```

## Stop Services

```bash
# Docker Compose
docker-compose down

# Kubernetes
kubectl delete -f k8s/
minikube stop
```

## Next Steps

- Read the full [README.md](README.md)
- Check out [DEPLOYMENT.md](DEPLOYMENT.md) for cloud deployment
- See [TESTING.md](TESTING.md) for comprehensive testing guide

## Troubleshooting

**Services not starting?**
```bash
docker-compose logs
```

**Port already in use?**
```bash
# Change ports in docker-compose.yaml
```

**Need help?**
- Check the logs
- Review the README.md
- Ensure all prerequisites are installed



