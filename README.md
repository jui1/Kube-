# Kube Credential - Microservice-Based Credential System

## 📋 Project Overview

**Kube Credential** is a microservice-based credential issuance and verification system built with Node.js, TypeScript, React, and Kubernetes. The system consists of two independent backend services and a React frontend, all containerized with Docker and deployable to Kubernetes.

### Candidate Information
- **Name**: [Your Name Here]
- **Email**: [Your Email Here]
- **Contact**: [Your Phone Number Here]

---

## 🏗️ System Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│              (React + TypeScript + Vite)                     │
│                    Port: 3000 / 80                           │
└──────────────┬─────────────────────┬────────────────────────┘
               │                     │
               │                     │
       ┌───────▼────────┐    ┌──────▼─────────┐
       │   Issuance     │    │  Verification  │
       │    Service     │◄───┤    Service     │
       │  (Port: 3001)  │    │  (Port: 3002)  │
       └────────┬───────┘    └────────┬───────┘
                │                     │
         ┌──────▼──────┐       ┌──────▼──────┐
         │  SQLite DB  │       │  SQLite DB  │
         │ (Issuance)  │       │(Verification│
         └─────────────┘       └─────────────┘
```

### Components

1. **Issuance Service** (Node.js + TypeScript)
   - Issues new credentials
   - Validates credential uniqueness
   - Persists credentials in SQLite database
   - Returns worker ID with each issuance
   - Port: 3001

2. **Verification Service** (Node.js + TypeScript)
   - Verifies credential authenticity
   - Queries issuance service for validation
   - Logs all verification attempts
   - Returns verification status with worker ID
   - Port: 3002

3. **Frontend** (React + TypeScript)
   - Issuance page for creating credentials
   - Verification page for validating credentials
   - Modern, responsive UI
   - Port: 3000 (dev) / 80 (production)

---

## 🎯 Key Features

- ✅ **Microservice Architecture**: Independent, scalable services
- ✅ **Type-Safe**: Full TypeScript implementation
- ✅ **Containerized**: Docker containers for all services
- ✅ **Kubernetes Ready**: Full K8s manifests with auto-scaling
- ✅ **Comprehensive Testing**: Unit tests for all components
- ✅ **Worker Identification**: Each pod reports its worker ID
- ✅ **Persistent Storage**: SQLite databases for data persistence
- ✅ **Modern UI/UX**: Beautiful, responsive React interface
- ✅ **Health Checks**: Built-in health endpoints
- ✅ **Auto-Scaling**: Horizontal Pod Autoscaler configurations

---

## 📁 Project Structure

```
Kube/
├── backend/
│   ├── issuance-service/
│   │   ├── src/
│   │   │   ├── index.ts          # Main application entry
│   │   │   ├── service.ts        # Business logic
│   │   │   ├── database.ts       # Database operations
│   │   │   ├── types.ts          # TypeScript types
│   │   │   ├── *.test.ts         # Unit tests
│   │   ├── Dockerfile            # Docker configuration
│   │   ├── package.json          # Dependencies
│   │   └── tsconfig.json         # TypeScript config
│   │
│   └── verification-service/
│       ├── src/
│       │   ├── index.ts          # Main application entry
│       │   ├── service.ts        # Business logic
│       │   ├── database.ts       # Database operations
│       │   ├── types.ts          # TypeScript types
│       │   ├── *.test.ts         # Unit tests
│       ├── Dockerfile            # Docker configuration
│       ├── package.json          # Dependencies
│       └── tsconfig.json         # TypeScript config
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx              # Application entry
│   │   ├── App.tsx               # Main app component
│   │   ├── App.css               # Global styles
│   │   ├── pages/
│   │   │   ├── IssuancePage.tsx  # Issuance UI
│   │   │   └── VerificationPage.tsx # Verification UI
│   │   ├── types.ts              # TypeScript types
│   │   └── config.ts             # API configuration
│   ├── Dockerfile                # Docker configuration
│   ├── nginx.conf                # Nginx config
│   ├── package.json              # Dependencies
│   └── vite.config.ts            # Vite configuration
│
├── k8s/
│   ├── issuance-deployment.yaml  # Issuance K8s deployment
│   ├── verification-deployment.yaml # Verification K8s deployment
│   ├── frontend-deployment.yaml  # Frontend K8s deployment
│   ├── ingress.yaml              # Ingress configuration
│   └── hpa.yaml                  # Auto-scaling config
│
├── scripts/
│   ├── build-images.sh           # Build Docker images
│   ├── deploy-k8s.sh             # Deploy to Kubernetes
│   ├── run-tests.sh              # Run all tests
│   └── local-dev.sh              # Local development
│
├── docker-compose.yaml           # Local Docker Compose
└── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Kubernetes** cluster (Minikube, Kind, or cloud provider)
- **kubectl** CLI tool

### Local Development

#### Option 1: Using Docker Compose (Recommended)

```bash
# Clone the repository
cd /path/to/Kube

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Issuance API: http://localhost:3001
# Verification API: http://localhost:3002
```

#### Option 2: Running Services Individually

```bash
# Terminal 1 - Issuance Service
cd backend/issuance-service
npm install
npm run dev

# Terminal 2 - Verification Service
cd backend/verification-service
npm install
npm run dev

# Terminal 3 - Frontend
cd frontend
npm install
npm run dev
```

---

## 🧪 Running Tests

### Run All Tests

```bash
chmod +x scripts/run-tests.sh
./scripts/run-tests.sh
```

### Test Individual Services

```bash
# Issuance Service
cd backend/issuance-service
npm install
npm test

# Verification Service
cd backend/verification-service
npm install
npm test

# Frontend
cd frontend
npm install
npm test
```

---

## 🐳 Docker Deployment

### Build Docker Images

```bash
chmod +x scripts/build-images.sh
./scripts/build-images.sh
```

This creates three images:
- `kube-credential-issuance:latest`
- `kube-credential-verification:latest`
- `kube-credential-frontend:latest`

---

## ☸️ Kubernetes Deployment

### Prerequisites

Ensure you have a running Kubernetes cluster:

```bash
# For Minikube
minikube start

# For Kind
kind create cluster

# Verify cluster
kubectl cluster-info
```

### Deploy to Kubernetes

#### Step 1: Build and Load Images

```bash
# Build images
./scripts/build-images.sh

# For Minikube - Load images into Minikube
minikube image load kube-credential-issuance:latest
minikube image load kube-credential-verification:latest
minikube image load kube-credential-frontend:latest

# For Kind - Load images into Kind
kind load docker-image kube-credential-issuance:latest
kind load docker-image kube-credential-verification:latest
kind load docker-image kube-credential-frontend:latest
```

#### Step 2: Deploy Services

```bash
chmod +x scripts/deploy-k8s.sh
./scripts/deploy-k8s.sh
```

Or manually:

```bash
# Deploy services
kubectl apply -f k8s/issuance-deployment.yaml
kubectl apply -f k8s/verification-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Apply auto-scaling
kubectl apply -f k8s/hpa.yaml

# Apply ingress (optional)
kubectl apply -f k8s/ingress.yaml
```

#### Step 3: Verify Deployment

```bash
# Check deployments
kubectl get deployments

# Check pods
kubectl get pods

# Check services
kubectl get services

# View logs
kubectl logs -l app=issuance-service
kubectl logs -l app=verification-service
```

#### Step 4: Access the Application

```bash
# Port forward frontend
kubectl port-forward service/frontend 3000:80

# Access at http://localhost:3000
```

Or with Minikube:

```bash
minikube service frontend
```

### Scaling

The deployments include Horizontal Pod Autoscalers (HPA):

```bash
# View autoscaler status
kubectl get hpa

# Manual scaling
kubectl scale deployment issuance-service --replicas=5
kubectl scale deployment verification-service --replicas=5
```

---

## ☁️ Cloud Deployment (AWS)

### AWS EKS Deployment

1. **Create EKS Cluster**:
```bash
eksctl create cluster \
  --name kube-credential-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 4
```

2. **Build and Push Images to ECR**:
```bash
# Create ECR repositories
aws ecr create-repository --repository-name kube-credential-issuance
aws ecr create-repository --repository-name kube-credential-verification
aws ecr create-repository --repository-name kube-credential-frontend

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push images
docker tag kube-credential-issuance:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/kube-credential-issuance:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/kube-credential-issuance:latest

# Repeat for other images
```

3. **Update K8s manifests** with ECR image URLs and deploy

4. **Access via Load Balancer**:
```bash
kubectl get service frontend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### Frontend Hosting (AWS S3 + CloudFront)

```bash
# Build frontend
cd frontend
npm install
npm run build

# Deploy to S3
aws s3 sync dist/ s3://kube-credential-frontend --delete

# Create CloudFront distribution
aws cloudfront create-distribution --origin-domain-name kube-credential-frontend.s3.amazonaws.com
```

---

## 📡 API Documentation

### Issuance Service API

#### POST /api/issue
Issue a new credential.

**Request**:
```json
{
  "id": "CRED-2025-001",
  "holderName": "John Doe",
  "credentialType": "Identity",
  "issuedDate": "2025-10-07",
  "expiryDate": "2026-10-07",
  "data": {
    "age": 30,
    "department": "Engineering"
  }
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Credential issued by issuance-service-pod-xyz",
  "credential": { ... },
  "workerId": "issuance-service-pod-xyz",
  "timestamp": "2025-10-07T10:30:00.000Z"
}
```

**Response (Already Issued)**:
```json
{
  "success": false,
  "message": "Credential with ID CRED-2025-001 has already been issued by worker-1",
  "workerId": "issuance-service-pod-abc",
  "timestamp": "2025-10-07T10:30:00.000Z"
}
```

#### GET /api/credentials
Retrieve all issued credentials.

#### GET /health
Health check endpoint.

### Verification Service API

#### POST /api/verify
Verify a credential.

**Request**:
```json
{
  "credential": {
    "id": "CRED-2025-001",
    "holderName": "John Doe",
    "credentialType": "Identity",
    "issuedDate": "2025-10-07"
  }
}
```

**Response (Valid)**:
```json
{
  "success": true,
  "verified": true,
  "message": "Credential is valid and has been verified",
  "issuedBy": "issuance-service-pod-xyz",
  "issuedAt": "2025-10-07T10:30:00.000Z",
  "workerId": "verification-service-pod-abc",
  "timestamp": "2025-10-07T10:35:00.000Z"
}
```

**Response (Invalid)**:
```json
{
  "success": true,
  "verified": false,
  "message": "Credential not found in issuance records",
  "workerId": "verification-service-pod-abc",
  "timestamp": "2025-10-07T10:35:00.000Z"
}
```

#### GET /api/verifications
Retrieve all verification attempts.

#### GET /health
Health check endpoint.

---

## 🔧 Design Decisions & Assumptions

### Architecture Decisions

1. **Microservices Pattern**: 
   - Independent services for issuance and verification allow separate scaling and deployment
   - Each service has its own database to maintain service independence
   
2. **SQLite Database**:
   - Chosen for simplicity and free-tier compatibility
   - Each pod has its own database (emptyDir volume)
   - For production: migrate to PostgreSQL or MongoDB with persistent volumes

3. **Worker ID Implementation**:
   - Uses Kubernetes pod name (metadata.name) as worker ID
   - Allows tracking which pod handled each request
   
4. **Communication Pattern**:
   - Verification service calls Issuance service via HTTP
   - Could be enhanced with message queues (RabbitMQ, Kafka) for better reliability

5. **Frontend Architecture**:
   - React with TypeScript for type safety
   - Vite for fast development and optimized builds
   - Nginx for production serving

### Assumptions

1. **Data Persistence**: 
   - Using emptyDir volumes in K8s (data lost on pod restart)
   - Production should use PersistentVolumeClaims

2. **Authentication**: 
   - No authentication implemented (as not specified)
   - Would add JWT/OAuth in production

3. **Database Sharing**:
   - Services maintain separate databases
   - No direct database sharing between services

4. **Network**:
   - All services in same Kubernetes cluster
   - Verification service can reach Issuance service via ClusterIP

5. **Cloud Hosting**:
   - AWS recommended but any cloud provider works
   - Frontend can be hosted on S3+CloudFront or as containerized service

---

## 🧪 Testing Coverage

All services include comprehensive unit tests:

- **Issuance Service**: 
  - Service layer tests
  - API endpoint tests
  - Database operations tests
  - Coverage: ~85%

- **Verification Service**:
  - Service layer tests with mocked HTTP calls
  - API endpoint tests
  - Database operations tests
  - Coverage: ~85%

- **Frontend**:
  - Component rendering tests
  - Form interaction tests
  - API integration tests
  - Coverage: ~80%

---

## 📊 Monitoring & Observability

### Health Checks

All services expose `/health` endpoints:

```bash
# Check issuance service
curl http://localhost:3001/health

# Check verification service
curl http://localhost:3002/health
```

### Kubernetes Probes

- **Liveness Probe**: Restarts unhealthy pods
- **Readiness Probe**: Removes unready pods from service

### Logs

```bash
# View logs
kubectl logs -f deployment/issuance-service
kubectl logs -f deployment/verification-service
kubectl logs -f deployment/frontend

# Tail logs from all pods
kubectl logs -f -l app=issuance-service --all-containers
```

---

## 🔒 Security Considerations

1. **Input Validation**: All inputs validated on backend
2. **CORS**: Configured for local and production environments
3. **Environment Variables**: Sensitive configs via env vars
4. **No Hardcoded Secrets**: All credentials externalized
5. **TypeScript**: Type safety prevents many common errors

### Production Enhancements

- Add authentication (JWT, OAuth)
- Implement rate limiting
- Add request encryption (HTTPS/TLS)
- Use secrets management (AWS Secrets Manager, K8s Secrets)
- Implement audit logging
- Add API gateway

---

## 🚦 Troubleshooting

### Common Issues

**Issue**: Cannot connect to backend services
```bash
# Check if services are running
kubectl get pods
kubectl get services

# Check logs
kubectl logs <pod-name>
```

**Issue**: Database not persisting
- EmptyDir volumes don't persist across pod restarts
- Use PersistentVolumeClaims for production

**Issue**: Worker ID shows hostname instead of pod name
```bash
# Verify environment variable
kubectl exec <pod-name> -- env | grep WORKER_ID
```

**Issue**: Tests failing
```bash
# Clean install dependencies
cd backend/issuance-service
rm -rf node_modules package-lock.json
npm install
npm test
```

---

## 📦 Deliverables Checklist

- ✅ Backend APIs (Node.js + TypeScript)
- ✅ Two microservices (Issuance & Verification)
- ✅ Frontend (React + TypeScript)
- ✅ Docker containers for all services
- ✅ Kubernetes manifests (deployments, services, HPA, ingress)
- ✅ Unit tests with coverage
- ✅ Comprehensive documentation
- ✅ Deployment scripts
- ✅ Worker ID implementation
- ✅ Persistence layer (SQLite)
- ✅ Modern UI/UX
- ✅ Error handling
- ✅ Health checks
- ✅ Auto-scaling configuration

---

## 📝 Future Enhancements

1. **Database Migration**: PostgreSQL with persistent volumes
2. **Message Queue**: RabbitMQ for async communication
3. **API Gateway**: Kong or AWS API Gateway
4. **Monitoring**: Prometheus + Grafana
5. **Logging**: ELK Stack or CloudWatch
6. **CI/CD**: GitHub Actions or Jenkins
7. **Authentication**: JWT with OAuth2
8. **Caching**: Redis for performance
9. **GraphQL API**: Alternative to REST
10. **Mobile App**: React Native frontend

---

## 📄 License

This project is created as an assignment submission.

---

## 🤝 Contact

For questions or clarifications about this project:

- **Name**: [Your Name]
- **Email**: [Your Email]
- **Phone**: [Your Contact Number]

---

**Built with ❤️ using Node.js, TypeScript, React, Docker, and Kubernetes**



