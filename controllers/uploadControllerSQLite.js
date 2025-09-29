const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

// @desc    Upload single file
// @route   POST /api/upload/single
// @access  Private
exports.uploadSingle = async (req, res, next) => {
  try {
    const uploadSingle = upload.single('file');
    
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          status: 'error',
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No file uploaded'
        });
      }

      try {
        const fileId = uuidv4();
        const fileExtension = path.extname(req.file.originalname);
        const fileName = `${fileId}${fileExtension}`;
        
        let processedFile;
        let filePath;

        // Process different file types
        if (req.file.mimetype.startsWith('image/')) {
          // Process image with Sharp
          processedFile = await sharp(req.file.buffer)
            .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();
          
          filePath = path.join('uploads', 'images', fileName);
        } else {
          // For other files, use original buffer
          processedFile = req.file.buffer;
          filePath = path.join('uploads', 'documents', fileName);
        }

        // In a real application, you would save the file to cloud storage
        // For now, we'll just return the file info
        const fileInfo = {
          id: fileId,
          originalName: req.file.originalname,
          fileName: fileName,
          filePath: filePath,
          mimeType: req.file.mimetype,
          size: processedFile.length,
          uploadedBy: req.user.id,
          uploadedAt: new Date()
        };

        res.status(200).json({
          status: 'success',
          data: {
            file: fileInfo
          }
        });
      } catch (processingError) {
        console.error('File processing error:', processingError);
        res.status(500).json({
          status: 'error',
          message: 'Error processing file'
        });
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    next(error);
  }
};

// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private
exports.uploadMultiple = async (req, res, next) => {
  try {
    const uploadMultiple = upload.array('files', 5); // Max 5 files
    
    uploadMultiple(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          status: 'error',
          message: err.message
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'No files uploaded'
        });
      }

      try {
        const uploadedFiles = [];

        for (const file of req.files) {
          const fileId = uuidv4();
          const fileExtension = path.extname(file.originalname);
          const fileName = `${fileId}${fileExtension}`;
          
          let processedFile;
          let filePath;

          // Process different file types
          if (file.mimetype.startsWith('image/')) {
            // Process image with Sharp
            processedFile = await sharp(file.buffer)
              .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality: 80 })
              .toBuffer();
            
            filePath = path.join('uploads', 'images', fileName);
          } else {
            // For other files, use original buffer
            processedFile = file.buffer;
            filePath = path.join('uploads', 'documents', fileName);
          }

          const fileInfo = {
            id: fileId,
            originalName: file.originalname,
            fileName: fileName,
            filePath: filePath,
            mimeType: file.mimetype,
            size: processedFile.length,
            uploadedBy: req.user.id,
            uploadedAt: new Date()
          };

          uploadedFiles.push(fileInfo);
        }

        res.status(200).json({
          status: 'success',
          data: {
            files: uploadedFiles
          }
        });
      } catch (processingError) {
        console.error('File processing error:', processingError);
        res.status(500).json({
          status: 'error',
          message: 'Error processing files'
        });
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    next(error);
  }
};

// @desc    Get upload statistics
// @route   GET /api/upload/stats
// @access  Private
exports.getUploadStats = async (req, res, next) => {
  try {
    // In a real application, you would query the database for upload stats
    // For now, return mock data
    const stats = {
      totalUploads: 0,
      totalSize: 0,
      filesByType: {
        images: 0,
        documents: 0,
        others: 0
      },
      recentUploads: []
    };

    res.status(200).json({
      status: 'success',
      data: {
        stats: stats
      }
    });
  } catch (error) {
    console.error('Get upload stats error:', error);
    next(error);
  }
};

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:fileId
// @access  Private
exports.deleteFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;

    // In a real application, you would:
    // 1. Verify the file belongs to the user
    // 2. Delete the file from storage
    // 3. Remove the record from database

    res.status(200).json({
      status: 'success',
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    next(error);
  }
};

