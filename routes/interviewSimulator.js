const express = require('express');
const { body } = require('express-validator');
const {
  createInterview,
  getInterviews,
  getInterview,
  startInterview,
  submitResponse,
  completeInterview,
  getInterviewFeedback,
  updateInterview,
  deleteInterview,
  getPublicInterviews
} = require('../controllers/interviewControllerSQLite');

const router = express.Router();

// Validation rules
const createInterviewValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('mode')
    .isIn(['ai-interviewer', 'scenario-based', 'custom'])
    .withMessage('Invalid interview mode'),
  body('configuration.role')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Role must be between 1 and 100 characters'),
  body('configuration.experienceLevel')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'executive'])
    .withMessage('Invalid experience level'),
  body('configuration.duration')
    .optional()
    .isInt({ min: 5, max: 120 })
    .withMessage('Duration must be between 5 and 120 minutes'),
  body('configuration.questionTypes')
    .optional()
    .isArray()
    .withMessage('Question types must be an array'),
  body('configuration.difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level')
];

const submitResponseValidation = [
  body('questionId')
    .notEmpty()
    .withMessage('Question ID is required'),
  body('answerText')
    .optional()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Answer text must be between 1 and 5000 characters'),
  body('responseTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Response time must be a positive number'),
  body('audioUrl')
    .optional()
    .isURL()
    .withMessage('Audio URL must be a valid URL')
];

const updateInterviewValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('configuration')
    .optional()
    .isObject()
    .withMessage('Configuration must be an object'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

// Routes
router.post('/', createInterviewValidation, createInterview);
router.get('/', getInterviews);
router.get('/public', getPublicInterviews);
router.get('/:id', getInterview);
router.get('/:id/feedback', getInterviewFeedback);
router.put('/:id', updateInterviewValidation, updateInterview);
router.delete('/:id', deleteInterview);

// Interview flow routes
router.post('/:id/start', startInterview);
router.post('/:id/responses', submitResponseValidation, submitResponse);
router.post('/:id/complete', completeInterview);

module.exports = router;
