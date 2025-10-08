# Testing Guide

## Overview

This document provides comprehensive testing instructions for the Kube Credential application.

---

## Test Coverage

- **Issuance Service**: ~85% coverage
- **Verification Service**: ~85% coverage
- **Frontend**: ~80% coverage

---

## Running Tests

### All Tests at Once

```bash
# From project root
chmod +x scripts/run-tests.sh
./scripts/run-tests.sh
```

### Individual Services

#### Issuance Service
```bash
cd backend/issuance-service
npm install
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm run test:watch

# Specific test file
npm test -- service.test.ts
```

#### Verification Service
```bash
cd backend/verification-service
npm install
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

#### Frontend
```bash
cd frontend
npm install
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

---

## Manual Testing

### Using the UI

1. **Start the application**:
```bash
docker-compose up
```

2. **Access frontend**: http://localhost:3000

3. **Test Issuance Flow**:
   - Navigate to "Issue Credential" page
   - Fill in credential details:
     - ID: `TEST-2025-001`
     - Holder Name: `John Doe`
     - Type: `Identity`
     - Issued Date: Select today's date
   - Click "Issue Credential"
   - Verify success message with worker ID

4. **Test Verification Flow**:
   - Navigate to "Verify Credential" page
   - Enter the same credential details
   - Click "Verify Credential"
   - Verify it shows as VALID with issuance details

5. **Test Duplicate Prevention**:
   - Go back to issuance page
   - Try issuing the same credential ID
   - Should show error: already issued

### Using curl

#### Issue a Credential

```bash
curl -X POST http://localhost:3001/api/issue \
  -H "Content-Type: application/json" \
  -d '{
    "id": "CURL-TEST-001",
    "holderName": "Jane Smith",
    "credentialType": "Driver License",
    "issuedDate": "2025-10-07",
    "expiryDate": "2030-10-07",
    "data": {
      "licenseNumber": "DL123456",
      "class": "C"
    }
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Credential issued by worker-xyz",
  "credential": { ... },
  "workerId": "worker-xyz",
  "timestamp": "2025-10-07T..."
}
```

#### Verify a Credential

```bash
curl -X POST http://localhost:3002/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "id": "CURL-TEST-001",
      "holderName": "Jane Smith",
      "credentialType": "Driver License",
      "issuedDate": "2025-10-07"
    }
  }'
```

Expected Response:
```json
{
  "success": true,
  "verified": true,
  "message": "Credential is valid and has been verified",
  "issuedBy": "worker-xyz",
  "issuedAt": "2025-10-07T...",
  "workerId": "worker-abc",
  "timestamp": "2025-10-07T..."
}
```

#### Test Invalid Credential

```bash
curl -X POST http://localhost:3002/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "id": "FAKE-001",
      "holderName": "Fake Person",
      "credentialType": "Fake",
      "issuedDate": "2025-10-07"
    }
  }'
```

Expected Response:
```json
{
  "success": true,
  "verified": false,
  "message": "Credential not found in issuance records",
  "workerId": "worker-abc",
  "timestamp": "2025-10-07T..."
}
```

#### Health Checks

```bash
# Issuance Service
curl http://localhost:3001/health

# Verification Service
curl http://localhost:3002/health
```

---

## Kubernetes Testing

### Test Worker ID Distribution

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/

# Issue multiple credentials and check worker distribution
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/issue \
    -H "Content-Type: application/json" \
    -d "{
      \"id\": \"TEST-$i\",
      \"holderName\": \"User $i\",
      \"credentialType\": \"Test\",
      \"issuedDate\": \"2025-10-07\"
    }"
done

# Check which workers handled requests
kubectl logs -l app=issuance-service
```

### Test Auto-Scaling

```bash
# Install metrics server (if not already)
minikube addons enable metrics-server

# Generate load
for i in {1..1000}; do
  curl -X POST http://localhost:3001/api/issue \
    -H "Content-Type: application/json" \
    -d "{
      \"id\": \"LOAD-TEST-$i\",
      \"holderName\": \"User $i\",
      \"credentialType\": \"Load Test\",
      \"issuedDate\": \"2025-10-07\"
    }" &
done

# Watch HPA scale pods
kubectl get hpa -w

# Watch pods being created
kubectl get pods -w
```

---

## Load Testing

### Using Apache Bench

```bash
# Install Apache Bench
brew install httpd  # macOS
sudo apt-get install apache2-utils  # Linux

# Test issuance endpoint
ab -n 1000 -c 10 -p test-credential.json -T application/json \
  http://localhost:3001/api/issue

# Create test-credential.json:
echo '{
  "id": "AB-TEST-001",
  "holderName": "Load Test User",
  "credentialType": "Load Test",
  "issuedDate": "2025-10-07"
}' > test-credential.json
```

### Using wrk

```bash
# Install wrk
brew install wrk

# Test throughput
wrk -t4 -c100 -d30s --latency http://localhost:3001/health

# Test with POST request
wrk -t4 -c100 -d30s -s post.lua http://localhost:3001/api/issue

