const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const {
  getProfile,
  updateProfile,
  getStats,
  updateStats,
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/userControllerSQLite');

const router = express.Router();

// Configure multer for avatar upload
const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = require('path').join(__dirname, '../uploads');
      const fs = require('fs');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `avatar-${req.user.id}-${Date.now()}.jpg`;
      cb(null, uniqueName);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatar'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for avatars
  }
});

// Validation rules
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('profile.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  body('profile.skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('profile.interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  body('profile.careerGoals')
    .optional()
    .isArray()
    .withMessage('Career goals must be an array'),
  body('profile.experienceLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid experience level'),
  body('preferences.notificationEmail')
    .optional()
    .isBoolean()
    .withMessage('Notification email preference must be a boolean'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Invalid theme preference'),
  body('preferences.language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language must be 2-5 characters')
];

// Routes
router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, updateProfile);
router.get('/stats', getStats);
router.put('/stats', updateStats);

// Admin routes
router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
