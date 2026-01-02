# Deployment Guide - SERIBRO Fixes

## Pre-Deployment Verification

### Step 1: Environment Setup
```bash
# Verify Node.js version
node --version
# Expected: v16+ 

# Verify npm version
npm --version
# Expected: v8+

# Install dependencies
cd seribro-frontend/client
npm install

cd ../../seribro-backend
npm install

# Verify no security vulnerabilities
npm audit
```

### Step 2: Build Verification
```bash
# Frontend build
cd seribro-frontend/client
npm run build
# Expected output: Build successful, files in dist/

# Check build artifacts
ls -la dist/
# Expected: index.html, assets/, manifest.json

# Backend doesn't need build (Node.js)
cd ../../seribro-backend
npm start --dry-run
# Expected: No startup errors
```

### Step 3: Database Verification
```bash
# Check MongoDB connection
mongosh --eval "db.adminCommand('ping')"
# Expected: { ok: 1 }

# Verify collections exist
mongosh
use seribro_db
show collections
# Expected output:
# applications
# messages
# payments
# projects
# users
# workSubmissions

# Create indexes if missing
db.payments.createIndex({ project: 1, createdAt: -1 })
db.payments.createIndex({ razorpayOrderId: 1 }, { unique: true })
db.messages.createIndex({ project: 1, createdAt: -1 })
db.messages.createIndex({ sender: 1 })
db.projects.createIndex({ status: 1 })
db.projects.createIndex({ assignedStudent: 1 })

exit
```

### Step 4: Configuration Verification
```bash
# Frontend config
cat seribro-frontend/client/.env
# Should have: VITE_API_URL, VITE_RAZORPAY_KEY_ID

# Backend config
cat seribro-backend/.env
# Should have:
# - PORT
# - MONGODB_URI
# - JWT_SECRET
# - RAZORPAY_KEY_ID
# - RAZORPAY_SECRET_KEY
# - CLOUDINARY_NAME
# - CLOUDINARY_API_KEY
# - CLOUDINARY_API_SECRET

# Verify no secrets in code
grep -r "sk_live_" seribro-backend/backend/
# Expected: (empty - no hardcoded secrets)

grep -r "mongodb://" seribro-backend/
grep -r "mongodb+srv://" seribro-backend/
# Expected: Only in .env, not in code files
```

---

## Deployment Procedure

### Option A: Development/Staging Deployment

#### Step 1: Stop Current Services
```bash
# Stop frontend dev server
# Press Ctrl+C in terminal running npm run dev

# Stop backend service
# Kill process on port 5000
netstat -ano | grep :5000
taskkill /PID <PID> /F

# Verify ports are free
netstat -ano | grep :5000
netstat -ano | grep :5173
# Expected: (empty)
```

#### Step 2: Update Code
```bash
# Pull latest changes
git pull origin main
# Expected: All commits downloaded

# Verify correct branch
git status
# Expected: "On branch main", "nothing to commit"

# View what changed
git log -1 --stat
# Expected: Shows PaymentPage.jsx, ProjectWorkspace.jsx, etc.
```

#### Step 3: Update Dependencies
```bash
# Frontend
cd seribro-frontend/client
npm install
npm run build
# Verify build completes with no errors

# Backend
cd ../../seribro-backend
npm install
# Verify no security vulnerabilities
npm audit fix --force
# Only if necessary
```

#### Step 4: Start Services
```bash
# Terminal 1: Start Backend
cd seribro-backend
npm start
# Expected: 
# Server running on port 5000
# MongoDB connection established
# Socket.io initialized
# No error messages

# Terminal 2: Start Frontend
cd seribro-frontend/client
npm run dev
# Expected:
# VITE v X.X.X ready in XXX ms
# Local: http://localhost:5173
# No error messages
```

#### Step 5: Smoke Test
```
In browser, navigate to:
http://localhost:5173

1. Check console for errors (F12 → Console tab)
   Expected: No red errors

2. Navigate to Student Dashboard
   Expected: Loads without errors

3. Navigate to Company Dashboard
   Expected: Loads without errors

4. Check Network tab (F12 → Network)
   Expected: API calls return 200 OK status
```

---

### Option B: Production Deployment (Using Docker/AWS)

#### Step 1: Build Docker Images
```bash
# Navigate to project root
cd seribro

# Build frontend image
docker build -t seribro-frontend:1.0.0 -f seribro-frontend/Dockerfile .

# Build backend image
docker build -t seribro-backend:1.0.0 -f seribro-backend/Dockerfile .

# Verify images created
docker images | grep seribro
# Expected: Two images listed with tag 1.0.0
```