# post.lua:
# wrk.method = "POST"
# wrk.body = '{"id":"WRK-TEST","holderName":"Test","credentialType":"Test","issuedDate":"2025-10-07"}'
# wrk.headers["Content-Type"] = "application/json"
```

---

## Test Scenarios

### Scenario 1: Complete Flow

```bash
# 1. Issue credential
ISSUE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/issue \
  -H "Content-Type: application/json" \
  -d '{
    "id": "SCENARIO-001",
    "holderName": "Test User",
    "credentialType": "Test",
    "issuedDate": "2025-10-07"
  }')

echo "Issue Response: $ISSUE_RESPONSE"

# 2. Verify credential
VERIFY_RESPONSE=$(curl -s -X POST http://localhost:3002/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "id": "SCENARIO-001",
      "holderName": "Test User",
      "credentialType": "Test",
      "issuedDate": "2025-10-07"
    }
  }')

echo "Verify Response: $VERIFY_RESPONSE"
```

### Scenario 2: Duplicate Prevention

```bash
# Issue credential
curl -X POST http://localhost:3001/api/issue \
  -H "Content-Type: application/json" \
  -d '{
    "id": "DUP-TEST-001",
    "holderName": "Test User",
    "credentialType": "Test",
    "issuedDate": "2025-10-07"
  }'

# Try to issue again (should fail)
curl -X POST http://localhost:3001/api/issue \
  -H "Content-Type: application/json" \
  -d '{
    "id": "DUP-TEST-001",
    "holderName": "Test User",
    "credentialType": "Test",
    "issuedDate": "2025-10-07"
  }'
```

### Scenario 3: Invalid Verification

```bash
# Verify with wrong details
curl -X POST http://localhost:3002/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "id": "DUP-TEST-001",
      "holderName": "Wrong Name",
      "credentialType": "Test",
      "issuedDate": "2025-10-07"
    }
  }'
```

### Scenario 4: Missing Fields

```bash
# Try to issue with missing fields
curl -X POST http://localhost:3001/api/issue \
  -H "Content-Type: application/json" \
  -d '{
    "id": "INCOMPLETE",
    "holderName": "Test User"
  }'
# Should return 400 Bad Request
```

---

## Continuous Integration Testing

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Test Issuance Service
        run: |
          cd backend/issuance-service
          npm install
          npm test
      
      - name: Test Verification Service
        run: |
          cd backend/verification-service
          npm install
          npm test
      
      - name: Test Frontend
        run: |
          cd frontend
          npm install
          npm test
```

---

## Debugging Tests

### Debug Individual Test

```bash
# Backend tests
cd backend/issuance-service
npm test -- --verbose service.test.ts

# Frontend tests
cd frontend
npm test -- --verbose IssuancePage.test.tsx
```

### Debug with Node Inspector

```bash
# Backend
cd backend/issuance-service
node --inspect-brk node_modules/.bin/jest --runInBand

# Then attach debugger in VS Code or Chrome DevTools
```

---

## Test Data

### Sample Credentials

```json
// Valid credential
{
  "id": "CRED-2025-001",
  "holderName": "John Doe",
  "credentialType": "Identity Card",
  "issuedDate": "2025-10-07",
  "expiryDate": "2030-10-07",
  "data": {
    "dateOfBirth": "1990-01-01",
    "nationality": "USA",
    "idNumber": "ID123456"
  }
}

// Driver License
{
  "id": "DL-2025-001",
  "holderName": "Jane Smith",
  "credentialType": "Driver License",
  "issuedDate": "2025-10-07",
  "expiryDate": "2028-10-07",
  "data": {
    "licenseNumber": "DL987654",
    "class": "C",
    "restrictions": "None"
  }
}

// Certificate
{
  "id": "CERT-2025-001",
  "holderName": "Bob Johnson",
  "credentialType": "Professional Certificate",
  "issuedDate": "2025-10-07",
  "data": {
    "certificationName": "AWS Solutions Architect",
    "level": "Professional",
    "score": "920"
  }
}
```

---

## Performance Benchmarks

Expected performance on standard hardware:

- **Issuance**: ~500 requests/second
- **Verification**: ~800 requests/second
- **Response Time**: < 50ms (p95)
- **Memory per Pod**: < 128MB
- **CPU per Pod**: < 0.1 cores

---

## Coverage Reports

After running tests with coverage:

```bash
# View coverage in terminal
npm test -- --coverage

# Generate HTML report
npm test -- --coverage --coverageReporters=html

# Open in browser
open coverage/index.html
```

---

## Troubleshooting Tests

**Issue: Tests timing out**
```bash
# Increase timeout
npm test -- --testTimeout=10000
```

**Issue: Port already in use**
```bash
# Kill process on port
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

**Issue: Database locked**
```bash
# Clean up test databases
find . -name "test-*.db" -delete
```

---

For more information, see the main [README.md](README.md) and [DEPLOYMENT.md](DEPLOYMENT.md)



