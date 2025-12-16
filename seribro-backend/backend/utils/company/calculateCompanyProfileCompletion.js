// calculateCompanyProfileCompletion.js
// Company profile ki completion percentage calculate karne ka utility function

/**
 * Company profile ki completion percentage calculate karta hai.
 * @param {Object} company - CompanyProfile document object.
 * @returns {{ percentage: number, profileComplete: boolean, missingFields: string[] }} - Percentage, completion status, aur missing fields.
 */
const calculateCompanyProfileCompletion = (company) => {
    // Total possible fields jo completion ke liye check honge
    const totalFields = 6;
    let completedFields = 0;
    const missingFields = [];

    // Har field ko check karte hain
    // 1. companyName
    if (company.companyName && company.companyName.trim().length > 0) {
        completedFields++;
    } else {
        missingFields.push('companyName');
    }

    // 2. mobile
    if (company.mobile && company.mobile.trim().length === 10) {
        completedFields++;
    } else {
        missingFields.push('mobile');
    }

    // 3. industryType
    if (company.industryType && company.industryType.trim().length > 0) {
        completedFields++;
    } else {
        missingFields.push('industryType');
    }

    // 4. logoUrl
    if (company.logoUrl && company.logoUrl.trim().length > 0) {
        completedFields++;
    } else {
        missingFields.push('logoUrl');
    }

    // 5. documents (kam se kam ek document hona chahiye)
    if (company.documents && company.documents.length > 0) {
        completedFields++;
    } else {
        missingFields.push('documents');
    }

    // 6. authorizedPerson - naam, designation, aur email sab hone chahiye
    if (
        company.authorizedPerson &&
        company.authorizedPerson.email &&
        company.authorizedPerson.email.trim().length > 0 &&
        company.authorizedPerson.name &&
        company.authorizedPerson.name.trim().length > 0 &&
        company.authorizedPerson.designation &&
        company.authorizedPerson.designation.trim().length > 0
    ) {
        completedFields++;
    } else {
        missingFields.push('authorizedPerson');
    }

    // Percentage calculate karna
    const percentage = Math.round((completedFields / totalFields) * 100);

    // Profile complete tabhi hoga jab saare required fields pure hon
    const profileComplete = completedFields === totalFields;

    return { percentage, profileComplete, missingFields };
};

module.exports = { calculateCompanyProfileCompletion };
