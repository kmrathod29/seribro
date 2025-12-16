// backend/utils/students/projectHelpers.js
// Student project helpers - Phase 4.2

/**
 * Hinglish: Student aur project ke skills ko compare karke match percentage calculate karna
 * @param {Array} studentSkills - Student ke skills (lowercase)
 * @param {Array} projectSkills - Project ke required skills (lowercase)
 * @returns {Number} Match percentage (0-100)
 */
exports.calculateSkillMatch = (studentSkills = [], projectSkills = []) => {
    // Agar project ko koi skills chahiye hi nahi
    if (!projectSkills || projectSkills.length === 0) {
        return 100;
    }

    // Skills ko lowercase mein convert karo comparison ke liye
    const normalizedStudentSkills = studentSkills.map((s) => s.toLowerCase());
    const normalizedProjectSkills = projectSkills.map((s) => s.toLowerCase());

    // Matched skills count karo
    const matchedCount = normalizedProjectSkills.filter((skill) =>
        normalizedStudentSkills.includes(skill)
    ).length;

    // Percentage calculate karo
    const percentage = Math.round((matchedCount / normalizedProjectSkills.length) * 100);

    return percentage;
};

/**
 * Hinglish: Check karo ki student ne is project mein pehle apply kiya hai ya nahi
 * @param {Object} Application - Application model
 * @param {String} studentId - Student ID
 * @param {String} projectId - Project ID
 * @returns {Boolean} True agar already applied, false otherwise
 */
exports.checkDuplicateApplication = async (Application, studentId, projectId) => {
    try {
        const existingApplication = await Application.findOne({
            studentId,
            projectId,
            status: { $ne: 'withdrawn' }, // Withdrawn applications ko ignore karo
        });

        return !!existingApplication;
    } catch (error) {
        console.error('Duplicate check error:', error);
        return false;
    }
};

/**
 * Hinglish: Get recommended projects based on student skills
 * @param {Array} studentSkills - Student ke skills
 * @param {Array} projects - Projects array
 * @returns {Array} Projects sorted by skill match (highest first)
 */
exports.getRecommendedProjects = (studentSkills = [], projects = []) => {
    // Calculate skill match for each project
    const scored = projects.map((project) => {
        const projectSkills = project.requiredSkills || [];
        const matchPercentage = exports.calculateSkillMatch(
            studentSkills.map((s) => s.toLowerCase()),
            projectSkills.map((s) => s.toLowerCase())
        );

        return {
            ...project,
            skillMatch: matchPercentage,
        };
    });

    // Sort by skill match percentage (highest first)
    return scored.sort((a, b) => b.skillMatch - a.skillMatch);
};

/**
 * Hinglish: Filter projects based on query parameters
 * @param {Array} projects - Projects array
 * @param {Object} filters - Filter object { skills, budgetMin, budgetMax, category, search }
 * @returns {Array} Filtered projects
 */
exports.filterProjects = (projects = [], filters = {}) => {
    let filtered = [...projects];

    // Skill filter
    if (filters.skills && filters.skills.length > 0) {
        filtered = filtered.filter((project) =>
            project.requiredSkills.some((skill) => filters.skills.includes(skill))
        );
    }

    // Budget filter
    if (filters.budgetMin !== undefined && filters.budgetMax !== undefined) {
        filtered = filtered.filter(
            (project) =>
                project.budgetMin >= filters.budgetMin && project.budgetMax <= filters.budgetMax
        );
    } else if (filters.budgetMin !== undefined) {
        filtered = filtered.filter((project) => project.budgetMin >= filters.budgetMin);
    } else if (filters.budgetMax !== undefined) {
        filtered = filtered.filter((project) => project.budgetMax <= filters.budgetMax);
    }

    // Category filter
    if (filters.category) {
        filtered = filtered.filter((project) => project.category === filters.category);
    }

    // Search filter
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
            (project) =>
                project.title.toLowerCase().includes(searchLower) ||
                project.description.toLowerCase().includes(searchLower)
        );
    }

    return filtered;
};

/**
 * Hinglish: Sort projects based on sorting option
 * @param {Array} projects - Projects array
 * @param {String} sortBy - Sort option (newest, deadline, budget-high, budget-low)
 * @returns {Array} Sorted projects
 */
exports.sortProjects = (projects = [], sortBy = 'newest') => {
    const sorted = [...projects];

    switch (sortBy) {
        case 'deadline':
            // Deadline soon first
            return sorted.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

        case 'budget-high':
            // Highest budget first
            return sorted.sort((a, b) => b.budgetMax - a.budgetMax);

        case 'budget-low':
            // Lowest budget first
            return sorted.sort((a, b) => a.budgetMin - b.budgetMin);

        case 'newest':
        default:
            // Newest first
            return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
};

/**
 * Hinglish: Calculate time remaining until deadline
 * @param {Date} deadline - Deadline date
 * @returns {Object} Days, hours, minutes, seconds remaining
 */
exports.getTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;

    if (diff <= 0) {
        return {
            expired: true,
            daysRemaining: 0,
            hoursRemaining: 0,
            minutesRemaining: 0,
            secondsRemaining: 0,
        };
    }

    const daysRemaining = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secondsRemaining = Math.floor((diff % (1000 * 60)) / 1000);

    return {
        expired: false,
        daysRemaining,
        hoursRemaining,
        minutesRemaining,
        secondsRemaining,
    };
};

/**
 * Hinglish: Format budget for display
 * @param {Number} budget - Budget amount
 * @returns {String} Formatted budget string (e.g., "₹10,000")
 */
exports.formatBudget = (budget) => {
    if (!budget) return '₹0';
    return '₹' + budget.toLocaleString('en-IN');
};

/**
 * Hinglish: Get skill match color based on percentage
 * @param {Number} percentage - Match percentage (0-100)
 * @returns {String} Color code (green, orange, gray)
 */
exports.getSkillMatchColor = (percentage) => {
    if (percentage >= 70) return 'green'; // Good match
    if (percentage >= 40) return 'orange'; // Partial match
    return 'gray'; // Poor match
};
