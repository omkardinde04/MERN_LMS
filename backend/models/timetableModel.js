import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    courseName: {
        type: String,
        required: true
    },
    courseCode: {
        type: String,
        required: true
    },
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    time: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true
    },
    class: {
        type: String,
        default: 'A'
    },
    type: {
        type: String,
        enum: ['Lecture', 'Lab', 'Tutorial', 'Practical'],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
timetableSchema.index({ faculty: 1 });
timetableSchema.index({ course: 1 });
timetableSchema.index({ day: 1 });

export default mongoose.model('Timetable', timetableSchema);
