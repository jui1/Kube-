#!/bin/bash

# Deploy to Kubernetes

echo "Deploying Kube Credential to Kubernetes..."
echo "==========================================="

# Apply deployments
echo ""
echo "Deploying services..."

kubectl apply -f k8s/issuance-deployment.yaml
kubectl apply -f k8s/verification-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

echo ""
echo "Applying Horizontal Pod Autoscalers..."
kubectl apply -f k8s/hpa.yaml

echo ""
echo "Applying Ingress (optional)..."
kubectl apply -f k8s/ingress.yaml

echo ""
echo "==========================================="
echo "Checking deployment status..."
echo ""

kubectl get deployments
kubectl get services
kubectl get pods

echo ""
echo "✅ Deployment complete!"
echo ""
echo "To access the services:"
echo "  Frontend: kubectl port-forward service/frontend 3000:80"
echo "  Issuance API: kubectl port-forward service/issuance-service 3001:3001"
echo "  Verification API: kubectl port-forward service/verification-service 3002:3002"



