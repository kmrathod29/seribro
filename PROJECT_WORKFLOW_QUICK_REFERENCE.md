# 🚀 PROJECT WORKFLOW - QUICK REFERENCE & TESTING GUIDE

---

## 📱 QUICK START TESTING WORKFLOW

### ⚡ 5-Minute Complete Flow (From Start to Finish)

#### Prerequisites:
- Backend running: `npm start` (port 7000)
- Frontend running: `npm run dev` (port 5173)
- Two browser windows (or incognito) for Company & Student

---

## 1️⃣ COMPANY SIDE (10 minutes)

### Step 1: Login as Company
```
URL: http://localhost:5173/login

Credentials:
Email: company@example.com
Password: password123

Expected Result:
✅ Redirects to /company/dashboard
✅ Dashboard shows company name
✅ Quick links visible
```

### Step 2: Complete Profile (if needed)
```
URL: http://localhost:5173/company/profile

Check: Is profile 100% complete?
- Basic Info: ✅
- Company Details: ✅
- Authorized Person: ✅
- Logo: ✅
- Verification Docs: ✅

If NOT 100%: Complete remaining sections

Expected Result:
✅ Profile Completion: 100%
```

### Step 3: Post a Project
```
URL: http://localhost:5173/company/post-project

Fill Form:
├─ Title: "Build an AI Chatbot"
├─ Description: "Create an intelligent chatbot using GPT-4 and React. The chatbot should handle customer support queries and integrate with our existing CRM system."
├─ Category: "AI/ML"
├─ Required Skills: ["Python", "Machine Learning", "API Design", "React"]
├─ Budget Min: 10000
├─ Budget Max: 25000
├─ Duration: "60"
└─ Deadline: Select date 3 months from today

Click: "Post Project"

Expected Result:
✅ Message: "Project created successfully"
✅ Redirects to /company/projects
✅ Your new project appears in the list
✅ Status: "open"
```

### Step 4: View Your Project
```
URL: http://localhost:5173/company/projects

View Created Project:
├─ Title: "Build an AI Chatbot"
├─ Status Badge: "open" (blue)
├─ Budget: ₹10,000 - ₹25,000
├─ Applications: 0 (initially)
└─ Buttons: "View", "Edit", "Delete"

Click "View Details":
✅ See full project information
✅ See company details
```

---

## 2️⃣ STUDENT SIDE (15 minutes)

### Step 1: Login as Student
```
URL: http://localhost:5173/login

Credentials:
Email: student@example.com
Password: password123

Expected Result:
✅ Redirects to /student/dashboard
✅ Dashboard shows student name
✅ Quick links visible: Browse Projects, My Applications
```

### Step 2: Browse Projects
```
URL: http://localhost:5173/student/browse-projects

View Project List:
├─ Filter by Category: "AI/ML" ← Select this
├─ Filter by Budget: Min: 10000, Max: 30000
└─ See projects matching filters

Find: "Build an AI Chatbot"
├─ Company: (Company name)
├─ Budget: ₹10,000 - ₹25,000
├─ Skills: Python, Machine Learning, API Design, React
└─ Button: "Apply Now" or "View Details"

Click "View Details":
✅ See full project description
✅ See company profile
✅ Button: "Apply Now"
```

### Step 3: Apply to Project
```
Click "Apply Now" Button

Fill Application Form:
├─ Cover Letter: "I have 3 years of Python experience and 2 years with machine learning. I've built several AI chatbots using OpenAI's API. I'm confident I can deliver a production-ready solution within the timeline."
├─ Proposed Price: 15000
├─ Portfolio Link: https://github.com/student/projects
├─ Estimated Days: 50
└─ Click: "Submit Application"

Expected Result:
✅ Message: "Application submitted successfully"
✅ Redirects to /student/my-applications
✅ Your application appears with status: "PENDING"
```

### Step 4: Track Application
```
URL: http://localhost:5173/student/my-applications

View Application:
├─ Project: "Build an AI Chatbot"
├─ Company: (Company name)
├─ Status: "Pending" (yellow badge)
├─ Date Applied: Today
├─ Proposed Price: ₹15,000
└─ Buttons: "Withdraw" (if pending)

Expected Result:
✅ Application visible with all details
✅ Can withdraw if needed
```

---

## 3️⃣ COMPANY REVIEWS & ACCEPTS (5 minutes)

### Step 1: Check Notification
```
Company Browser Window:
Go to: http://localhost:5173/company/applications

OR refresh dashboard to see updated application count

Expected Result:
✅ Notification bell shows: "1"
✅ New application visible
```

