# Deployment Guide

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [AWS Cloud Deployment](#aws-cloud-deployment)
5. [Testing](#testing)

---

## Local Development

### Quick Start with Docker Compose

The easiest way to run the entire stack locally:

```bash
# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Issuance API: http://localhost:3001/health
# Verification API: http://localhost:3002/health
```

### Manual Development Setup

For active development with hot-reload:

**Terminal 1 - Issuance Service**
```bash
cd backend/issuance-service
npm install
npm run dev
```

**Terminal 2 - Verification Service**
```bash
cd backend/verification-service
npm install
npm run dev
```

**Terminal 3 - Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## Docker Deployment

### Build All Images

```bash
# Make script executable
chmod +x scripts/build-images.sh

# Build all images
./scripts/build-images.sh
```

This creates:
- `kube-credential-issuance:latest`
- `kube-credential-verification:latest`
- `kube-credential-frontend:latest`

### Run with Docker Compose

```bash
# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## Kubernetes Deployment

### Prerequisites

1. **Install kubectl**
```bash
# macOS
brew install kubectl

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

2. **Setup Local Kubernetes Cluster**

**Option A: Minikube**
```bash
# Install Minikube
brew install minikube

# Start cluster
minikube start --cpus=4 --memory=8192

# Enable metrics server for HPA
minikube addons enable metrics-server

# Verify
kubectl cluster-info
```

**Option B: Kind (Kubernetes in Docker)**
```bash
# Install Kind
brew install kind

# Create cluster
kind create cluster --name kube-credential

# Verify
kubectl cluster-info
```

### Deploy to Kubernetes

**Step 1: Build and Load Images**

```bash
# Build images
./scripts/build-images.sh

# For Minikube
minikube image load kube-credential-issuance:latest
minikube image load kube-credential-verification:latest
minikube image load kube-credential-frontend:latest

# For Kind
kind load docker-image kube-credential-issuance:latest --name kube-credential
kind load docker-image kube-credential-verification:latest --name kube-credential
kind load docker-image kube-credential-frontend:latest --name kube-credential

# Verify images are loaded
docker images | grep kube-credential
```

**Step 2: Deploy Services**

```bash
# Make script executable
chmod +x scripts/deploy-k8s.sh

# Deploy all services
./scripts/deploy-k8s.sh
```

Or manually:
```bash
# Deploy backend services
kubectl apply -f k8s/issuance-deployment.yaml
kubectl apply -f k8s/verification-deployment.yaml

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml

# Apply auto-scaling
kubectl apply -f k8s/hpa.yaml

# Optional: Apply ingress
kubectl apply -f k8s/ingress.yaml
```

**Step 3: Verify Deployment**

```bash
# Check deployments
kubectl get deployments

# Expected output:
# NAME                   READY   UP-TO-DATE   AVAILABLE   AGE
# issuance-service       3/3     3            3           1m
# verification-service   3/3     3            3           1m
# frontend               2/2     2            2           1m

# Check pods
kubectl get pods

# Check services
kubectl get services

# Check HPA
kubectl get hpa
```

**Step 4: Access the Application**

```bash
# Option 1: Port forwarding (recommended for local)
kubectl port-forward service/frontend 3000:80

# Access at http://localhost:3000

# Option 2: With Minikube
minikube service frontend

# Option 3: Get LoadBalancer IP (cloud)
kubectl get service frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

### Monitoring

```bash
# Watch pods in real-time
kubectl get pods -w

# View logs
kubectl logs -f deployment/issuance-service
kubectl logs -f deployment/verification-service
kubectl logs -f deployment/frontend

# View logs from all pods of a service
kubectl logs -l app=issuance-service --all-containers=true -f

# Describe pod (troubleshooting)
kubectl describe pod <pod-name>

# Execute commands in pod
kubectl exec -it <pod-name> -- /bin/sh
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment issuance-service --replicas=5
kubectl scale deployment verification-service --replicas=5

# Check HPA status
kubectl get hpa

# Describe HPA
kubectl describe hpa issuance-service-hpa
```

### Cleanup

```bash
# Delete all resources
kubectl delete -f k8s/

# Or individually
kubectl delete deployment issuance-service
kubectl delete deployment verification-service
kubectl delete deployment frontend
kubectl delete service issuance-service
kubectl delete service verification-service
kubectl delete service frontend
kubectl delete hpa issuance-service-hpa
kubectl delete hpa verification-service-hpa

# Stop Minikube
minikube stop

# Delete Minikube cluster
minikube delete

# Delete Kind cluster
kind delete cluster --name kube-credential
```

---

## AWS Cloud Deployment

### Option 1: AWS EKS (Elastic Kubernetes Service)

**Step 1: Install AWS CLI and eksctl**

```bash
# Install AWS CLI
brew install awscli

# Configure AWS credentials
aws configure

# Install eksctl
brew install eksctl
```

**Step 2: Create EKS Cluster**

```bash
# Create cluster (takes ~15-20 minutes)
eksctl create cluster \
  --name kube-credential-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 5 \
  --managed

# Verify cluster
kubectl get nodes
```

**Step 3: Setup ECR (Elastic Container Registry)**

```bash
# Create ECR repositories
aws ecr create-repository --repository-name kube-credential-issuance --region us-east-1
aws ecr create-repository --repository-name kube-credential-verification --region us-east-1
aws ecr create-repository --repository-name kube-credential-frontend --region us-east-1

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

**Step 4: Build and Push Images**

```bash
# Get your AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=us-east-1

# Tag images
docker tag kube-credential-issuance:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/kube-credential-issuance:latest
docker tag kube-credential-verification:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/kube-credential-verification:latest
docker tag kube-credential-frontend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/kube-credential-frontend:latest

# Push images
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/kube-credential-issuance:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/kube-credential-verification:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/kube-credential-frontend:latest
```

**Step 5: Update K8s Manifests**

Update image references in deployment files:
```yaml
# k8s/issuance-deployment.yaml
image: <account-id>.dkr.ecr.us-east-1.amazonaws.com/kube-credential-issuance:latest
```

**Step 6: Deploy to EKS**

```bash
# Deploy services
kubectl apply -f k8s/

# Get LoadBalancer URL
kubectl get service frontend

# Access the application at the EXTERNAL-IP
```

**Step 7: Cleanup EKS**

```bash
# Delete Kubernetes resources
kubectl delete -f k8s/

# Delete EKS cluster
eksctl delete cluster --name kube-credential-cluster --region us-east-1
```

### Option 2: AWS EC2 with Docker Compose

**Step 1: Launch EC2 Instance**

```bash
# Launch t2.micro instance (free tier)
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t2.micro \
  --key-name your-key-pair \
  --security-groups your-security-group
```

**Step 2: SSH and Setup**

```bash
# SSH to instance
ssh -i your-key.pem ec2-user@<instance-ip>

# Install Docker and Docker Compose
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone <your-repo-url>
cd Kube

# Start services
docker-compose up -d
```

### Option 3: AWS S3 + CloudFront (Frontend Only)

**Step 1: Build Frontend**

```bash
cd frontend
npm install
npm run build
```

**Step 2: Create S3 Bucket**

```bash
# Create bucket
aws s3 mb s3://kube-credential-frontend

# Configure for static website hosting
aws s3 website s3://kube-credential-frontend \
  --index-document index.html \
  --error-document index.html
```

**Step 3: Upload Build**

```bash
# Sync build to S3
aws s3 sync dist/ s3://kube-credential-frontend --delete

# Make files public
aws s3 policy put-bucket-policy \
  --bucket kube-credential-frontend \
  --policy file://bucket-policy.json
```

**Step 4: Create CloudFront Distribution**

```bash
aws cloudfront create-distribution \
  --origin-domain-name kube-credential-frontend.s3.amazonaws.com \
  --default-root-object index.html
```

---

## Testing

### Run All Tests

```bash
chmod +x scripts/run-tests.sh
./scripts/run-tests.sh
```

### Run Individual Test Suites

**Issuance Service**
```bash
cd backend/issuance-service
npm install
npm test
npm test -- --coverage
```

**Verification Service**
```bash
cd backend/verification-service
npm install
npm test
npm test -- --coverage
```

**Frontend**
```bash
cd frontend
npm install
npm test
npm test -- --coverage
```

### Integration Testing

Test the full flow:

```bash
# 1. Start services
docker-compose up -d

# 2. Issue a credential
curl -X POST http://localhost:3001/api/issue \
  -H "Content-Type: application/json" \
  -d '{
    "id": "TEST-001",
    "holderName": "John Doe",
    "credentialType": "Identity",
    "issuedDate": "2025-10-07"
  }'

# 3. Verify the credential
curl -X POST http://localhost:3002/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "id": "TEST-001",
      "holderName": "John Doe",
      "credentialType": "Identity",
      "issuedDate": "2025-10-07"
    }
  }'
```

---

## Troubleshooting

### Common Issues

**Issue: Pods not starting**
```bash
# Check pod status
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Common causes:
# - Image not loaded in Minikube/Kind
# - Image pull policy issues
# - Resource constraints
```

**Issue: Cannot connect to services**
```bash
# Check service endpoints
kubectl get endpoints

# Test service from within cluster
kubectl run -it --rm debug --image=alpine --restart=Never -- sh
apk add curl
curl http://issuance-service:3001/health
```

**Issue: HPA not working**
```bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# For Minikube
minikube addons enable metrics-server

# Verify
kubectl top nodes
kubectl top pods
```

**Issue: Database data lost**
```bash
# Use PersistentVolumeClaims instead of emptyDir
# Update deployment to use PVC for production
```

---

## Performance Tips

1. **Resource Allocation**: Adjust resource limits based on load
2. **Horizontal Scaling**: Use HPA to scale based on CPU/memory
3. **Caching**: Add Redis for frequently accessed data
4. **Database**: Migrate to PostgreSQL with connection pooling
5. **Load Balancing**: Use ingress controller with proper routing

---

## Security Best Practices

1. Use Kubernetes Secrets for sensitive data
2. Enable RBAC (Role-Based Access Control)
3. Use network policies to restrict traffic
4. Scan images for vulnerabilities
5. Enable TLS/SSL for all external communication
6. Implement rate limiting
7. Add authentication and authorization

---

## Monitoring and Logging

### Setup Prometheus + Grafana

```bash
# Install Prometheus
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml

# Install Grafana
kubectl apply -f https://raw.githubusercontent.com/grafana/grafana/main/deploy/kubernetes/grafana.yaml
```

### Centralized Logging

```bash
# Install ELK Stack or use CloudWatch for AWS
kubectl apply -f https://raw.githubusercontent.com/elastic/cloud-on-k8s/master/config/all-in-one.yaml
```

---

For more information, see the main [README.md](README.md)



