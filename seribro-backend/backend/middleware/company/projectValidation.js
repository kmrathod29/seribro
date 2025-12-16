// backend/middleware/company/projectValidation.js
// Project creation aur update ke liye validation middleware - Phase 4.1

// @desc    Validate project creation data
// @middleware
const validateProjectCreation = (req, res, next) => {
    const { title, description, category, requiredSkills, budgetMin, budgetMax, projectDuration, deadline } = req.body;

    const errors = [];

    // Title validation
    if (!title || !title.trim()) {
        errors.push('Project title zaroori hai');
    } else if (title.length < 5) {
        errors.push('Title kam se kam 5 characters ka hona chahiye');
    } else if (title.length > 100) {
        errors.push('Title 100 characters se zyada nahi ho sakta');
    }

    // Description validation
    if (!description || !description.trim()) {
        errors.push('Project description zaroori hai');
    } else if (description.length < 20) {
        errors.push('Description kam se kam 20 characters ka hona chahiye');
    } else if (description.length > 5000) {
        errors.push('Description 5000 characters se zyada nahi ho sakta');
    }

    // Category validation
    const validCategories = [
        'Web Development',
        'Mobile Development',
        'Data Science',
        'AI/ML',
        'Cloud & DevOps',
        'Backend Development',
        'Frontend Development',
        'Full Stack',
        'Blockchain',
        'IoT',
        'Cybersecurity',
        'Other',
    ];

    if (!category || !validCategories.includes(category)) {
        errors.push(`Valid category select karna zaroori hai. Valid options: ${validCategories.join(', ')}`);
    }

    // Required skills validation
    if (!requiredSkills || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
        errors.push('Kam se kam ek required skill add karna zaroori hai');
    } else {
        // Check karo agar koi empty skill hai
        const hasEmptySkill = requiredSkills.some((skill) => !skill || !skill.trim());
        if (hasEmptySkill) {
            errors.push('Koi bhi skill empty nahi ho sakta');
        }
    }

    // Budget validation
    const budgetMinNum = parseFloat(budgetMin);
    const budgetMaxNum = parseFloat(budgetMax);

    if (isNaN(budgetMinNum) || budgetMinNum < 0) {
        errors.push('Minimum budget valid number hona chahiye aur negative nahi');
    }

    if (isNaN(budgetMaxNum) || budgetMaxNum < 0) {
        errors.push('Maximum budget valid number hona chahiye aur negative nahi');
    }

    if (!isNaN(budgetMinNum) && !isNaN(budgetMaxNum) && budgetMinNum > budgetMaxNum) {
        errors.push('Minimum budget, maximum budget se zyada nahi ho sakta');
    }

    // Project duration validation
    const validDurations = ['1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months', '1 year'];
    if (!projectDuration || !validDurations.includes(projectDuration)) {
        errors.push(`Valid project duration select karna zaroori hai. Valid options: ${validDurations.join(', ')}`);
    }

    // Deadline validation
    if (!deadline) {
        errors.push('Deadline zaroori hai');
    } else {
        const deadlineDate = new Date(deadline);
        const now = new Date();

        if (isNaN(deadlineDate.getTime())) {
            errors.push('Invalid deadline format');
        } else if (deadlineDate <= now) {
            errors.push('Deadline future ki date honi chahiye');
        }
    }

    // Agar koi error hai to return karo
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors,
        });
    }

    next();
};

// @desc    Validate project update data
// @middleware
const validateProjectUpdate = (req, res, next) => {
    // Update sirf optional fields ke saath aata hai, to validate karo jo provide ho

    const { title, description, category, requiredSkills, budgetMin, budgetMax, projectDuration, deadline } = req.body;

    const errors = [];

    // Title validation (if provided)
    if (title !== undefined && title !== null) {
        if (!title.trim()) {
            errors.push('Project title empty nahi ho sakta');
        } else if (title.length < 5) {
            errors.push('Title kam se kam 5 characters ka hona chahiye');
        } else if (title.length > 100) {
            errors.push('Title 100 characters se zyada nahi ho sakta');
        }
    }

    // Description validation (if provided)
    if (description !== undefined && description !== null) {
        if (!description.trim()) {
            errors.push('Project description empty nahi ho sakta');
        } else if (description.length < 20) {
            errors.push('Description kam se kam 20 characters ka hona chahiye');
        } else if (description.length > 5000) {
            errors.push('Description 5000 characters se zyada nahi ho sakta');
        }
    }

    // Category validation (if provided)
    if (category) {
        const validCategories = [
            'Web Development',
            'Mobile Development',
            'Data Science',
            'AI/ML',
            'Cloud & DevOps',
            'Backend Development',
            'Frontend Development',
            'Full Stack',
            'Blockchain',
            'IoT',
            'Cybersecurity',
            'Other',
        ];

        if (!validCategories.includes(category)) {
            errors.push(`Valid category select karna zaroori hai. Valid options: ${validCategories.join(', ')}`);
        }
    }

    // Required skills validation (if provided)
    if (requiredSkills !== undefined && requiredSkills !== null) {
        if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
            errors.push('Kam se kam ek required skill zaroori hai');
        } else {
            const hasEmptySkill = requiredSkills.some((skill) => !skill || !skill.trim());
            if (hasEmptySkill) {
                errors.push('Koi bhi skill empty nahi ho sakta');
            }
        }
    }

    // Budget validation (if provided)
    if ((budgetMin !== undefined && budgetMin !== null) || (budgetMax !== undefined && budgetMax !== null)) {
        const budgetMinNum = budgetMin !== undefined ? parseFloat(budgetMin) : null;
        const budgetMaxNum = budgetMax !== undefined ? parseFloat(budgetMax) : null;

        if (budgetMinNum !== null && (isNaN(budgetMinNum) || budgetMinNum < 0)) {
            errors.push('Minimum budget valid number hona chahiye aur negative nahi');
        }

        if (budgetMaxNum !== null && (isNaN(budgetMaxNum) || budgetMaxNum < 0)) {
            errors.push('Maximum budget valid number hona chahiye aur negative nahi');
        }

        if (budgetMinNum !== null && budgetMaxNum !== null && budgetMinNum > budgetMaxNum) {
            errors.push('Minimum budget, maximum budget se zyada nahi ho sakta');
        }
    }

    // Project duration validation (if provided)
    if (projectDuration) {
        const validDurations = ['1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months', '1 year'];
        if (!validDurations.includes(projectDuration)) {
            errors.push(`Valid project duration select karna zaroori hai. Valid options: ${validDurations.join(', ')}`);
        }
    }

    // Deadline validation (if provided)
    if (deadline !== undefined && deadline !== null) {
        const deadlineDate = new Date(deadline);
        const now = new Date();

        if (isNaN(deadlineDate.getTime())) {
            errors.push('Invalid deadline format');
        } else if (deadlineDate <= now) {
            errors.push('Deadline future ki date honi chahiye');
        }
    }

    // Agar error hai to return karo
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors,
        });
    }

    next();
};

module.exports = { validateProjectCreation, validateProjectUpdate };