### Step 2: View Applications
```
URL: http://localhost:5173/company/applications

View Application:
├─ Student Name: (Student name)
├─ Project: "Build an AI Chatbot"
├─ Status: "Pending"
├─ Proposed Price: ₹15,000
├─ Cover Letter Preview: "I have 3 years..."
└─ Buttons: "View Details", "Accept", "Reject"

Click "View Details":
✅ See full student profile
✅ See resume link
✅ See portfolio link
✅ See full cover letter
✅ See all application details
```

### Step 3: Accept Application
```
Click "Accept" Button

Expected Result:
✅ Message: "Student accepted successfully"
✅ Application Status: "Accepted"
✅ Project Status Changes: "open" → "assigned"
✅ Workspace automatically created! 🎉

Now the project appears at:
└─→ /workspace/projects/:projectId
```

### Step 4: View Created Workspace
```
URL: http://localhost:5173/workspace/projects/:projectId

Company Views:
├─ Project Overview
├─ Assigned Student Info:
│  ├─ Name
│  ├─ College
│  ├─ Skills
│  ├─ Profile Photo
│  └─ Resume Link
├─ Message Board (empty initially)
├─ Days Remaining
└─ Buttons: "Pay Now", "Rate Student" (after completion)

Expected Result:
✅ Workspace loads successfully
✅ Student info visible
✅ Message board ready
```

---

## 4️⃣ STUDENT WORKSPACE & WORK (20 minutes)

### Step 1: Check Notification
```
Student Browser Window:
Refresh or check notification bell

Expected Result:
✅ Notification: "You've been selected for Build an AI Chatbot!"
✅ Application status changed: "Pending" → "Accepted"
```

### Step 2: Enter Workspace
```
URL: http://localhost:5173/student/my-applications
Click: "Go to Workspace"

OR directly:
URL: http://localhost:5173/workspace/projects/:projectId

Student Views:
├─ Project Overview
├─ Company Info:
│  ├─ Company Name
│  ├─ Industry Type
│  ├─ Logo
│  └─ About
├─ Message Board (empty initially)
├─ Days Remaining
└─ Button: "Start Work" (blue)

Expected Result:
✅ Workspace loads
✅ Company info visible
✅ "Start Work" button visible
```

### Step 3: Start Work
```
Click "Start Work" Button

Expected Result:
✅ Message: "Work started successfully"
✅ Project Status: "open" → "in-progress"
✅ Button Changes: "Start Work" → "Submit Work"
✅ Student can now submit work
```

### Step 4: Send a Message (Optional)
```
In Message Board:
Type Message: "Hi! I've started working on the chatbot. I'll keep you updated on progress."

Click "Send" or press Enter

Expected Result:
✅ Message appears in board
✅ Sent immediately (real-time via Socket.IO)
✅ Timestamp visible
✅ Can attach files (Max 5MB, 3 files)
```

### Step 5: Submit Work
```
Click "Submit Work" Button

URL: http://localhost:5173/workspace/projects/:projectId/submit

Fill Submission Form:

1. Upload Files:
   ├─ Select file from computer
   ├─ (Example: chatbot.zip, documentation.pdf, etc.)
   └─ Max 3 files, 5MB each

2. Add Links:
   ├─ GitHub Repo: https://github.com/student/chatbot
   ├─ Live Demo: https://chatbot-demo.vercel.app
   └─ Portfolio: https://portfolio.com/projects/chatbot

3. Submission Message:
   └─ "Here's the completed AI chatbot with full documentation and unit tests. The chatbot achieves 94% accuracy on test data."

4. What Changed (if revision):
   └─ Leave empty for first submission

Click: "Submit Work"

Expected Result:
✅ Message: "Work submitted successfully"
✅ Redirects to workspace
✅ Project Status: "in-progress" → "submitted"
✅ Company notification: "Work submitted for review"
```

---

## 5️⃣ COMPANY REVIEWS & APPROVES (5 minutes)

### Step 1: Receive Notification
```
Company Browser Window:
Check notification bell

Expected Result:
✅ Notification: "Work submitted for 'Build an AI Chatbot'"
```

### Step 2: Review Submission
```
URL: http://localhost:5173/workspace/projects/:projectId/review

View Submission:
├─ Student Work:
│  ├─ Submitted Files:
│  │  ├─ chatbot.zip (can download/preview)
│  │  ├─ documentation.pdf
│  │  └─ (more files)
│  ├─ Links:
│  │  ├─ GitHub: https://github.com/...
│  │  ├─ Demo: https://chatbot-demo...
│  │  └─ Portfolio: https://portfolio...
│  │
│  ├─ Submission Message: "Here's the completed..."
│  ├─ Submitted Date & Time
│  │
│  └─ Submission History:
│     └─ #1 (current)
│
├─ Buttons:
│  ├─ "Approve" ✅ (Accept work as complete)
│  ├─ "Request Revision" 🔄 (Ask for changes)
│  └─ "Reject" ❌ (Decline project)
│
└─ Message Board (can communicate)

Expected Result:
✅ All submitted files visible
✅ Preview/download working
✅ All details clear
```

