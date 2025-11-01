import express from 'express';
import {
    executeCode,
    generateQuiz,
    getCodeFeedback,
    testGeminiAPI
} from '../controllers/apiProxyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Code execution - available to all authenticated users
router.post('/code/execute', executeCode);

// AI code feedback - available to all authenticated users
router.post('/ai/code-feedback', getCodeFeedback);

// Quiz generation - faculty only
router.post('/ai/generate-quiz', authorize('faculty'), generateQuiz);

// Test endpoint - available to all authenticated users
router.get('/ai/test', testGeminiAPI);

export default router;
