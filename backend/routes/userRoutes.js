import express from 'express';
import {
    updateProfile,
    updateAvatar,
    deleteAvatar,
    changePassword,
    updateNotificationPreferences
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.put('/profile', updateProfile);
router.put('/avatar', updateAvatar);
router.delete('/avatar', deleteAvatar);
router.put('/password', changePassword);
router.put('/notifications', updateNotificationPreferences);

export default router;