### Step 3: Approve Work
```
Click "Approve" Button

Expected Result:
✅ Message: "Work approved successfully"
✅ Submission Status: "submitted" → "approved"
✅ Project Status: "submitted" → "completed"
✅ Student notification: "Work approved!"
✅ Workspace becomes read-only (can still message)
✅ Can now rate student
```

### Step 4: Payment (Optional)
```
In workspace, if "Pay Now" button visible:

Click "Pay Now"
URL: /payment/:projectId

Razorpay Window Opens:
├─ Enter Card Details:
│  ├─ Card Number: 4111 1111 1111 1111 (test)
│  ├─ Expiry: 12/25
│  ├─ CVV: 123
│  └─ Name: Test User
│
└─ Click "PAY"

Expected Result:
✅ Payment processed
✅ Project.paymentStatus = "paid"
✅ Student can see earnings
```

---

## 6️⃣ RATING (5 minutes)

### Step 1: Student Rates Company
```
URL: http://localhost:5173/workspace/projects/:projectId/rate

Fill Rating Form:
├─ Star Rating: Click on 5th star
├─ Review Text: "Great company! Very professional and responsive. Clear requirements and good communication throughout the project."
├─ Would Recommend: "Yes"
└─ Click: "Submit Rating"

Expected Result:
✅ Rating submitted
✅ Company can see review on profile
```

### Step 2: Company Rates Student
```
(Same URL as above)

Fill Rating Form:
├─ Star Rating: Click on 5th star
├─ Review Text: "Excellent work! The student delivered exactly what we needed and was very professional throughout."
├─ Would Rehire: "Yes"
└─ Click: "Submit Rating"

Expected Result:
✅ Rating submitted
✅ Student can see review on profile
✅ Project shows on both profiles
✅ ✅ WORKFLOW COMPLETE!
```

---

## 📊 STATUS VERIFICATION CHECKLIST

### After Each Step, Verify:

#### After Company Posts Project:
```
✅ Project appears in /company/projects
✅ Project appears in /student/browse-projects
✅ Status = "open"
✅ Company can view project details
✅ Company can edit (if open)
✅ Company can delete (if no applications)
```

#### After Student Applies:
```
✅ Application appears in /student/my-applications
✅ Status = "pending"
✅ Company gets notification
✅ Application appears in /company/applications
✅ Can view student details
✅ Can accept or reject
```

#### After Company Accepts:
```
✅ Application status = "accepted"
✅ Project status = "assigned"
✅ Other applications auto-rejected
✅ Workspace created
✅ /workspace/projects/:projectId accessible
✅ Student notified
✅ All other applicants notified of rejection
```

#### After Student Starts Work:
```
✅ Project status = "in-progress"
✅ "Start Work" button changes to "Submit Work"
✅ Message board active
✅ Can send messages
✅ Can upload files
✅ Can see company online status
```

#### After Student Submits:
```
✅ Project status = "submitted"
✅ Submission visible in /workspace/projects/:id/review
✅ Files downloadable/previewable
✅ All links working
✅ Company notified
✅ Workspace shows submission
```

#### After Company Approves:
```
✅ Project status = "completed"
✅ Submission status = "approved"
✅ Student notified
✅ Student can now rate company
✅ Company can rate student
✅ Payment can be processed
```

#### After Payment:
```
✅ Project.paymentStatus = "paid"
✅ Student sees earning in /student/payments
✅ Total earnings updated
```

#### After Rating:
```
✅ Project.ratingCompleted = true
✅ Both ratings visible
✅ Projects appear on both profiles
✅ Ratings visible on both profiles
✅ ✅ WORKFLOW COMPLETE
```

---

## 🐛 TROUBLESHOOTING COMMON ISSUES

### Issue 1: Can't Post Project
```
Error: "Please complete your profile 100% to post projects"

Solution:
✅ Go to /company/profile
✅ Check completion percentage
✅ Fill any missing sections:
   ├─ Basic Info
   ├─ Company Details
   ├─ Authorized Person
   ├─ Logo
   └─ Verification Documents
✅ Submit
✅ Try posting again
```

### Issue 2: Can't See Workspace
```
Error: "Workspace not found" or "Access Denied"

Solutions:
✅ Are you logged in as the right person?
   └─ Only company owner or assigned student can see workspace
✅ Has the company accepted the application?
   └─ Project must be status = "assigned"
✅ Are you using the correct URL?
   └─ /workspace/projects/:projectId (with actual project ID)
✅ Check browser console for errors (F12)
```

