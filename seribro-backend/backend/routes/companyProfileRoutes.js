// backend/routes/companyProfileRoutes.js
const express = require('express');
const router = express.Router();

const { protect, roleCheck } = require('../middleware/authMiddleware');
const {
    initializeCompanyProfile, getCompanyProfile, updateBasicInfo, updateDetails,
    updateAuthorizedPerson, uploadLogo, uploadDocuments,
    submitForVerification, getCompanyDashboard,
} = require('../controllers/companyProfileController');
const {
    uploadLogo: logoUploader, uploadDocuments: documentsUploader,
} = require('../middleware/company/uploadMiddleware');
const {
    validateBasicInfo, validateAuthorizedPerson, validateDetails,
} = require('../middleware/company/validationMiddleware');

// Routes
router.post('/profile/init', protect, roleCheck('company'), initializeCompanyProfile);
router.get('/dashboard', protect, roleCheck('company'), getCompanyDashboard);
router.get('/profile', protect, roleCheck('company'), getCompanyProfile);
router.put('/profile/basic', protect, roleCheck('company'), validateBasicInfo, updateBasicInfo);
router.put('/profile/details', protect, roleCheck('company'), validateDetails, updateDetails);
router.put('/profile/person', protect, roleCheck('company'), validateAuthorizedPerson, updateAuthorizedPerson);
router.post('/profile/logo', protect, roleCheck('company'), logoUploader, uploadLogo);
router.post('/profile/documents', protect, roleCheck('company'), documentsUploader, uploadDocuments);
router.post('/profile/submit-verification', protect, roleCheck('company'), submitForVerification);

module.exports = router;