import Course from '../models/courseModel.js';
import Assignment from '../models/assignmentModel.js';
import Submission from '../models/submissionModel.js';
import Timetable from '../models/timetableModel.js';
import User from '../models/userModel.js';
import Announcement from '../models/announcementModel.js';
import Quiz from '../models/quizModel.js';

// @desc    Get faculty dashboard data
// @route   GET /api/faculty/dashboard
// @access  Private (Faculty)
export const getDashboard = async (req, res) => {
    try {
        const facultyId = req.user.id;

        // Get courses taught by faculty
        const courses = await Course.find({ faculty: facultyId })
            .populate('students', 'fullName email');

        // Get total students across all courses
        const totalStudents = courses.reduce((sum, course) => sum + course.students.length, 0);

        // Get total assignments
        const courseIds = courses.map(c => c._id);
        const totalAssignments = await Assignment.countDocuments({ course: { $in: courseIds } });

        // Get pending submissions (submitted but not graded)
        const pendingSubmissions = await Submission.countDocuments({
            assignment: { $in: await Assignment.find({ course: { $in: courseIds } }).distinct('_id') },
            status: 'submitted'
        });

        res.status(200).json({
            success: true,
            data: {
                totalCourses: courses.length,
                totalStudents,
                totalAssignments,
                pendingSubmissions,
                courses: courses.map(c => ({
                    id: c._id,
                    name: c.name,
                    code: c.code,
                    students: c.students.length,
                    semester: c.semester
                }))
            }
        });

    } catch (error) {
        console.error('Get faculty dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
};

// @desc    Get all courses for faculty
// @route   GET /api/faculty/courses
// @access  Private (Faculty)
export const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({ faculty: req.user.id })
            .populate('students', 'fullName email studentId')
            .sort({ code: 1 });

        const coursesData = courses.map(course => ({
            id: course._id,
            code: course.code,
            name: course.name,
            instructor: req.user.fullName,
            class: course.class,
            semester: course.semester,
            credits: course.credits,
            enrolledStudents: course.students.length,
            students: course.students
        }));

        res.status(200).json({
            success: true,
            count: coursesData.length,
            data: coursesData
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

// @desc    Create a new course
// @route   POST /api/faculty/courses
// @access  Private (Faculty)
export const createCourse = async (req, res) => {
    try {
        const { name, code, semester, credits, class: courseClass, description } = req.body;

        // Validate input
        if (!name || !code || !credits) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, code, and credits'
            });
        }

        // Check if course code already exists
        const existingCourse = await Course.findOne({ code: code.toUpperCase() });
        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: 'Course code already exists'
            });
        }

        const course = await Course.create({
            name,
            code: code.toUpperCase(),
            faculty: req.user.id,
            semester: semester || 'Fall 2025',
            credits,
            class: courseClass || 'A',
            description: description || ''
        });

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: course
        });

    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating course',
            error: error.message
        });
    }
};

// @desc    Update a course
// @route   PUT /api/faculty/courses/:id
// @access  Private (Faculty)
export const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if faculty owns this course
        if (course.faculty.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this course'
            });
        }

        const { name, semester, credits, class: courseClass, description } = req.body;

        if (name) course.name = name;
        if (semester) course.semester = semester;
        if (credits) course.credits = credits;
        if (courseClass) course.class = courseClass;
        if (description !== undefined) course.description = description;

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            data: course
        });

    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating course',
            error: error.message
        });
    }
};

// @desc    Delete a course
// @route   DELETE /api/faculty/courses/:id
// @access  Private (Faculty)
export const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if faculty owns this course
        if (course.faculty.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this course'
            });
        }

        // Remove course from all enrolled students
        await User.updateMany(
            { courses: course._id },
            { $pull: { courses: course._id } }
        );

        await course.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });

    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting course',
            error: error.message
        });
    }
};

