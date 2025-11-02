import mongoose from 'mongoose';

const codeSubmissionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problemId: {
        type: String,
        default: 'coding-zone',
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['python', 'java', 'cpp', 'c', 'javascript']
    },
    code: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    output: {
        type: String,
        default: ''
    },
    executionSuccess: {
        type: Boolean,
        default: false
    },
    score: {
        type: Number,
        default: null,
        min: 0,
        max: 100
    },
    aiFeedback: {
        type: String,
        default: ''
    },
    feedbackGeneratedAt: {
        type: Date,
        default: null
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for faster queries
codeSubmissionSchema.index({ student: 1 });
codeSubmissionSchema.index({ problemId: 1 });
codeSubmissionSchema.index({ submittedAt: -1 });

export default mongoose.model('CodeSubmission', codeSubmissionSchema);

