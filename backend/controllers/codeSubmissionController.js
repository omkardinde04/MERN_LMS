import CodeSubmission from '../models/codeSubmissionModel.js';
import axios from 'axios';
import User from '../models/userModel.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Generate AI feedback using Gemini API
 */
const generateAIFeedback = async (code, language) => {
    try {
        // Check if API key is configured
        if (!GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY not configured in environment variables');
            return 'AI feedback is currently unavailable. Please configure GEMINI_API_KEY.';
        }

        if (!code || code.trim().length < 10) {
            return 'Code is too short for meaningful feedback.';
        }

        const prompt = `Analyze the following student's ${language} code for logic, structure, and efficiency. Provide constructive feedback in 3-5 bullet points. Focus on:
- Code quality and readability
- Logic and algorithm efficiency
- Best practices and conventions
- Potential improvements
- Any obvious bugs or issues

Code:
\`\`\`${language}
${code}
\`\`\`

Provide clear, actionable feedback:`;

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    role: 'user',
                    parts: [{
                        text: prompt
                    }]
                }]
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );

        const feedbackText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        return feedbackText || 'Unable to generate feedback at this time.';
    } catch (error) {
        console.error('Gemini API Error:', error.response?.data || error.message);
        return `AI feedback unavailable: ${error.response?.data?.error?.message || error.message}`;
    }
};

/**
 * @desc    Submit code with AI feedback
 * @route   POST /api/student/code-submissions
 * @access  Private (Student)
 */
export const submitCode = async (req, res) => {
    try {
        const { code, language, fileName, output, executionSuccess, problemId } = req.body;
        const io = req.app.get('io');

        if (!code || !language) {
            return res.status(400).json({
                success: false,
                message: 'Code and language are required'
            });
        }

        // Get student info
        const student = await User.findById(req.user.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Generate AI feedback
        let aiFeedback = '';
        try {
            aiFeedback = await generateAIFeedback(code, language);
        } catch (error) {
            console.error('Error generating AI feedback:', error);
            aiFeedback = 'AI feedback generation failed. Your code has been submitted successfully.';
        }

        // Calculate basic score (based on code length and execution)
        const codeLength = code.split('\n').filter(l => l.trim().length > 0).length;
        let score = Math.min(codeLength * 2, 40) + 10; // Base score
        if (executionSuccess) {
            score += 50;
        }
        score = Math.min(score, 100);

        // Create code submission
        const codeSubmission = await CodeSubmission.create({
            student: req.user.id,
            problemId: problemId || 'coding-zone',
            language,
            code,
            fileName: fileName || `code.${language === 'python' ? 'py' : language === 'java' ? 'java' : language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : 'js'}`,
            output: output || '',
            executionSuccess: executionSuccess || false,
            score,
            aiFeedback,
            feedbackGeneratedAt: new Date()
        });

        // Populate student info for response and socket
        await codeSubmission.populate('student', 'fullName email');

        // Emit real-time update to faculty code submissions room
        if (io) {
            try {
                io.to('code-submissions').emit('new-code-submission', {
                    submission: codeSubmission,
                    studentName: student.fullName,
                    studentEmail: student.email
                });
                console.log(`📤 Emitted new-code-submission event`);
            } catch (socketError) {
                console.error('Socket.io emit error:', socketError);
                // Don't fail the request if socket fails
            }
        }

        res.status(201).json({
            success: true,
            message: 'Code submitted successfully',
            data: codeSubmission
        });

    } catch (error) {
        console.error('Submit code error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting code',
            error: error.message
        });
    }
};

/**
 * @desc    Get all code submissions (Faculty)
 * @route   GET /api/faculty/code-submissions
 * @access  Private (Faculty)
 */
export const getAllCodeSubmissions = async (req, res) => {
    try {
        const { page = 1, limit = 50, studentId, language } = req.query;

        const query = {};
        if (studentId) query.student = studentId;
        if (language) query.language = language;

        const submissions = await CodeSubmission.find(query)
            .populate('student', 'fullName email')
            .sort({ submittedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await CodeSubmission.countDocuments(query);

        res.status(200).json({
            success: true,
            data: submissions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get code submissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching code submissions',
            error: error.message
        });
    }
};

/**
 * @desc    Get student's code submissions
 * @route   GET /api/student/code-submissions
 * @access  Private (Student)
 */
export const getStudentCodeSubmissions = async (req, res) => {
    try {
        const submissions = await CodeSubmission.find({ student: req.user.id })
            .sort({ submittedAt: -1 })
            .limit(100);

        res.status(200).json({
            success: true,
            data: submissions
        });

    } catch (error) {
        console.error('Get student code submissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching code submissions',
            error: error.message
        });
    }
};

