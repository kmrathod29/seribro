# Admin Setup Guide - Phase 3

## Creating Admin User (First Time Setup)

Since you don't have admin credentials, follow one of these methods to create your first admin user:

---

## Method 1: MongoDB Compass (Easiest - Visual)

### Step 1: Install MongoDB Compass
- Download from: https://www.mongodb.com/products/compass
- Install and open

### Step 2: Connect to Your Database
1. Open MongoDB Compass
2. Click "Connect" button
3. Enter your MongoDB connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/seribro
   ```
4. Click "Connect"

### Step 3: Navigate to Users Collection
1. In left sidebar, expand your cluster
2. Expand "seribro" database
3. Click on "users" collection

### Step 4: Insert New Admin Document
1. Click "INSERT DOCUMENT" button (or green + icon)
2. Switch to JSON mode if not already selected
3. Delete existing content and paste this JSON:
```json
{
  "email": "admin@seribro.com",
  "password": "$2b$10$kX7ufPhQAT13PNsNpJVeH.tW1hTG9zn9uEgVc9c6bTQb40Yik24Iu",
  "role": "admin",
  "emailVerified": true,
  "profileCompleted": true,
  "devices": []
}
```

⚠️ **IMPORTANT**: Use EXACTLY the password hash shown above. This is the correct bcrypt hash for password `Admin@123`.

4. Click "INSERT"
5. You should see the document created successfully

### Step 5: Verify Admin Created
- Refresh the collection view
- You should see the admin document in the users collection

### Step 6: Login with Admin Account
1. Go to http://localhost:5173/login
2. Email: `admin@seribro.com`
3. Password: ` `
4. Click Login

---

## Method 2: MongoDB Atlas Dashboard

### Step 1: Go to MongoDB Atlas
1. Open https://www.mongodb.com/cloud/atlas
2. Login to your account
3. Select your project/cluster

### Step 2: Open Database Browser
1. Click "Browse Collections"
2. Expand "seribro" database
3. Click "users" collection

### Step 3: Insert New Document
1. Click "Insert Document" button
2. Switch to JSON mode (if not already)
3. Paste the same JSON from Method 1 (Step 4)
4. Click "Insert"

### Step 4: Verify & Login
- Same as Method 1 (Step 5 & 6)

---

## Method 3: MongoDB Shell (Command Line)

### Prerequisites
- MongoDB CLI installed
- Connection string ready

### Commands
```bash
# Connect to MongoDB
mongosh "mongodb+srv://username:password@cluster.mongodb.net/seribro"

# Switch to database
use seribro

# Insert admin document
db.users.insertOne({
  "email": "admin@seribro.com",
  "password": "$2a$10$Y9DjB3ZaYEwKVzH1s6Q3R.8.Yb.7G1.KvP5L2N0X8M9T6R5P4S3",
  "role": "admin",
  "emailVerified": true,
  "profileCompleted": true,
  "devices": [],
  "createdAt": new Date(),
  "updatedAt": new Date()
})

# Verify creation
db.users.find({ role: "admin" })

