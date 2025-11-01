import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { fullName, contact } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (fullName) user.fullName = fullName;
        if (contact !== undefined) user.contact = contact;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                studentId: user.studentId,
                role: user.role,
                avatar: user.avatar,
                contact: user.contact
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// @desc    Update user avatar
// @route   PUT /api/users/avatar
// @access  Private
export const updateAvatar = async (req, res) => {
    try {
        const { avatar } = req.body;

        if (!avatar) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an avatar URL'
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.avatar = avatar;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Avatar updated successfully',
            avatar: user.avatar
        });

    } catch (error) {
        console.error('Update avatar error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating avatar',
            error: error.message
        });
    }
};

// @desc    Delete user avatar
// @route   DELETE /api/users/avatar
// @access  Private
export const deleteAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Reset to default avatar
        user.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Avatar deleted successfully',
            avatar: user.avatar
        });

    } catch (error) {
        console.error('Delete avatar error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting avatar',
            error: error.message
        });
    }
};

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error.message
        });
    }
};

// @desc    Update notification preferences
// @route   PUT /api/users/notifications
// @access  Private
export const updateNotificationPreferences = async (req, res) => {
    try {
        const { emailNotifications, assignmentReminders, gradeUpdates, announcements } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update notification preferences
        if (emailNotifications !== undefined) user.notificationPrefs.emailNotifications = emailNotifications;
        if (assignmentReminders !== undefined) user.notificationPrefs.assignmentReminders = assignmentReminders;
        if (gradeUpdates !== undefined) user.notificationPrefs.gradeUpdates = gradeUpdates;
        if (announcements !== undefined) user.notificationPrefs.announcements = announcements;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Notification preferences updated successfully',
            notificationPrefs: user.notificationPrefs
        });

    } catch (error) {
        console.error('Update notification preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notification preferences',
            error: error.message
        });
    }
};
