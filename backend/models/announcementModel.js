import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Announcement title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Announcement content is required']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    isImportant: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
announcementSchema.index({ course: 1 });
announcementSchema.index({ date: -1 });

export default mongoose.model('Announcement', announcementSchema);
