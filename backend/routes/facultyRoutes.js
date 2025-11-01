import express from 'express';
import {
    getDashboard,
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getStudents,
    getTimetable,
    createTimetableEntry,
    deleteTimetableEntry,
    getAssignments,
    createAssignment,
    getSubmissions,
    gradeSubmission,
    createAnnouncement
} from '../controllers/facultyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and restricted to faculty
router.use(protect);
router.use(authorize('faculty'));

// Dashboard
router.get('/dashboard', getDashboard);

// Courses
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// Students
router.get('/students', getStudents);

// Timetable
router.get('/timetable', getTimetable);
router.post('/timetable', createTimetableEntry);
router.delete('/timetable/:id', deleteTimetableEntry);

// Assignments
router.get('/assignments', getAssignments);
router.post('/assignments', createAssignment);
router.get('/assignments/:id/submissions', getSubmissions);

// Grading
router.put('/submissions/:id/grade', gradeSubmission);

// Announcements
router.post('/announcements', createAnnouncement);

export default router;