#### Step 2: Push to Registry
```bash
# Tag for registry
docker tag seribro-frontend:1.0.0 myregistry.azurecr.io/seribro-frontend:1.0.0
docker tag seribro-backend:1.0.0 myregistry.azurecr.io/seribro-backend:1.0.0

# Push to Azure Container Registry (example)
az acr login --name myregistry
docker push myregistry.azurecr.io/seribro-frontend:1.0.0
docker push myregistry.azurecr.io/seribro-backend:1.0.0

# Verify pushed successfully
az acr repository list --name myregistry
# Expected: seribro-frontend, seribro-backend listed
```

#### Step 3: Deploy to Kubernetes/App Service
```bash
# Option 1: Azure App Service
az webapp deployment container config \
  --name seribro-frontend \
  --resource-group MyResourceGroup \
  --docker-registry-server-url https://myregistry.azurecr.io

az webapp deployment container config \
  --name seribro-backend \
  --resource-group MyResourceGroup \
  --docker-registry-server-url https://myregistry.azurecr.io

# Deploy images
az webapp create \
  --resource-group MyResourceGroup \
  --plan MyAppServicePlan \
  --name seribro-frontend \
  --deployment-container-image-name myregistry.azurecr.io/seribro-frontend:1.0.0

# Option 2: Kubernetes
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/backend-deployment.yaml

# Verify deployment
kubectl get pods
kubectl get services
```

#### Step 4: Environment Variables
```bash
# Set in Azure Portal or K8s ConfigMap
VITE_API_URL=https://api.seribro.com
VITE_RAZORPAY_KEY_ID=rzp_live_xxx

PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/seribro_db
JWT_SECRET=your-secret-key-here
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_SECRET_KEY=xxxxx
```

#### Step 5: Database Verification
```bash
# Connect to production database
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/seribro_db"

# Create required indexes
db.payments.createIndex({ project: 1, createdAt: -1 })
db.messages.createIndex({ project: 1, createdAt: -1 })

# Verify collections not empty
db.projects.countDocuments()
db.users.countDocuments()
```

---

## Post-Deployment Testing

### Step 1: Automated Tests
```bash
# Frontend tests
cd seribro-frontend/client
npm run test
# Expected: All tests pass

# Backend tests
cd ../../seribro-backend
npm run test
# Expected: All tests pass
```

### Step 2: Manual Testing - Payment Flow

**Scenario: Company approves student and makes payment**

1. **Login as Company**
   ```
   URL: https://seribro.com/login
   Email: company@example.com
   Password: company_password
   Expected: Dashboard loads
   ```

2. **View Application**
   ```
   URL: https://seribro.com/company/applications/[applicationId]
   Click "Approve" button
   Expected: Success toast, page navigates to payment
   ```

3. **Make Payment**
   ```
   URL: https://seribro.com/payment/[projectId]
   Check amount displays correctly
   Click "Pay Now" button
   Expected: Razorpay modal opens
   ```

4. **Complete Payment (Test Mode)**
   ```
   Razorpay Modal:
   Card Number: 4111 1111 1111 1111
   Expiry: 12/25
   CVV: 123
   Click "Pay" button
   Expected: Payment succeeds, redirects to workspace
   ```

### Step 3: Manual Testing - Messaging Flow

**Scenario: Users send messages without errors**

1. **Navigate to Workspace**
   ```
   URL: https://seribro.com/workspace/projects/[projectId]
   Expected: Page loads, message list visible
   ```

2. **Send Message**
   ```
   Type: "Hello, how's the project?"
   Click Send button
   Expected: Message appears in chat, no errors
   ```

3. **Test Error Handling**
   ```
   Disconnect internet (Network → Offline in F12)
   Type: "Test message"
   Click Send button
   Expected: Error toast appears, optimistic message removed
   Reconnect internet
   Click Send button again
   Expected: Message sends successfully
   ```

### Step 4: Manual Testing - Start Work Flow

**Scenario: Student starts work without page freeze**

1. **Login as Student**
   ```
   URL: https://seribro.com/login
   Email: student@example.com
   Password: student_password
   Expected: Dashboard loads
   ```

2. **Open Project Workspace**
   ```
   Click on assigned project
   URL: https://seribro.com/workspace/projects/[projectId]
   Expected: Workspace loads with "Start Work" button
   ```

3. **Click Start Work**
   ```
   Click "Start Work" button
   Expected: Button disables, loading indicator appears
   Wait for response (~2 seconds)
   Expected: Page updates showing "In Progress" status, button disappears
   Expected: NO page refresh required
   ```

### Step 5: Browser Console Check

Open Developer Tools (F12) and check:

```
Console Tab (top right, should show):
✓ No errors (red messages)
✓ No warnings (yellow messages)
✓ No "undefined" references
✓ No 404 errors

Network Tab (top, should show):
✓ All API calls return 200 or 201
✓ No 500 errors
✓ No failed requests
✓ Response times < 2 seconds

Application Tab (Cookies):
✓ JWT token stored
✓ User role visible
✓ No expired tokens
```