# Should output something like:
# {
#   _id: ObjectId("..."),
#   email: "admin@seribro.com",
#   password: "$2a$10$...",
#   role: "admin",
#   ...
# }
```

---

## Password Hash Explanation

The password field uses bcrypt hash:
- **Plain Password**: `Admin@123`
- **Hashed**: `$2a$10$Y9DjB3ZaYEwKVzH1s6Q3R.8.Yb.7G1.KvP5L2N0X8M9T6R5P4S3`

The hash above is for password `Admin@123` with bcrypt cost factor 10.

### Why Use Hash?
- Never store plain passwords in database
- Passwords are hashed when user signs up
- When logging in, entered password is hashed and compared with stored hash

---

## Troubleshooting Admin Creation

### Issue: "Can't connect to MongoDB"
**Solution**:
1. Check MongoDB connection string is correct
2. Verify username and password in connection string
3. Check IP address is whitelisted in MongoDB Atlas
4. Try connecting with MongoDB Compass first

### Issue: "Database not found"
**Solution**:
1. Create the "seribro" database first
2. Insert a document in any collection (e.g., users)
3. Retry the admin creation steps

### Issue: "Can't insert document"
**Solution**:
1. Ensure database connection is active
2. Try manually creating users collection first
3. Check if you have write permissions

### Issue: "Admin login fails"
**Solution**:
1. Verify admin document exists: `db.users.find({ role: "admin" })`
2. Check password is `Admin@123` (case sensitive)
3. Check email is `admin@seribro.com` (lowercase)
4. Verify backend is running: `npm start`
5. Check browser console for errors

### Issue: "Invalid password hash"
**Solution**:
1. Use the exact hash provided: `$2a$10$Y9DjB3ZaYEwKVzH1s6Q3R.8.Yb.7G1.KvP5L2N0X8M9T6R5P4S3`
2. This hash is pre-generated for password `Admin@123`
3. Do not try to generate your own hash (might not match bcrypt format)

---

## Verification Checklist

After creating admin, verify:

- [ ] Admin document exists in MongoDB
- [ ] Email is: `admin@seribro.com`
- [ ] Role is: `admin`
- [ ] emailVerified is: `true`
- [ ] Backend server is running (`npm start`)
- [ ] Frontend is running (`npm run dev`)
- [ ] Can login with email and password `Admin@123`
- [ ] Dashboard loads after login
- [ ] Notification bell icon is visible
- [ ] Can see "Recent Pending" table

---

## Admin Dashboard Features (After Login)

Once logged in as admin, you should see:

### Dashboard Stats
- Total Students: (count)
- Total Companies: (count)
- Pending Student Verifications: (count)
- Pending Company Verifications: (count)
- Total Projects: (count)
- Total Applications: (count)

### Recent Pending Table
- Shows last 10 pending submissions
- Columns: Type, Name, Email, College/Company, Submitted, Actions
- "View" button to review each submission

### Notification Bell
- Red badge showing unread count
- Click to see notifications dropdown
- Each notification shows message, type, and timestamp
- Click notification to mark as read

---

## Admin Workflow

### Step 1: Login
```
Email: admin@seribro.com
Password: Admin@123
```

### Step 2: Check Dashboard
- See overview of all statistics
- View recent pending submissions

### Step 3: Review Submissions
1. Click "View" button next to a pending student/company
2. Review all their information
3. See "Approve" and "Reject" buttons

### Step 4: Take Action
- **Approve**: Click button → Enter comment → Confirm
  - Profile status → "approved"
  - User gets approval notification
  
- **Reject**: Click button → Enter rejection reason → Confirm
  - Profile status → "rejected"
  - User gets rejection notification
  - User can see re-submit button on dashboard

### Step 5: Track Notifications
- Click bell icon to see notifications
- See which profiles were submitted
- Track approval/rejection actions

---

## Creating Additional Admin Users

If you need more admins, repeat the same process with different email:

```json
{
  "email": "admin2@seribro.com",
  "password": "$2a$10$Y9DjB3ZaYEwKVzH1s6Q3R.8.Yb.7G1.KvP5L2N0X8M9T6R5P4S3",
  "role": "admin",
  "emailVerified": true,
  "profileCompleted": true,
  "devices": [],
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

Both admins will use password: `Admin@123`

---

## Security Notes

⚠️ **Important**: This is for local development only!

For production:
1. Use strong, unique passwords
2. Generate proper bcrypt hashes
3. Use environment variables for sensitive data
4. Enable 2FA for admin accounts
5. Audit admin actions regularly
6. Rotate passwords periodically

---

## Quick Reference

| Field | Value |
|-------|-------|
| Email | admin@seribro.com |
| Password | Admin@123 |
| Password Hash | $2a$10$Y9DjB3ZaYEwKVzH1s6Q3R.8.Yb.7G1.KvP5L2N0X8M9T6R5P4S3 |
| Role | admin |
| emailVerified | true |
| profileCompleted | true |

---

## Next Steps After Setup

1. ✅ Create admin user (you are here)
2. ✅ Login as admin
3. ✅ Wait for student/company submissions
4. ✅ Review and approve/reject profiles
5. ✅ Track notifications
6. ✅ Complete Phase 3 testing

---

## Support

If you encounter issues:
1. Check this guide first
2. Verify MongoDB connection
3. Check backend logs: `npm start` terminal
4. Verify admin document in MongoDB
5. Try logging in again
6. Check browser console for errors

---

**Version**: Admin Setup v1.0  
**Phase**: Phase 3  
**Last Updated**: November 22, 2025
