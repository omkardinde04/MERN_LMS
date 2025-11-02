import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please provide your full name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/@somaiya\.edu$/, 'Email must end with @somaiya.edu']
    },
    studentId: {
        type: String,
        required: [true, 'Please provide your ID'],
        unique: true,
        match: [/^\d{4}$/, 'ID must be exactly 4 digits']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password by default
    },
    role: {
        type: String,
        enum: ['student', 'faculty'],
        required: true
    },
    avatar: {
        type: String,
        default: function () {
            return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.fullName}`;
        }
    },
    contact: {
        type: String,
        default: ''
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    notificationPrefs: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        assignmentReminders: {
            type: Boolean,
            default: true
        },
        gradeUpdates: {
            type: Boolean,
            default: true
        },
        announcements: {
            type: Boolean,
            default: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Remove duplicate index definitions (unique: true already creates indexes)
// userSchema.index({ email: 1 });
// userSchema.index({ studentId: 1 });
// userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);
