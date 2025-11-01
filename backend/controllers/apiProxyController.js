import axios from 'axios';

// Piston API configuration
const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

const languageMap = {
    'python': { name: 'python', version: '3.10.0' },
    'java': { name: 'java', version: '15.0.2' },
    'cpp': { name: 'c++', version: '10.2.0' },
    'c': { name: 'c', version: '10.2.0' },
    'javascript': { name: 'javascript', version: '18.15.0' },
    'typescript': { name: 'typescript', version: '5.0.3' }
};

// Gemini API configuration
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

// @desc    Execute code using Piston API
// @route   POST /api/proxy/code/execute
// @access  Private
export const executeCode = async (req, res) => {
    try {
        const { language, code, stdin } = req.body;

        // Validate input
        if (!language || !code) {
            return res.status(400).json({
                success: false,
                message: 'Please provide language and code'
            });
        }

        const langConfig = languageMap[language];
        if (!langConfig) {
            return res.status(400).json({
                success: false,
                message: `Language '${language}' is not supported`
            });
        }

        // Call Piston API
        const response = await axios.post(PISTON_API_URL, {
            language: langConfig.name,
            version: langConfig.version,
            files: [{ content: code }],
            stdin: stdin || ''
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000 // 30 second timeout
        });

        const result = response.data;

        if (!result.run) {
            return res.status(500).json({
                success: false,
                message: 'API response was successful but did not contain execution results'
            });
        }

        // Combine stdout and stderr
        let fullOutput = "";
        let success = true;

        if (result.run.stdout) {
            fullOutput += result.run.stdout;
        }
        if (result.run.stderr) {
            fullOutput += (fullOutput ? "\n" : "") + `[ERROR]\n${result.run.stderr}`;
            success = false;
        }

        fullOutput += `

---
Program exited with code ${result.run.code}
Signal: ${result.run.signal || 'None'}`;

        res.status(200).json({
            success: true,
            data: {
                output: fullOutput || 'Execution finished with no output.',
                executionSuccess: success,
                exitCode: result.run.code,
                signal: result.run.signal
            }
        });

    } catch (error) {
        console.error('Code execution error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Error executing code',
            error: error.response?.data?.message || error.message
        });
    }
};

// @desc    Generate quiz using Gemini API
// @route   POST /api/proxy/ai/generate-quiz
// @access  Private (Faculty)
export const generateQuiz = async (req, res) => {
    try {
        const { topic, numQuestions, difficulty, questionType, context } = req.body;

        // Validate input
        if (!topic || !numQuestions) {
            return res.status(400).json({
                success: false,
                message: 'Please provide topic and number of questions'
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: 'Gemini API key not configured'
            });
        }

        // Build the prompt
        const prompt = `Generate ${numQuestions} ${difficulty || 'medium'} difficulty ${questionType || 'multiple-choice'} questions about ${topic}.
${context ? `Additional context: ${context}` : ''}

For each question, provide:
1. The question text
2. ${questionType === 'multiple-choice' ? 'Four options (A, B, C, D)' : questionType === 'true-false' ? 'True or False options' : 'The expected answer'}
3. The correct answer
4. A brief explanation

Return the response in JSON format with this structure:
{
  "questions": [
    {
      "question": "Question text here",
      "type": "${questionType || 'multiple-choice'}",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Explanation here"
    }
  ]
}`;

        // Call Gemini API
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: 2048,
                    temperature: 0.7,
                }
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 60000 // 60 second timeout
            }
        );

        const aiResponse = response.data;
        const generatedText = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate quiz from AI'
            });
        }

        // Try to parse JSON from the response
        let quizData;
        try {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) || 
                             generatedText.match(/```\s*([\s\S]*?)\s*```/);
            const jsonText = jsonMatch ? jsonMatch[1] : generatedText;
            quizData = JSON.parse(jsonText);
        } catch (parseError) {
            // If parsing fails, return the raw text
            console.error('Failed to parse AI response as JSON:', parseError);
            return res.status(200).json({
                success: true,
                data: {
                    title: `${topic} Quiz`,
                    difficulty: difficulty || 'medium',
                    rawResponse: generatedText,
                    parsed: false
                }
            });
        }

        res.status(200).json({
            success: true,
            data: {
                title: `${topic} Quiz`,
                difficulty: difficulty || 'medium',
                questions: quizData.questions || [],
                parsed: true
            }
        });

    } catch (error) {
        console.error('Quiz generation error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Error generating quiz',
            error: error.response?.data?.error?.message || error.message
        });
    }
};

// @desc    Get code feedback using Gemini API
// @route   POST /api/proxy/ai/code-feedback
// @access  Private
export const getCodeFeedback = async (req, res) => {
    try {
        const { code, language } = req.body;

        // Validate input
        if (!code || !language) {
            return res.status(400).json({
                success: false,
                message: 'Please provide code and language'
            });
        }

        if (code.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Code is too short for meaningful feedback'
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: 'Gemini API key not configured'
            });
        }

        const prompt = `You are a code review assistant providing constructive feedback. Analyze the following ${language} code for quality, style, potential bugs, and suggest improvements. Be concise (3-5 bullet points). Do not comment on correctness unless there's an obvious bug. Focus on readability, conventions, and potential optimizations.

Code:
\`\`\`${language}
${code}
\`\`\``;

        // Call Gemini API
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: 500,
                    temperature: 0.5,
                }
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000 // 30 second timeout
            }
        );

        const aiResponse = response.data;
        const feedbackText = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!feedbackText) {
            return res.status(500).json({
                success: false,
                message: 'Failed to get feedback from AI'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                feedback: feedbackText
            }
        });

    } catch (error) {
        console.error('Code feedback error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Error getting code feedback',
            error: error.response?.data?.error?.message || error.message
        });
    }
};

// @desc    Test Gemini API connection
// @route   GET /api/proxy/ai/test
// @access  Private
export const testGeminiAPI = async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: 'Gemini API key not configured'
            });
        }

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: 'Say "API connection successful"' }] }]
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            }
        );

        res.status(200).json({
            success: true,
            message: 'Gemini API is working correctly',
            data: response.data.candidates?.[0]?.content?.parts?.[0]?.text
        });

    } catch (error) {
        console.error('Gemini API test error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Gemini API connection failed',
            error: error.response?.data?.error?.message || error.message
        });
    }
};
