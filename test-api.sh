#!/bin/bash

# ========================================
# Portfolio Backend API Test Script
# ========================================
# This script tests all endpoints of your API
# Usage: chmod +x test-api.sh && ./test-api.sh

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Configuration
API_URL="${1:-http://localhost:5000}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Portfolio Backend API Test Suite${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Testing API at: ${YELLOW}${API_URL}${NC}\n"

# ========================================
# Test 1: Root Endpoint
# ========================================
echo -e "${YELLOW}Test 1: Root Endpoint${NC}"
echo "GET ${API_URL}/"
response=$(curl -s "${API_URL}/")
if [[ $response == *"Portfolio API"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - Root endpoint responding\n"
else
    echo -e "${RED}✗ FAIL${NC} - Root endpoint not responding\n"
fi

# ========================================
# Test 2: Health Check
# ========================================
echo -e "${YELLOW}Test 2: Health Check${NC}"
echo "GET ${API_URL}/api/health"
response=$(curl -s "${API_URL}/api/health")
if [[ $response == *"\"success\":true"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - Health check successful"
    echo "Response: ${response}\n"
else
    echo -e "${RED}✗ FAIL${NC} - Health check failed"
    echo "Response: ${response}\n"
fi

# ========================================
# Test 3: Contact Health Check
# ========================================
echo -e "${YELLOW}Test 3: Contact Route Health${NC}"
echo "GET ${API_URL}/api/contact/health"
response=$(curl -s "${API_URL}/api/contact/health")
if [[ $response == *"\"success\":true"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - Contact route healthy"
    echo "Response: ${response}\n"
else
    echo -e "${RED}✗ FAIL${NC} - Contact route unhealthy"
    echo "Response: ${response}\n"
fi

# ========================================
# Test 4: Valid Contact Form Submission
# ========================================
echo -e "${YELLOW}Test 4: Valid Contact Submission${NC}"
echo "POST ${API_URL}/api/contact (with valid data)"
response=$(curl -s -X POST "${API_URL}/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "organization": "Test Organization",
    "message": "This is a test message from the automated test script. If you receive this email, your API is working perfectly!"
  }')
if [[ $response == *"\"success\":true"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - Contact form submitted successfully"
    echo "Response: ${response}"
    echo -e "${GREEN}Check your email for the notification!${NC}\n"
else
    echo -e "${RED}✗ FAIL${NC} - Contact form submission failed"
    echo "Response: ${response}\n"
fi

# ========================================
# Test 5: Validation - Missing Name
# ========================================
echo -e "${YELLOW}Test 5: Validation - Missing Name${NC}"
echo "POST ${API_URL}/api/contact (missing name)"
response=$(curl -s -X POST "${API_URL}/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "message": "Test message"
  }')
if [[ $response == *"\"success\":false"* ]] && [[ $response == *"name"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - Validation working (name required)"
    echo "Response: ${response}\n"
else
    echo -e "${RED}✗ FAIL${NC} - Validation not working properly"
    echo "Response: ${response}\n"
fi

# ========================================
# Test 6: Validation - Invalid Email
# ========================================
echo -e "${YELLOW}Test 6: Validation - Invalid Email${NC}"
echo "POST ${API_URL}/api/contact (invalid email)"
response=$(curl -s -X POST "${API_URL}/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "not-an-email",
    "message": "Test message"
  }')
if [[ $response == *"\"success\":false"* ]] && [[ $response == *"email"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - Email validation working"
    echo "Response: ${response}\n"
else
    echo -e "${RED}✗ FAIL${NC} - Email validation not working"
    echo "Response: ${response}\n"
fi

# ========================================
# Test 7: Validation - Message Too Short
# ========================================
echo -e "${YELLOW}Test 7: Validation - Message Too Short${NC}"
echo "POST ${API_URL}/api/contact (message too short)"
response=$(curl -s -X POST "${API_URL}/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Hi"
  }')
if [[ $response == *"\"success\":false"* ]] && [[ $response == *"message"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - Message length validation working"
    echo "Response: ${response}\n"
else
    echo -e "${RED}✗ FAIL${NC} - Message length validation not working"
    echo "Response: ${response}\n"
fi

# ========================================
# Test 8: Rate Limiting (Optional - slow)
# ========================================
echo -e "${YELLOW}Test 8: Rate Limiting (Optional)${NC}"
echo "This test sends 6 requests quickly to test rate limiting."
read -p "Run rate limit test? This will take ~30 seconds. (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Sending 6 requests..."
    
    success_count=0
    rate_limited=false
    
    for i in {1..6}; do
        response=$(curl -s -X POST "${API_URL}/api/contact" \
          -H "Content-Type: application/json" \
          -d "{
            \"name\": \"Test User $i\",
            \"email\": \"test$i@example.com\",
            \"message\": \"Rate limit test message number $i. Please ignore this automated test.\"
          }")
        
        if [[ $response == *"\"success\":true"* ]]; then
            ((success_count++))
            echo "  Request $i: ${GREEN}Success${NC}"
        else
            if [[ $response == *"Too many"* ]]; then
                rate_limited=true
                echo "  Request $i: ${YELLOW}Rate Limited${NC}"
            else
                echo "  Request $i: ${RED}Failed${NC}"
            fi
        fi
        sleep 0.5
    done
    
    if [[ $rate_limited == true ]]; then
        echo -e "${GREEN}✓ PASS${NC} - Rate limiting is working"
        echo "Successfully submitted $success_count requests before rate limit kicked in\n"
    else
        echo -e "${YELLOW}⚠ WARNING${NC} - Rate limiting may not be configured"
        echo "All 6 requests succeeded without rate limiting\n"
    fi
else
    echo -e "${BLUE}Skipped rate limiting test${NC}\n"
fi

# ========================================
# Test 9: 404 Not Found
# ========================================
echo -e "${YELLOW}Test 9: 404 Not Found${NC}"
echo "GET ${API_URL}/api/nonexistent"
response=$(curl -s "${API_URL}/api/nonexistent")
if [[ $response == *"Not Found"* ]] || [[ $response == *"404"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - 404 handler working"
    echo "Response: ${response}\n"
else
    echo -e "${YELLOW}⚠ WARNING${NC} - 404 handler may not be properly configured"
    echo "Response: ${response}\n"
fi

# ========================================
# Summary
# ========================================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Suite Complete${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${GREEN}Next Steps:${NC}"
echo "1. Check your email for test message notifications"
echo "2. Verify messages in MongoDB Atlas (Browse Collections)"
echo "3. Review server logs for any errors"
echo "4. Test from your actual frontend application"
echo ""
echo -e "${YELLOW}Production Deployment:${NC}"
echo "Once all tests pass, you're ready to deploy to Render.com!"
echo "See DEPLOYMENT-GUIDE.md for detailed instructions."
echo ""

# ========================================
# Additional Information
# ========================================
echo -e "${BLUE}Useful Commands:${NC}"
echo "• View logs: Check your terminal where 'npm run dev' is running"
echo "• MongoDB: https://cloud.mongodb.com → Browse Collections"
echo "• Test from browser console: See QUICK-START.md for examples"
echo ""
