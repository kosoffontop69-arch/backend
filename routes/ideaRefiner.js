const express = require('express');
const { body } = require('express-validator');
const {
  createIdea,
  getIdeas,
  getIdea,
  updateIdea,
  deleteIdea,
  reprocessIdea,
  generateSummary
} = require('../controllers/ideaControllerSQLite');

const router = express.Router();

// Validation rules
const createIdeaValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('originalInput')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Original input must be between 10 and 5000 characters'),
  body('context')
    .isIn(['hackathon', 'startup', 'presentation', 'innovation', 'other'])
    .withMessage('Invalid context'),
  body('tone')
    .optional()
    .isIn(['formal', 'persuasive', 'casual', 'professional'])
    .withMessage('Invalid tone')
];

const updateIdeaValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('originalInput')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Original input must be between 10 and 5000 characters'),
  body('context')
    .optional()
    .isIn(['hackathon', 'startup', 'presentation', 'innovation', 'other'])
    .withMessage('Invalid context'),
  body('tone')
    .optional()
    .isIn(['formal', 'persuasive', 'casual', 'professional'])
    .withMessage('Invalid tone'),
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
router.post('/', createIdeaValidation, createIdea);
router.get('/', getIdeas);
router.get('/:id', getIdea);
router.put('/:id', updateIdeaValidation, updateIdea);
router.delete('/:id', deleteIdea);

// AI Generation routes
router.post('/:id/reprocess', reprocessIdea);
router.post('/:id/summary', generateSummary);

module.exports = router;
