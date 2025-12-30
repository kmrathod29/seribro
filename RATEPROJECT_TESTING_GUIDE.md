# RateProject.jsx - Quick Start & Testing Guide

## 🚀 Quick Start

### Component Location
```
seribro-frontend/client/src/pages/workspace/RateProject.jsx
```

### How to Access
1. Navigate to a completed project workspace
2. Click "Rate Project" button in project page
3. Route: `/workspace/projects/:projectId/rate`

---

## 🧪 Testing Workflow

### Step 1: Initial Rating (New User)
```
1. Access a completed project page
2. Click "Rate Project"
3. See two-column layout:
   - Left: Project summary (sticky)
   - Right: Empty rating form
4. Select stars (1-5)
5. Type review (min 10 chars)
6. Expand guidelines section
7. Check confirmation checkbox
8. Click "Submit Rating"
9. See success screen
10. Auto-redirect after 2 seconds
```

### Step 2: View Rating (Existing)
```
1. Return to same project
2. Click "Rate Project"
3. See read-only view:
   - Display existing rating
   - Show review text
   - Display rating date
   - Show "Edit Rating" button (if within 24h)
4. Review shows badges and styling
```

### Step 3: Edit Rating (Within 24h)
```
1. In read-only view, click "Edit Rating"
2. Form becomes active with existing values
3. Change star rating
4. Modify review text
5. Check guidelines again
6. Click "Update Rating"
7. Success message appears
8. Redirect back to project
```

### Step 4: After 24 Hours
```
1. Try to edit after 24 hours
2. See disabled edit button
3. View shows rating locked message
4. Info cards explain edit window
```

---

## 🔍 Key Features to Verify

### ✅ Star Rating
- [ ] 1-5 stars selectable by clicking
- [ ] Hover preview works
- [ ] Labels display: "Poor", "Below Average", "Average", "Good", "Excellent"
- [ ] Rating badge shows number and label
- [ ] Keyboard navigation works (arrow keys)

### ✅ Review Textarea
- [ ] Character counter updates (0-1000)
- [ ] Role-based placeholder text appears
- [ ] Validation message shows when ready
- [ ] Red text shows when insufficient characters
- [ ] Green text shows when ready to submit

### ✅ Guidelines Section
- [ ] Click header to expand/collapse
- [ ] Chevron icon updates (up/down)
- [ ] Content reveals with transition
- [ ] Checkbox available when expanded
- [ ] Checkbox state persists in editing

### ✅ Form Validation
- [ ] Submit button disabled until:
  - Stars selected
  - Review has 10+ chars
  - Guidelines accepted
- [ ] Submit button enables when all valid
- [ ] Disabled button shows grayed out
- [ ] Error toast on missing required fields

### ✅ Submission Flow
- [ ] Click submit shows spinner
- [ ] Button text changes to "Submitting..."
- [ ] After success, green checkmark shows
- [ ] "Rating Submitted!" message displays
- [ ] Auto-redirects after ~2 seconds

### ✅ Edit Window
- [ ] Edit button only shows if < 24h passed
- [ ] Blue banner shows time remaining
- [ ] Timer format: "X hours Y minutes"
- [ ] Timer updates every minute
- [ ] After 24h, button disappears
- [ ] Read-only message appears

### ✅ Responsiveness
- [ ] Mobile: Single column, form full width
- [ ] Tablet: Single column stacked layout
- [ ] Desktop: Three columns with sticky sidebar
- [ ] All buttons/inputs touch-friendly
- [ ] Text readable on all sizes

### ✅ Styling
- [ ] Dark theme matches app (slate colors)
- [ ] Amber accent buttons (matching theme)
- [ ] Proper spacing and padding
- [ ] Icons render correctly
- [ ] Status badges display properly
- [ ] Gradients apply smoothly

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot rate" error
**Solution**: Verify project status is "completed" in backend

### Issue: Edit button doesn't appear
**Solution**: Check if it's been more than 24 hours since original rating

### Issue: Submit button stays disabled
**Solution**: Ensure:
- At least 1 star selected
- Review has 10+ characters
- Guidelines checkbox is checked

### Issue: Toast notifications not showing
**Solution**: Verify react-toastify is installed and provider is in App.jsx

### Issue: Form fields look disabled
**Solution**: Normal for read-only view; click "Edit Rating" to enable

### Issue: Redirect doesn't happen
**Solution**: Check browser console for errors; verify project ID is valid

---

## 📊 Testing Data Points

### Test Case: New Rating Submission
```
Input:
- Project ID: [valid project ID]
- Role: company (testing company rating student)
- Stars: 5
- Review: "Excellent work! Very professional and delivered on time."

Expected:
- Success toast appears
- Redirect to project page
- Rating saved in database
```

### Test Case: Edit Existing Rating
```
Input:
- Existing rating: 3 stars
- New stars: 4
- New review: "Actually, the work was better than expected"

Expected:
- Form pre-fills with existing values
- Update succeeds
- Timestamp updated (but original ratedAt preserved)
- Edit button disappears if 24h passed
```

