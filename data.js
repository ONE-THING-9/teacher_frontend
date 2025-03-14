// Data configuration for the form elements
const formData = {
    classes: [6, 7, 8, 9, 10, 12],
    subjects: ["Chemistry", "Physics"],
    boards: ["CBSE", "ICSE"],
    defaultUserId: "testing" // Default user ID for API calls
};

// Sample data for dropdowns
const classOptions = [
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12"
];

const boardOptions = [
    "CBSE",
    "ICSE",
    "State Board"
];

const subjectOptions = {
    "Class 9": ["Mathematics", "Science", "English", "Social Studies"],
    "Class 10": ["Mathematics", "Science", "English", "Social Studies"],
    "Class 11": ["Physics", "Chemistry", "Biology", "Mathematics", "Computer Science"],
    "Class 12": ["Physics", "Chemistry", "Biology", "Mathematics", "Computer Science"]
};

// Make data available globally
window.appData = {
    classOptions,
    boardOptions,
    subjectOptions
}; 