// @desc    Get students enrolled in faculty's courses
// @route   GET /api/faculty/students
// @access  Private (Faculty)
export const getStudents = async (req, res) => {
    try {
        const courses = await Course.find({ faculty: req.user.id })
            .populate('students', 'fullName email studentId avatar')
            .select('name code class');

        // Flatten student list with their courses
        const studentMap = new Map();

        courses.forEach(course => {
            course.students.forEach(student => {
                const studentId = student._id.toString();
                if (!studentMap.has(studentId)) {
                    studentMap.set(studentId, {
                        id: student._id,
                        name: student.fullName,
                        email: student.email,
                        studentId: student.studentId,
                        avatar: student.avatar,
                        courses: []
                    });
                }
                studentMap.get(studentId).courses.push({
                    courseId: course._id,
                    courseName: course.name,
                    courseCode: course.code,
                    class: course.class
                });
            });
        });

        const students = Array.from(studentMap.values());

        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });

    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students',
            error: error.message
        });
    }
};

// @desc    Get timetable for faculty
// @route   GET /api/faculty/timetable
// @access  Private (Faculty)
export const getTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.find({ faculty: req.user.id })
            .populate('course', 'name code')
            .sort({ day: 1, time: 1 });

        const formattedTimetable = timetable.map(entry => ({
            id: entry._id,
            day: entry.day,
            time: entry.time,
            course: entry.courseCode,
            courseName: entry.courseName,
            type: entry.type,
            room: entry.room,
            class: entry.class
        }));

        res.status(200).json({
            success: true,
            count: formattedTimetable.length,
            data: formattedTimetable
        });

    } catch (error) {
        console.error('Get timetable error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching timetable',
            error: error.message
        });
    }
};

// @desc    Create timetable entry
// @route   POST /api/faculty/timetable
// @access  Private (Faculty)
export const createTimetableEntry = async (req, res) => {
    try {
        const { courseId, day, time, room, type, courseClass } = req.body;

        // Validate input
        if (!courseId || !day || !time || !room || !type) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if course belongs to faculty
        const course = await Course.findOne({ _id: courseId, faculty: req.user.id });
        if (!course) {
            return res.status(403).json({
                success: false,
                message: 'Course not found or not authorized'
            });
        }

        const timetableEntry = await Timetable.create({
            faculty: req.user.id,
            course: courseId,
            courseName: course.name,
            courseCode: course.code,
            day,
            time,
            room,
            type,
            class: courseClass || course.class
        });

        res.status(201).json({
            success: true,
            message: 'Timetable entry created successfully',
            data: timetableEntry
        });

    } catch (error) {
        console.error('Create timetable error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating timetable entry',
            error: error.message
        });
    }
};

// @desc    Delete timetable entry
// @route   DELETE /api/faculty/timetable/:id
// @access  Private (Faculty)
export const deleteTimetableEntry = async (req, res) => {
    try {
        const entry = await Timetable.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Timetable entry not found'
            });
        }

        // Check if entry belongs to faculty
        if (entry.faculty.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this entry'
            });
        }

        await entry.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Timetable entry deleted successfully'
        });

    } catch (error) {
        console.error('Delete timetable error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting timetable entry',
            error: error.message
        });
    }
};

