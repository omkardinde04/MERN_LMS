// API utility functions
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = () => {
    const user = localStorage.getItem('user');
    if (user) {
        try {
            const parsed = JSON.parse(user);
            return parsed.token || parsed.accessToken;
        } catch (e) {
            return null;
        }
    }
    return null;
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
};

// Auth API
export const authAPI = {
    register: (fullName, email, studentId, password) =>
        apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, studentId, password }),
        }),
    login: (email, studentId, password) =>
        apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, studentId, password }),
        }),
    getMe: () => apiRequest('/auth/me'),
};

// Student API
export const studentAPI = {
    getDashboard: () => apiRequest('/student/dashboard'),
    getAssignments: () => apiRequest('/student/assignments'),
    submitAssignment: (assignmentId, fileUrl, filename) =>
        apiRequest(`/student/assignments/${assignmentId}/submit`, {
            method: 'POST',
            body: JSON.stringify({ fileUrl, filename }),
        }),
    getCodeSubmissions: () => apiRequest('/student/code-submissions'),
    submitCode: (codeData) =>
        apiRequest('/student/code-submissions', {
            method: 'POST',
            body: JSON.stringify(codeData),
        }),
    getCourses: () => apiRequest('/student/courses'),
    enrollInCourse: (enrollmentCode) =>
        apiRequest('/student/courses/enroll', {
            method: 'POST',
            body: JSON.stringify({ enrollmentCode }),
        }),
    getGrades: () => apiRequest('/student/grades'),
    getCalendar: () => apiRequest('/student/calendar'),
    getTimetable: () => apiRequest('/student/timetable'),
    getFeedback: () => apiRequest('/student/feedback'),
    createFeedback: (data) =>
        apiRequest('/student/feedback', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    deleteFeedback: (id) =>
        apiRequest(`/student/feedback/${id}`, {
            method: 'DELETE',
        }),
    getQuizzes: () => apiRequest('/student/quizzes'),
    executeCode: (data) =>
        apiRequest('/proxy/code/execute', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    getCodeFeedback: (data) =>
        apiRequest('/proxy/ai/code-feedback', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// User API
export const userAPI = {
    updateProfile: (data) =>
        apiRequest('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    updateAvatar: (avatar) =>
        apiRequest('/users/avatar', {
            method: 'PUT',
            body: JSON.stringify({ avatar }),
        }),
    deleteAvatar: () =>
        apiRequest('/users/avatar', {
            method: 'DELETE',
        }),
    changePassword: (currentPassword, newPassword) =>
        apiRequest('/users/password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword }),
        }),
};

// Faculty API
export const facultyAPI = {
    getDashboard: () => apiRequest('/faculty/dashboard'),
    getCodeSubmissions: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/faculty/code-submissions${queryString ? `?${queryString}` : ''}`);
    },
    gradeSubmission: (submissionId, gradeData) =>
        apiRequest(`/faculty/submissions/${submissionId}/grade`, {
            method: 'PUT',
            body: JSON.stringify(gradeData),
        }),
    getCourses: () => apiRequest('/faculty/courses'),
    createCourse: (data) =>
        apiRequest('/faculty/courses', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateCourse: (id, data) =>
        apiRequest(`/faculty/courses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    deleteCourse: (id) =>
        apiRequest(`/faculty/courses/${id}`, {
            method: 'DELETE',
        }),
    getStudents: () => apiRequest('/faculty/students'),
    getTimetable: () => apiRequest('/faculty/timetable'),
    createTimetableEntry: (data) =>
        apiRequest('/faculty/timetable', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    deleteTimetableEntry: (id) =>
        apiRequest(`/faculty/timetable/${id}`, {
            method: 'DELETE',
        }),
    getAssignments: () => apiRequest('/faculty/assignments'),
    createAssignment: (data) =>
        apiRequest('/faculty/assignments', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    getSubmissions: (assignmentId) =>
        apiRequest(`/faculty/assignments/${assignmentId}/submissions`),
    createAnnouncement: (data) =>
        apiRequest('/faculty/announcements', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    generateQuiz: (data) =>
        apiRequest('/proxy/ai/generate-quiz', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

