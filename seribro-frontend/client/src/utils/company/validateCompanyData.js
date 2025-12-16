// frontend/src/utils/company/validateCompanyData.js
// Company Data Validation for Frontend

import { isValidGST } from './validateGSTNumber';

/**
 * Validates complete company profile data
 * 
 * @param {object} companyData - Company profile data
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateCompanyData = (companyData) => {
    const errors = {};

    // Validate Company Name
    if (!companyData.companyName || companyData.companyName.trim().length === 0) {
        errors.companyName = 'Company ka naam zaroori hai';
    } else if (companyData.companyName.trim().length < 2) {
        errors.companyName = 'Company ka naam kam se kam 2 akshar ka hona chahiye';
    }

    // Validate Mobile Number
    if (!companyData.mobile || companyData.mobile.trim().length === 0) {
        errors.mobile = 'Mobile number zaroori hai';
    } else if (!/^\d{10}$/.test(companyData.mobile.trim())) {
        errors.mobile = 'Mobile number exactly 10 digits ka hona chahiye';
    }

    // Validate Industry Type
    if (!companyData.industryType || companyData.industryType.trim().length === 0) {
        errors.industryType = 'Industry type select karna zaroori hai';
    }

    // Validate Company Size
    if (!companyData.companySize || companyData.companySize.trim().length === 0) {
        errors.companySize = 'Company size select karna zaroori hai';
    }

    // Validate GST Number (optional but if provided, must be valid)
    if (companyData.gstNumber && companyData.gstNumber.trim().length > 0) {
        if (!isValidGST(companyData.gstNumber)) {
            errors.gstNumber = 'GST number format galat hai. Format: 27ABCPA1234H1Z0';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

/**
 * Validates basic company info
 * 
 * @param {object} basicInfo - Basic info object
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateBasicCompanyInfo = (basicInfo) => {
    const errors = {};

    if (!basicInfo.companyName || basicInfo.companyName.trim().length < 2) {
        errors.companyName = 'Company ka naam kam se kam 2 akshar ka hona chahiye';
    }

    if (!basicInfo.mobile || !/^\d{10}$/.test(basicInfo.mobile)) {
        errors.mobile = 'Mobile number 10 digits ka hona chahiye';
    }

    if (basicInfo.website && basicInfo.website.trim().length > 0) {
        if (!/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(basicInfo.website)) {
            errors.website = 'Website URL format galat hai';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

/**
 * Validates authorized person data
 * 
 * @param {object} authorizedPerson - Authorized person object
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateAuthorizedPersonData = (authorizedPerson) => {
    const errors = {};

    if (!authorizedPerson.name || authorizedPerson.name.trim().length < 2) {
        errors.name = 'Naam kam se kam 2 akshar ka hona chahiye';
    }

    if (!authorizedPerson.designation || authorizedPerson.designation.trim().length === 0) {
        errors.designation = 'Designation zaroori hai';
    }

    if (!authorizedPerson.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorizedPerson.email)) {
        errors.email = 'Valid email address zaroori hai';
    }

    if (authorizedPerson.linkedIn && authorizedPerson.linkedIn.trim().length > 0) {
        if (!/^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+\/?$/.test(authorizedPerson.linkedIn)) {
            errors.linkedIn = 'LinkedIn URL format galat hai';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};
