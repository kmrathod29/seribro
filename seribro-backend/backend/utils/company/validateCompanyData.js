// backend/utils/company/validateCompanyData.js
// Company Data Validation Utility

const { isValidGST } = require('./validateGSTNumber');

/**
 * Validates complete company profile data
 * Used for form submissions and profile verification
 * 
 * @param {object} companyData - Company profile data
 * @param {string} companyData.companyName - Company name
 * @param {string} companyData.mobile - Mobile number
 * @param {string} companyData.industryType - Industry type
 * @param {string} companyData.companySize - Company size
 * @param {string} companyData.gstNumber - GST number (optional)
 * @param {object} companyData.authorizedPerson - Authorized person object
 * @param {object} companyData.officeAddress - Office address object
 * @returns {object} - { isValid: boolean, errors: array }
 */
const validateCompanyData = (companyData) => {
    const errors = [];

    // Validate Company Name
    if (!companyData.companyName || companyData.companyName.trim().length === 0) {
        errors.push({
            field: 'companyName',
            message: 'Company ka naam zaroori hai',
        });
    } else if (companyData.companyName.trim().length < 2) {
        errors.push({
            field: 'companyName',
            message: 'Company ka naam kam se kam 2 akshar ka hona chahiye',
        });
    }

    // Validate Mobile Number
    if (!companyData.mobile || companyData.mobile.trim().length === 0) {
        errors.push({
            field: 'mobile',
            message: 'Mobile number zaroori hai',
        });
    } else if (!/^\d{10}$/.test(companyData.mobile.trim())) {
        errors.push({
            field: 'mobile',
            message: 'Mobile number exactly 10 digits ka hona chahiye',
        });
    }

    // Validate Industry Type
    if (!companyData.industryType || companyData.industryType.trim().length === 0) {
        errors.push({
            field: 'industryType',
            message: 'Industry type select karna zaroori hai',
        });
    }

    // Validate Company Size
    if (!companyData.companySize || companyData.companySize.trim().length === 0) {
        errors.push({
            field: 'companySize',
            message: 'Company size select karna zaroori hai',
        });
    }

    // Validate GST Number (optional but if provided, must be valid)
    if (companyData.gstNumber && companyData.gstNumber.trim().length > 0) {
        if (!isValidGST(companyData.gstNumber)) {
            errors.push({
                field: 'gstNumber',
                message: 'GST number format galat hai. Format: 27ABCPA1234H1Z0',
            });
        }
    }

    // Validate Authorized Person
    if (!companyData.authorizedPerson) {
        errors.push({
            field: 'authorizedPerson',
            message: 'Authorized person ki jaankari zaroori hai',
        });
    } else {
        // Validate AP Name
        if (!companyData.authorizedPerson.name || companyData.authorizedPerson.name.trim().length === 0) {
            errors.push({
                field: 'authorizedPerson.name',
                message: 'Authorized person ka naam zaroori hai',
            });
        } else if (companyData.authorizedPerson.name.trim().length < 2) {
            errors.push({
                field: 'authorizedPerson.name',
                message: 'Naam kam se kam 2 akshar ka hona chahiye',
            });
        }

        // Validate AP Designation
        if (!companyData.authorizedPerson.designation || companyData.authorizedPerson.designation.trim().length === 0) {
            errors.push({
                field: 'authorizedPerson.designation',
                message: 'Designation zaroori hai',
            });
        }

        // Validate AP Email
        if (!companyData.authorizedPerson.email || companyData.authorizedPerson.email.trim().length === 0) {
            errors.push({
                field: 'authorizedPerson.email',
                message: 'Authorized person ka email zaroori hai',
            });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyData.authorizedPerson.email)) {
            errors.push({
                field: 'authorizedPerson.email',
                message: 'Email format galat hai',
            });
        }

        // Validate AP LinkedIn (optional but if provided, must be valid)
        if (companyData.authorizedPerson.linkedIn && companyData.authorizedPerson.linkedIn.trim().length > 0) {
            if (!/^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+\/?$/.test(companyData.authorizedPerson.linkedIn)) {
                errors.push({
                    field: 'authorizedPerson.linkedIn',
                    message: 'LinkedIn URL format galat hai',
                });
            }
        }
    }

    // Validate Office Address (optional but if provided, must have city and state)
    if (companyData.officeAddress) {
        if (!companyData.officeAddress.city || companyData.officeAddress.city.trim().length === 0) {
            errors.push({
                field: 'officeAddress.city',
                message: 'City zaroori hai',
            });
        }

        if (!companyData.officeAddress.state || companyData.officeAddress.state.trim().length === 0) {
            errors.push({
                field: 'officeAddress.state',
                message: 'State zaroori hai',
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Validates basic company info for updates
 * 
 * @param {object} basicInfo - Basic info object
 * @returns {object} - { isValid: boolean, errors: array }
 */
const validateBasicCompanyInfo = (basicInfo) => {
    const errors = [];

    if (!basicInfo.companyName || basicInfo.companyName.trim().length < 2) {
        errors.push({
            field: 'companyName',
            message: 'Company ka naam kam se kam 2 akshar ka hona chahiye',
        });
    }

    if (!basicInfo.mobile || !/^\d{10}$/.test(basicInfo.mobile)) {
        errors.push({
            field: 'mobile',
            message: 'Mobile number 10 digits ka hona chahiye',
        });
    }

    if (basicInfo.website && basicInfo.website.trim().length > 0) {
        if (!/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(basicInfo.website)) {
            errors.push({
                field: 'website',
                message: 'Website URL format galat hai',
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Validates authorized person data
 * 
 * @param {object} authorizedPerson - Authorized person object
 * @returns {object} - { isValid: boolean, errors: array }
 */
const validateAuthorizedPersonData = (authorizedPerson) => {
    const errors = [];

    if (!authorizedPerson.name || authorizedPerson.name.trim().length < 2) {
        errors.push({
            field: 'name',
            message: 'Naam kam se kam 2 akshar ka hona chahiye',
        });
    }

    if (!authorizedPerson.designation || authorizedPerson.designation.trim().length === 0) {
        errors.push({
            field: 'designation',
            message: 'Designation zaroori hai',
        });
    }

    if (!authorizedPerson.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorizedPerson.email)) {
        errors.push({
            field: 'email',
            message: 'Valid email address zaroori hai',
        });
    }

    if (authorizedPerson.linkedIn && authorizedPerson.linkedIn.trim().length > 0) {
        if (!/^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+\/?$/.test(authorizedPerson.linkedIn)) {
            errors.push({
                field: 'linkedIn',
                message: 'LinkedIn URL format galat hai',
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

module.exports = {
    validateCompanyData,
    validateBasicCompanyInfo,
    validateAuthorizedPersonData,
};
