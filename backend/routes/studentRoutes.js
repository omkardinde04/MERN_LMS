import express from 'express';
import {
    getDashboard,
    getCourses,
    getAssignments,
    submitAssignment,
    getGrades,
    getCalendar,
    getFeedback,
    createFeedback,
    deleteFeedback,
    getQuizzes
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and restricted to students
router.use(protect);
router.use(authorize('student'));

router.get('/dashboard', getDashboard);
router.get('/courses', getCourses);
router.get('/assignments', getAssignments);
router.post('/assignments/:id/submit', submitAssignment);
router.get('/grades', getGrades);
router.get('/calendar', getCalendar);
router.get('/feedback', getFeedback);
router.post('/feedback', createFeedback);
router.delete('/feedback/:id', deleteFeedback);
router.get('/quizzes', getQuizzes);

export default router;
