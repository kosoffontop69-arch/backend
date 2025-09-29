const express = require('express');
const {
  uploadSingle,
  uploadMultiple,
  deleteFile,
  getUploadStats
} = require('../controllers/uploadControllerSQLite');

const router = express.Router();

// Routes
router.post('/single', uploadSingle);
router.post('/multiple', uploadMultiple);
router.get('/stats', getUploadStats);
router.delete('/:fileId', deleteFile);

module.exports = router;