---

## Rollback Procedure

### If Critical Issues Detected

#### Option 1: Quick Rollback (Git)
```bash
# List recent commits
git log --oneline -n 5
# Output example:
# abc1234 Fix payment page and message board
# def5678 Previous stable version
# ghi9012 Earlier version

# Rollback to previous version
git reset --hard def5678
# Or if already pushed:
git revert abc1234

# Rebuild and restart
npm run build
npm start
```

#### Option 2: Docker Rollback
```bash
# List available images
docker images | grep seribro

# Stop current containers
docker stop seribro-frontend seribro-backend

# Run previous version
docker run -d -p 5173:5173 seribro-frontend:0.9.9
docker run -d -p 5000:5000 seribro-backend:0.9.9
```

#### Option 3: Kubernetes Rollback
```bash
# View rollout history
kubectl rollout history deployment/seribro-frontend
kubectl rollout history deployment/seribro-backend

# Rollback to previous version
kubectl rollout undo deployment/seribro-frontend
kubectl rollout undo deployment/seribro-backend

# Verify new pods are running
kubectl get pods
```

### Verification After Rollback
1. Check that old version loads
2. Test payment flow works
3. Test messaging works
4. Test start work button works
5. Monitor error rates for 1 hour
6. Collect user reports if any issues

---

## Monitoring & Alerts

### Set Up Logging
```bash
# Backend logs
tail -f logs/error.log
tail -f logs/access.log

# Frontend monitoring (Sentry or similar)
```

### Key Metrics to Monitor

```
1. Payment Success Rate
   Alert if < 98%
   Action: Check Razorpay API status

2. Message Send Success Rate
   Alert if < 99%
   Action: Check database connection

3. Error Rate
   Alert if > 0.5%
   Action: Check logs for errors

4. Response Time
   Alert if > 3 seconds
   Action: Check database/API performance

5. User Concurrent Sessions
   Alert if > 1000
   Action: Scale backend services
```

### Log Monitoring Commands
```bash
# Find payment errors
grep "payment" logs/error.log | tail -50

# Find message errors
grep "sendMessage" logs/error.log | tail -50

# Find start work errors
grep "start-work" logs/error.log | tail -50

# Count errors by type
grep "Error" logs/error.log | cut -d: -f2 | sort | uniq -c | sort -rn
```

---

## Success Criteria

After deployment, verify:

- [ ] Payment page loads without errors
- [ ] Payment amount displays correctly
- [ ] Razorpay modal opens and closes properly
- [ ] Payment verification works
- [ ] Message board doesn't crash
- [ ] Messages send without errors
- [ ] Optimistic messages appear and update
- [ ] Start work button doesn't freeze page
- [ ] Work status updates immediately
- [ ] No page refresh required
- [ ] All error messages display properly
- [ ] No console errors
- [ ] Database records created correctly
- [ ] Socket.io connections stable
- [ ] Response times acceptable

---

## Support Resources

### Common Issues & Solutions

**Issue: "Cannot read property 'paymentAmount' of undefined"**
- Cause: Project data not loaded
- Solution: Check MongoDB connection, verify project exists

**Issue: "Razorpay script not loading"**
- Cause: Script blocked by CSP or network issue
- Solution: Check Content Security Policy headers, add Razorpay domain to allowlist

**Issue: "Message fails to send silently"**
- Cause: API error not caught
- Solution: Check browser console, verify API endpoint responds

**Issue: "Start work button stays disabled"**
- Cause: loadWorkspace() taking too long or failing
- Solution: Check backend API logs, verify database queries are fast

### Debugging Commands

```bash
# Frontend: Enable verbose logging
localStorage.setItem('DEBUG', 'seribro:*')

# Backend: Enable detailed logs
DEBUG=seribro:* npm start

# Check API response
curl -X GET https://api.seribro.com/api/workspace/projects/[projectId]

# Monitor real-time Socket.io events
# In browser console:
socket.on('*', (event, data) => console.log(event, data))
```

### Contact Information
- Backend Issues: @dev-team-backend
- Frontend Issues: @dev-team-frontend
- Database Issues: @dba-team
- Infrastructure Issues: @devops-team
- Payment Issues: @razorpay-support

---

## Sign-Off

- [ ] Deployment pre-checks completed
- [ ] Build verified
- [ ] Database ready
- [ ] Configuration set
- [ ] Services started
- [ ] Smoke tests passed
- [ ] Full testing completed
- [ ] Monitoring configured
- [ ] Rollback procedure tested
- [ ] Ready for production

**Deployed By**: ________________
**Date**: ________________
**Version**: 1.0.0
**Estimated Rollout Time**: 15 minutes

