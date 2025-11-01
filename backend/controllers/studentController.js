import Course from '../models/courseModel.js';
import Assignment from '../models/assignmentModel.js';
import Submission from '../models/submissionModel.js';
import Feedback from '../models/feedbackModel.js';
import Announcement from '../models/announcementModel.js';
import Timetable from '../models/timetableModel.js';
import Quiz from '../models/quizModel.js';

// @desc    Get student dashboard data
// @route   GET /api/student/dashboard
// @access  Private (Student)
export const getDashboard = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Get enrolled courses
        const courses = await Course.find({ students: studentId })
            .populate('faculty', 'fullName email')
            .select('name code semester credits class');

        // Get pending assignments
        const pendingAssignments = await Assignment.find({
            course: { $in: courses.map(c => c._id) },
            dueDate: { $gte: new Date() }
        })
            .populate('course', 'name code')
            .sort({ dueDate: 1 })
            .limit(5);

        // Get recent announcements
        const announcements = await Announcement.find({
            course: { $in: courses.map(c => c._id) }
        })
            .populate('course', 'name code')
            .populate('author', 'fullName')
            .sort({ date: -1 })
            .limit(5);

        // Get submission stats
        const totalAssignments = await Assignment.countDocuments({
            course: { $in: courses.map(c => c._id) }
        });

        const submittedAssignments = await Submission.countDocuments({
            student: studentId,
            status: { $in: ['submitted', 'graded'] }
        });

        res.status(200).json({
            success: true,
            data: {
                courses: courses.length,
                pendingAssignments: pendingAssignments.length,
                totalAssignments,
                submittedAssignments,
                coursesList: courses,
                upcomingAssignments: pendingAssignments,
                recentAnnouncements: announcements
            }
        });

    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
};

// @desc    Get all courses for student
// @route   GET /api/student/courses
// @access  Private (Student)
export const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({ students: req.user.id })
            .populate('faculty', 'fullName email avatar')
            .sort({ code: 1 });

        // Add progress calculation for each course
        const coursesWithProgress = await Promise.all(
            courses.map(async (course) => {
                const totalAssignments = await Assignment.countDocuments({ course: course._id });
                const completedAssignments = await Submission.countDocuments({
                    student: req.user.id,
                    assignment: { $in: await Assignment.find({ course: course._id }).distinct('_id') },
                    status: { $in: ['submitted', 'graded'] }
                });

                const progress = totalAssignments > 0 
                    ? Math.round((completedAssignments / totalAssignments) * 100) 
                    : 0;

                return {
                    id: course._id,
                    code: course.code,
                    name: course.name,
                    instructor: course.faculty.fullName,
                    class: course.class,
                    semester: course.semester,
                    credits: course.credits,
                    progress,
                    enrolledStudents: course.students.length
                };
            })
        );

        res.status(200).json({
            success: true,
            count: coursesWithProgress.length,
            data: coursesWithProgress
        });

    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching courses',
            error: error.message
        });
    }
};

// @desc    Get all assignments for student
// @route   GET /api/student/assignments
// @access  Private (Student)
export const getAssignments = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Get student's courses
        const courses = await Course.find({ students: studentId }).select('_id');
        const courseIds = courses.map(c => c._id);

        // Get all assignments for these courses
        const assignments = await Assignment.find({ course: { $in: courseIds } })
            .populate('course', 'name code')
            .sort({ dueDate: -1 });

        // Get all submissions for this student
        const submissions = await Submission.find({ student: studentId });
        const submissionMap = {};
        submissions.forEach(sub => {
            submissionMap[sub.assignment.toString()] = sub;
        });

        // Combine assignments with submission status
        const assignmentsWithStatus = assignments.map(assignment => {
            const submission = submissionMap[assignment._id.toString()];

            return {
                id: assignment._id,
                courseId: assignment.course._id,
                courseName: assignment.course.name,
                title: assignment.title,
                description: assignment.description,
                dueDate: assignment.dueDate,
                maxScore: assignment.maxScore,
                status: submission ? submission.status : 'pending',
                submittedAt: submission ? submission.submittedAt : null,
                score: submission ? submission.score : null,
                feedback: submission ? submission.feedback : null
            };
        });

        // Separate into pending and submitted
        const pending = assignmentsWithStatus.filter(a => a.status === 'pending');
        const submitted = assignmentsWithStatus.filter(a => a.status !== 'pending');

        res.status(200).json({
            success: true,
            data: {
                all: assignmentsWithStatus,
                pending,
                submitted
            }
        });

    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching assignments',
            error: error.message
        });
    }
};

// @desc    Submit an assignment
// @route   POST /api/student/assignments/:id/submit
// @access  Private (Student)
export const submitAssignment = async (req, res) => {
    try {
        const { id: assignmentId } = req.params;
        const { fileUrl, filename } = req.body;

        // Check if assignment exists
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Check if student is enrolled in the course
        const course = await Course.findOne({
            _id: assignment.course,
            students: req.user.id
        });

        if (!course) {
            return res.status(403).json({
                success: false,
                message: 'You are not enrolled in this course'
            });
        }

        // Check if already submitted
        let submission = await Submission.findOne({
            assignment: assignmentId,
            student: req.user.id
        });

        if (submission) {
            // Update existing submission
            submission.fileUrl = fileUrl || submission.fileUrl;
            submission.filename = filename || submission.filename;
            submission.submittedAt = new Date();
            submission.status = 'submitted';
            await submission.save();

            return res.status(200).json({
                success: true,
                message: 'Assignment resubmitted successfully',
                data: submission
            });
        }

        // Create new submission
        submission = await Submission.create({
            assignment: assignmentId,
            student: req.user.id,
            fileUrl: fileUrl || '',
            filename: filename || '',
            status: 'submitted'
        });

        res.status(201).json({
            success: true,
            message: 'Assignment submitted successfully',
            data: submission
        });

    } catch (error) {
        console.error('Submit assignment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting assignment',
            error: error.message
        });
    }
};