### Test Case: Mobile Responsiveness
```
Environment: iPhone 12 Safari
Expected:
- Single column layout
- Project summary at top
- Form below
- All buttons full width
- No horizontal scroll
```

---

## 🔧 Debugging Tips

### Check Console
```javascript
// Look for errors related to:
// 1. API calls (401, 403, 404)
// 2. Component mounting
// 3. Toast notifications
// 4. Router navigation
```

### Network Tab
```
Check requests:
1. GET /api/workspace/overview/:projectId
2. GET /api/ratings/projects/:projectId
3. POST /api/ratings/projects/:projectId/rate-student
4. POST /api/ratings/projects/:projectId/rate-company
```

### Component State
```javascript
// Add console.log to check states:
console.log({ project, rating, review, existingRating, canEditRating })
```

### Backend Logs
```
Look for:
1. Authentication success/failure
2. Authorization checks
3. Rating creation/update success
4. Validation errors
5. Database operations
```

---

## 📈 Performance Tips

1. **Image Optimization**: Project images should be optimized
2. **API Caching**: Consider caching project data
3. **Lazy Loading**: Guidelines section is collapsible to save initial render
4. **Debouncing**: Character counter updates instantly (acceptable for input)

---

## ♿ Accessibility Testing

### Keyboard Navigation
```
Tab through:
1. Back button
2. Star rating (arrow keys to change)
3. Review textarea
4. Guidelines expand button
5. Guidelines checkbox
6. Submit button
7. Cancel button

All should work without mouse
```

### Screen Reader
```
Verify:
1. Proper ARIA labels on stars
2. Form labels associated with inputs
3. Button purposes clear
4. Error messages announced
5. Success state announced
```

### Color Contrast
```
Check:
1. Text readable on dark background
2. Buttons have sufficient contrast
3. Disabled states distinguishable
4. Icon colors accessible
```

---

## 📝 Example API Responses

### Get Project Rating (No rating yet)
```json
{
  "success": true,
  "message": "No ratings yet",
  "data": {
    "rating": null
  }
}
```

### Get Project Rating (With rating)
```json
{
  "success": true,
  "message": "Rating fetched",
  "data": {
    "rating": {
      "_id": "507f1f77bcf86cd799439011",
      "project": "507f1f77bcf86cd799439012",
      "studentRating": {
        "rating": 4,
        "review": "Great company to work with!",
        "ratedAt": "2024-12-29T10:00:00Z",
        "ratedBy": "507f1f77bcf86cd799439013"
      },
      "companyRating": {
        "rating": 5,
        "review": "Excellent work quality",
        "ratedAt": "2024-12-29T11:00:00Z",
        "ratedBy": "507f1f77bcf86cd799439014"
      },
      "bothRated": true
    }
  }
}
```

### Submit Rating Success
```json
{
  "success": true,
  "message": "Rating submitted successfully",
  "data": {
    "rating": { ... },
    "studentNewRating": 4.5
  }
}
```

---

## ✨ Feature Highlights to Demo

1. **Two-Column Responsive Layout** - Shows desktop vs mobile
2. **Interactive Star Rating** - Hover and click stars, see labels
3. **Collapsible Guidelines** - Click to expand/collapse
4. **Real-time Validation** - Type review, watch counter and validation
5. **Loading States** - See spinner during submission
6. **Success Confirmation** - Checkmark and message
7. **Read-Only View** - See existing rating display
8. **Edit Functionality** - Edit within 24 hours
9. **Countdown Timer** - See time remaining
10. **Mobile Responsiveness** - View on phone screen

---

## 🎯 Success Criteria

✅ Component renders without errors
✅ Form validation works correctly
✅ API calls succeed and return expected data
✅ UI updates reflect API responses
✅ Redirect happens after successful submission
✅ Read-only view displays when rating exists
✅ Edit button appears within 24 hours
✅ Timer counts down correctly
✅ Design matches existing theme
✅ Mobile responsive at all breakpoints
✅ Accessibility features functional
✅ All user interactions work smoothly

---

## 📞 Integration Checklist

Before production deployment:

- [ ] Backend endpoints tested and working
- [ ] Authentication properly configured
- [ ] Environment variables set (.env file)
- [ ] Toast notifications integrated
- [ ] Router configured with /rate route
- [ ] API base URL correctly set
- [ ] Database migrations run
- [ ] Seed data for testing created
- [ ] Error handling tested
- [ ] Performance acceptable on slow networks
- [ ] Mobile testing completed
- [ ] Accessibility audit passed
- [ ] Cross-browser testing done
- [ ] Documentation updated
- [ ] Team notified of feature
- [ ] Monitoring/logging configured

---

## 🚀 Deployment

```bash
# Frontend
cd seribro-frontend
npm install  # if new dependencies
npm run dev  # test locally
npm run build  # build for production

# Backend
cd seribro-backend
npm install  # if new dependencies
npm start  # test locally
# Deploy to production server
```

---

## 📞 Support & Questions

For any issues during implementation:
1. Check this guide first
2. Review console errors
3. Check network tab for API issues
4. Verify backend is running
5. Confirm user has proper roles/permissions
6. Test with different user accounts
7. Review backend logs for errors

Happy rating! 🌟