### Issue 3: Message Board Not Working
```
Error: Messages not appearing or Socket.io error

Solutions:
✅ Is backend running? (Port 7000)
   └─ Check Terminal: "Socket.io ready for real-time connections"
✅ Refresh the page
✅ Check browser console (F12):
   └─ Look for Socket.io connection messages
✅ Check backend server logs for errors
```

### Issue 4: File Upload Failing
```
Error: "Failed to upload file" or "File too large"

Solutions:
✅ File size must be < 5MB
✅ Maximum 3 files per submission
✅ Supported types:
   ├─ Images: .jpg, .png, .gif, .webp
   ├─ Documents: .pdf, .doc, .docx
   ├─ Archives: .zip, .rar
   ├─ Code: .js, .py, .ts, etc.
   └─ Others
✅ Check file format is supported
```

### Issue 5: Payment Not Processing
```
Error: Payment failed or timeout

Solutions:
✅ Use test card: 4111 1111 1111 1111
✅ Use future expiry date: 12/25
✅ Use any 3-digit CVV: 123
✅ Is Razorpay script loaded?
   └─ Check in index.html: <script src="https://checkout.razorpay.com...">
✅ Check backend logs for payment endpoint errors
```

### Issue 6: White Page / 404 Error
```
Error: Page shows blank or 404

Solutions:
✅ Are you logged in?
   └─ If not, /workspace routes redirect to /login
✅ Is the route correct?
   └─ Example: /workspace/projects/507f1f77bcf86cd799439011
   └─ Replace with actual project ID
✅ Does the project exist?
   └─ Check database
✅ Check browser console (F12) for errors
```

---

## 🔑 KEY API ENDPOINTS FOR TESTING

### Using Postman or cURL:

```
# Company Posts Project
POST http://localhost:7000/api/company/projects/create
Headers: Authorization: Bearer {token}
Body: {
  "title": "Build AI Chatbot",
  "description": "...",
  "category": "AI/ML",
  "requiredSkills": ["Python", "ML"],
  "budgetMin": 10000,
  "budgetMax": 25000,
  "projectDuration": "60",
  "deadline": "2025-08-15T00:00:00Z"
}

# Student Apply
POST http://localhost:7000/api/student/projects/:projectId/apply
Headers: Authorization: Bearer {token}
Body: {
  "proposalText": "I have 3 years...",
  "proposedPrice": 15000,
  "portfolioLink": "https://...",
  "estimatedDays": 50
}

# Company Accept Application
POST http://localhost:7000/api/company/applications/:applicationId/approve
Headers: Authorization: Bearer {token}

# Get Workspace
GET http://localhost:7000/api/workspace/projects/:projectId
Headers: Authorization: Bearer {token}

# Send Message
POST http://localhost:7000/api/workspace/projects/:projectId/messages
Headers: Authorization: Bearer {token}
Body: {
  "message": "Hello!"
}

# Submit Work
POST http://localhost:7000/api/workspace/projects/:projectId/submit-work
Headers: Authorization: Bearer {token}
Body: FormData with files and fields

# Approve Work
POST http://localhost:7000/api/workspace/projects/:projectId/approve-work
Headers: Authorization: Bearer {token}

# Create Payment
POST http://localhost:7000/api/payments/create-order
Headers: Authorization: Bearer {token}
Body: {
  "projectId": "507f...",
  "amount": 15000
}

# Rate Company
POST http://localhost:7000/api/ratings/projects/:projectId/rate-company
Headers: Authorization: Bearer {token}
Body: {
  "rating": 5,
  "review": "Great!",
  "wouldRecommend": true
}
```

---

## 📈 WORKFLOW TIMING

**Typical Complete Workflow:**

```
Day 0:  Company posts project (5 min)
Day 0:  Student browses and applies (10 min)
Day 1:  Company reviews and accepts (3 min)
        ↓ Workspace created
Day 1:  Student starts work (1 min)
Day 5:  Student works on project (can take days/weeks)
Day 10: Student submits (5 min)
Day 10: Company reviews submission (5 min)
Day 10: Company approves (1 min)
Day 10: Company pays (2 min)
Day 11: Student rates company (2 min)
Day 11: Company rates student (2 min)
        ↓ Workflow Complete!

Total Active Time: ~45 minutes spread over 11 days
```

---

## 🎓 SUMMARY

This workflow enables:
✅ Companies to post projects and hire students
✅ Students to apply and submit work
✅ Real-time communication via messaging
✅ Payment processing
✅ Rating and review system
✅ Complete project portfolio tracking

All with proper status tracking, notifications, and access control!

---

**Last Updated:** January 1, 2026
**Test Environment:** Local Development
**Scope:** Complete workflow from posting to completion
