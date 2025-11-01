import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'submitted', 'graded'],
        default: 'submitted'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    fileUrl: {
        type: String,
        default: ''
    },
    filename: {
        type: String,
        default: ''
    },
    score: {
        type: Number,
        default: null,
        min: 0
    },
    feedback: {
        type: String,
        default: ''
    },
    gradedAt: {
        type: Date,
        default: null
    },
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ student: 1 });
submissionSchema.index({ status: 1 });

export default mongoose.model('Submission', submissionSchema);
