#!/bin/bash

# Run all tests

echo "Running Kube Credential Tests..."
echo "================================="

# Test Issuance Service
echo ""
echo "Testing Issuance Service..."
cd backend/issuance-service
npm install
npm test
ISSUANCE_TEST_RESULT=$?
cd ../..

# Test Verification Service
echo ""
echo "Testing Verification Service..."
cd backend/verification-service
npm install
npm test
VERIFICATION_TEST_RESULT=$?
cd ../..

# Test Frontend
echo ""
echo "Testing Frontend..."
cd frontend
npm install
npm test
FRONTEND_TEST_RESULT=$?
cd ..

# Summary
echo ""
echo "================================="
echo "Test Summary:"
echo "================================="

if [ $ISSUANCE_TEST_RESULT -eq 0 ]; then
    echo "✅ Issuance Service: PASSED"
else
    echo "❌ Issuance Service: FAILED"
fi

if [ $VERIFICATION_TEST_RESULT -eq 0 ]; then
    echo "✅ Verification Service: PASSED"
else
    echo "❌ Verification Service: FAILED"
fi

if [ $FRONTEND_TEST_RESULT -eq 0 ]; then
    echo "✅ Frontend: PASSED"
else
    echo "❌ Frontend: FAILED"
fi

# Exit with error if any tests failed
if [ $ISSUANCE_TEST_RESULT -ne 0 ] || [ $VERIFICATION_TEST_RESULT -ne 0 ] || [ $FRONTEND_TEST_RESULT -ne 0 ]; then
    exit 1
fi

echo ""
echo "✅ All tests passed!"