// @desc    Get grades for student
// @route   GET /api/student/grades
// @access  Private (Student)
export const getGrades = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Get student's courses
        const courses = await Course.find({ students: studentId })
            .populate('faculty', 'fullName')
            .select('name code');

        const gradesData = await Promise.all(
            courses.map(async (course) => {
                // Get graded submissions for this course
                const assignments = await Assignment.find({ course: course._id });
                const assignmentIds = assignments.map(a => a._id);

                const submissions = await Submission.find({
                    student: studentId,
                    assignment: { $in: assignmentIds },
                    status: 'graded',
                    score: { $ne: null }
                });

                // Calculate average
                const assignmentScores = submissions.map(s => s.score);
                const assignmentsAvg = assignmentScores.length > 0
                    ? assignmentScores.reduce((a, b) => a + b, 0) / assignmentScores.length
                    : 0;

                // For now, we'll use assignments average as overall
                // In a real app, you'd factor in quizzes, midterms, finals
                const overall = Math.round(assignmentsAvg);

                return {
                    courseId: course._id,
                    courseName: course.name,
                    assignments: Math.round(assignmentsAvg),
                    quizzes: 0, // Placeholder
                    midterm: 0, // Placeholder
                    final: 0, // Placeholder
                    overall
                };
            })
        );

        res.status(200).json({
            success: true,
            data: gradesData
        });

    } catch (error) {
        console.error('Get grades error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching grades',
            error: error.message
        });
    }
};

// @desc    Get calendar events for student
// @route   GET /api/student/calendar
// @access  Private (Student)
export const getCalendar = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Get student's courses
        const courses = await Course.find({ students: studentId }).select('_id name');
        const courseIds = courses.map(c => c._id);

        // Get assignments (as events)
        const assignments = await Assignment.find({ course: { $in: courseIds } })
            .populate('course', 'name code')
            .select('title dueDate course');

        const assignmentEvents = assignments.map(a => ({
            id: a._id,
            title: a.title,
            date: a.dueDate,
            type: 'assignment',
            courseId: a.course._id,
            courseName: a.course.name,
            description: `${a.title} due`
        }));

        // Get timetable (as recurring events)
        const timetableEntries = await Timetable.find({ course: { $in: courseIds } })
            .populate('course', 'name code')
            .select('day time courseName type room');

        const timetableEvents = timetableEntries.map(t => ({
            id: t._id,
            title: `${t.courseName} - ${t.type}`,
            day: t.day,
            time: t.time,
            type: 'class',
            room: t.room,
            recurring: true
        }));

        res.status(200).json({
            success: true,
            data: {
                assignments: assignmentEvents,
                timetable: timetableEvents,
                all: [...assignmentEvents]
            }
        });

    } catch (error) {
        console.error('Get calendar error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching calendar data',
            error: error.message
        });
    }
};

// @desc    Get feedback for student
// @route   GET /api/student/feedback
// @access  Private (Student)
export const getFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find({ student: req.user.id })
            .populate('course', 'name code')
            .sort({ date: -1 });

        const formattedFeedback = feedback.map(f => ({
            id: f._id,
            courseId: f.course._id,
            courseName: f.course.name,
            rating: f.rating,
            comment: f.comment,
            date: f.date
        }));

        res.status(200).json({
            success: true,
            count: formattedFeedback.length,
            data: formattedFeedback
        });

    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching feedback',
            error: error.message
        });
    }
};

// @desc    Create feedback
// @route   POST /api/student/feedback
// @access  Private (Student)
export const createFeedback = async (req, res) => {
    try {
        const { courseId, rating, comment } = req.body;

        // Validate input
        if (!courseId || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Please provide course, rating, and comment'
            });
        }

        // Check if student is enrolled in the course
        const course = await Course.findOne({
            _id: courseId,
            students: req.user.id
        });

        if (!course) {
            return res.status(403).json({
                success: false,
                message: 'You are not enrolled in this course'
            });
        }

        const feedback = await Feedback.create({
            student: req.user.id,
            course: courseId,
            rating,
            comment
        });

        const populatedFeedback = await Feedback.findById(feedback._id)
            .populate('course', 'name code');

        res.status(201).json({
            success: true,
            message: 'Feedback created successfully',
            data: populatedFeedback
        });

    } catch (error) {
        console.error('Create feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating feedback',
            error: error.message
        });
    }
};

// @desc    Delete feedback
// @route   DELETE /api/student/feedback/:id
// @access  Private (Student)
export const deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        // Check if feedback belongs to the student
        if (feedback.student.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this feedback'
            });
        }

        await feedback.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Feedback deleted successfully'
        });

    } catch (error) {
        console.error('Delete feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting feedback',
            error: error.message
        });
    }
};

// @desc    Get quizzes for student
// @route   GET /api/student/quizzes
// @access  Private (Student)
export const getQuizzes = async (req, res) => {
    try {
        const courses = await Course.find({ students: req.user.id }).select('_id');
        const courseIds = courses.map(c => c._id);

        const quizzes = await Quiz.find({
            course: { $in: courseIds },
            isActive: true
        })
            .populate('course', 'name code')
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes
        });

    } catch (error) {
        console.error('Get quizzes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching quizzes',
            error: error.message
        });
    }
};