// @desc    Get assignments for faculty's courses
// @route   GET /api/faculty/assignments
// @access  Private (Faculty)
export const getAssignments = async (req, res) => {
    try {
        const courses = await Course.find({ faculty: req.user.id }).select('_id');
        const courseIds = courses.map(c => c._id);

        const assignments = await Assignment.find({ course: { $in: courseIds } })
            .populate('course', 'name code')
            .sort({ dueDate: -1 });

        res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments
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

// @desc    Create assignment
// @route   POST /api/faculty/assignments
// @access  Private (Faculty)
export const createAssignment = async (req, res) => {
    try {
        const { courseId, title, description, dueDate, maxScore } = req.body;

        // Validate input
        if (!courseId || !title || !description || !dueDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if course belongs to faculty
        const course = await Course.findOne({ _id: courseId, faculty: req.user.id });
        if (!course) {
            return res.status(403).json({
                success: false,
                message: 'Course not found or not authorized'
            });
        }

        const assignment = await Assignment.create({
            course: courseId,
            title,
            description,
            dueDate,
            maxScore: maxScore || 100
        });

        res.status(201).json({
            success: true,
            message: 'Assignment created successfully',
            data: assignment
        });

    } catch (error) {
        console.error('Create assignment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating assignment',
            error: error.message
        });
    }
};

// @desc    Get submissions for an assignment
// @route   GET /api/faculty/assignments/:id/submissions
// @access  Private (Faculty)
export const getSubmissions = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id).populate('course');

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Check if assignment belongs to faculty's course
        if (assignment.course.faculty.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these submissions'
            });
        }

        const submissions = await Submission.find({ assignment: req.params.id })
            .populate('student', 'fullName email studentId');

        res.status(200).json({
            success: true,
            count: submissions.length,
            data: submissions
        });

    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching submissions',
            error: error.message
        });
    }
};

// @desc    Grade a submission
// @route   PUT /api/faculty/submissions/:id/grade
// @access  Private (Faculty)
export const gradeSubmission = async (req, res) => {
    try {
        const { score, feedback, plagiarismReportUrl, plagiarismReport } = req.body;
        const io = req.app.get('io');

        const submission = await Submission.findById(req.params.id)
            .populate({
                path: 'assignment',
                populate: { path: 'course' }
            })
            .populate('student', 'fullName email');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Check if submission belongs to faculty's course
        if (submission.assignment.course.faculty.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to grade this submission'
            });
        }

        submission.score = score;
        submission.feedback = feedback || '';
        submission.status = 'graded';
        submission.gradedAt = new Date();
        submission.gradedBy = req.user.id;

        // Add plagiarism report if provided
        if (plagiarismReportUrl) {
            submission.plagiarismReportUrl = plagiarismReportUrl;
        }

        if (plagiarismReport) {
            submission.plagiarismReport = {
                similarity: plagiarismReport.similarity || null,
                sources: plagiarismReport.sources || [],
                reportedAt: new Date()
            };
        }

        await submission.save();

        // Populate full submission data for socket emission
        const populatedSubmission = await Submission.findById(submission._id)
            .populate('assignment')
            .populate('student', 'fullName email');

        // Emit real-time update to the student
        if (io && submission.student._id) {
            io.to(`student-${submission.student._id}`).emit('assignment-graded', {
                submissionId: submission._id,
                assignmentId: submission.assignment._id,
                score: submission.score,
                feedback: submission.feedback,
                plagiarismReportUrl: submission.plagiarismReportUrl,
                plagiarismReport: submission.plagiarismReport,
                gradedAt: submission.gradedAt,
                data: populatedSubmission
            });
            console.log(`📤 Emitted assignment-graded event to student ${submission.student._id}`);
        }

        res.status(200).json({
            success: true,
            message: 'Submission graded successfully',
            data: populatedSubmission
        });

    } catch (error) {
        console.error('Grade submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Error grading submission',
            error: error.message
        });
    }
};

// @desc    Create announcement
// @route   POST /api/faculty/announcements
// @access  Private (Faculty)
export const createAnnouncement = async (req, res) => {
    try {
        const { courseId, title, content, isImportant } = req.body;

        // Validate input
        if (!courseId || !title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if course belongs to faculty
        const course = await Course.findOne({ _id: courseId, faculty: req.user.id });
        if (!course) {
            return res.status(403).json({
                success: false,
                message: 'Course not found or not authorized'
            });
        }

        const announcement = await Announcement.create({
            course: courseId,
            title,
            content,
            author: req.user.id,
            isImportant: isImportant || false
        });

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            data: announcement
        });

    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating announcement',
            error: error.message
        });
    }
};
