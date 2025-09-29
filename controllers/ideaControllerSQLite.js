const Idea = require('../models/IdeaSQLite');
const aiService = require('../services/aiService');
const { validationResult } = require('express-validator');

// @desc    Create new idea
// @route   POST /api/ideas
// @access  Private
exports.createIdea = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, originalInput, context, tone } = req.body;

    // Create initial idea document
    const idea = await Idea.create({
      userId: req.user.id,
      title,
      originalInput,
      context,
      customization: JSON.stringify({
        tone: tone || 'persuasive'
      }),
      status: 'processing'
    });

    // Process with AI in the background
    try {
      const structuredContent = await aiService.structureIdea(originalInput, context, tone);
      const feedback = await aiService.generateFeedback(structuredContent);
      const outputs = await aiService.generateOutputs(structuredContent, context);

      // Update idea with AI results
      await idea.update({
        structuredContent: JSON.stringify(structuredContent),
        feedback: JSON.stringify(feedback),
        outputs: JSON.stringify(outputs),
        status: 'completed'
      });

      res.status(201).json({
        status: 'success',
        message: 'Idea created and processed successfully',
        idea: {
          id: idea.id,
          userId: idea.userId,
          title: idea.title,
          originalInput: idea.originalInput,
          context: idea.context,
          structuredContent: JSON.parse(idea.structuredContent || '{}'),
          customization: JSON.parse(idea.customization || '{}'),
          attachments: JSON.parse(idea.attachments || '[]'),
          feedback: JSON.parse(idea.feedback || '{}'),
          outputs: JSON.parse(idea.outputs || '{}'),
          status: idea.status,
          isPublic: idea.isPublic,
          tags: JSON.parse(idea.tags || '[]'),
          views: idea.views,
          likes: JSON.parse(idea.likes || '[]'),
          aiProcessingTime: idea.aiProcessingTime,
          createdAt: idea.createdAt,
          updatedAt: idea.updatedAt
        }
      });
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      // Update idea with error status
      await idea.update({
        status: 'error',
        feedback: JSON.stringify({
          error: 'AI processing failed. Please try again.'
        })
      });

      res.status(201).json({
        status: 'success',
        message: 'Idea created but AI processing failed',
        idea: {
          id: idea.id,
          userId: idea.userId,
          title: idea.title,
          originalInput: idea.originalInput,
          context: idea.context,
          structuredContent: JSON.parse(idea.structuredContent || '{}'),
          customization: JSON.parse(idea.customization || '{}'),
          attachments: JSON.parse(idea.attachments || '[]'),
          feedback: JSON.parse(idea.feedback || '{}'),
          outputs: JSON.parse(idea.outputs || '{}'),
          status: idea.status,
          isPublic: idea.isPublic,
          tags: JSON.parse(idea.tags || '[]'),
          views: idea.views,
          likes: JSON.parse(idea.likes || '[]'),
          aiProcessingTime: idea.aiProcessingTime,
          createdAt: idea.createdAt,
          updatedAt: idea.updatedAt
        }
      });
    }
  } catch (error) {
    console.error('Create idea error:', error);
    next(error);
  }
};

// @desc    Get all ideas for user
// @route   GET /api/ideas
// @access  Private
exports.getIdeas = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, context } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };
    if (status) whereClause.status = status;
    if (context) whereClause.context = context;

    const ideas = await Idea.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const formattedIdeas = ideas.rows.map(idea => ({
      id: idea.id,
      userId: idea.userId,
      title: idea.title,
      originalInput: idea.originalInput,
      context: idea.context,
      structuredContent: JSON.parse(idea.structuredContent || '{}'),
      customization: JSON.parse(idea.customization || '{}'),
      attachments: JSON.parse(idea.attachments || '[]'),
      feedback: JSON.parse(idea.feedback || '{}'),
      outputs: JSON.parse(idea.outputs || '{}'),
      status: idea.status,
      isPublic: idea.isPublic,
      tags: JSON.parse(idea.tags || '[]'),
      views: idea.views,
      likes: JSON.parse(idea.likes || '[]'),
      aiProcessingTime: idea.aiProcessingTime,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt
    }));

    res.status(200).json({
      status: 'success',
      count: ideas.count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(ideas.count / limit)
      },
      ideas: formattedIdeas
    });
  } catch (error) {
    console.error('Get ideas error:', error);
    next(error);
  }
};

// @desc    Get single idea
// @route   GET /api/ideas/:id
// @access  Private
exports.getIdea = async (req, res, next) => {
  try {
    const idea = await Idea.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!idea) {
      return res.status(404).json({
        status: 'error',
        message: 'Idea not found'
      });
    }

    // Increment views
    await idea.update({ views: idea.views + 1 });

    res.status(200).json({
      status: 'success',
      idea: {
        id: idea.id,
        userId: idea.userId,
        title: idea.title,
        originalInput: idea.originalInput,
        context: idea.context,
        structuredContent: JSON.parse(idea.structuredContent || '{}'),
        customization: JSON.parse(idea.customization || '{}'),
        attachments: JSON.parse(idea.attachments || '[]'),
        feedback: JSON.parse(idea.feedback || '{}'),
        outputs: JSON.parse(idea.outputs || '{}'),
        status: idea.status,
        isPublic: idea.isPublic,
        tags: JSON.parse(idea.tags || '[]'),
        views: idea.views,
        likes: JSON.parse(idea.likes || '[]'),
        aiProcessingTime: idea.aiProcessingTime,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt
      }
    });
  } catch (error) {
    console.error('Get idea error:', error);
    next(error);
  }
};

// @desc    Update idea
// @route   PUT /api/ideas/:id
// @access  Private
exports.updateIdea = async (req, res, next) => {
  try {
    const { title, originalInput, context, customization, tags } = req.body;

    const idea = await Idea.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!idea) {
      return res.status(404).json({
        status: 'error',
        message: 'Idea not found'
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (originalInput) updateData.originalInput = originalInput;
    if (context) updateData.context = context;
    if (customization) updateData.customization = JSON.stringify(customization);
    if (tags) updateData.tags = JSON.stringify(tags);

    await idea.update(updateData);

    res.status(200).json({
      status: 'success',
      message: 'Idea updated successfully',
      idea: {
        id: idea.id,
        userId: idea.userId,
        title: idea.title,
        originalInput: idea.originalInput,
        context: idea.context,
        structuredContent: JSON.parse(idea.structuredContent || '{}'),
        customization: JSON.parse(idea.customization || '{}'),
        attachments: JSON.parse(idea.attachments || '[]'),
        feedback: JSON.parse(idea.feedback || '{}'),
        outputs: JSON.parse(idea.outputs || '{}'),
        status: idea.status,
        isPublic: idea.isPublic,
        tags: JSON.parse(idea.tags || '[]'),
        views: idea.views,
        likes: JSON.parse(idea.likes || '[]'),
        aiProcessingTime: idea.aiProcessingTime,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt
      }
    });
  } catch (error) {
    console.error('Update idea error:', error);
    next(error);
  }
};

// @desc    Delete idea
// @route   DELETE /api/ideas/:id
// @access  Private
exports.deleteIdea = async (req, res, next) => {
  try {
    const idea = await Idea.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!idea) {
      return res.status(404).json({
        status: 'error',
        message: 'Idea not found'
      });
    }

    await idea.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Idea deleted successfully'
    });
  } catch (error) {
    console.error('Delete idea error:', error);
    next(error);
  }
};

// @desc    Reprocess idea with AI
// @route   POST /api/ideas/:id/reprocess
// @access  Private
exports.reprocessIdea = async (req, res, next) => {
  try {
    const { tone, context } = req.body;

    const idea = await Idea.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!idea) {
      return res.status(404).json({
        status: 'error',
        message: 'Idea not found'
      });
    }

    // Update status to processing
    await idea.update({ status: 'processing' });

    try {
      const structuredContent = await aiService.structureIdea(
        idea.originalInput,
        context || idea.context,
        tone || JSON.parse(idea.customization || '{}').tone
      );
      const feedback = await aiService.generateFeedback(structuredContent);
      const outputs = await aiService.generateOutputs(structuredContent, context || idea.context);

      // Update idea with new AI results
      await idea.update({
        structuredContent: JSON.stringify(structuredContent),
        feedback: JSON.stringify(feedback),
        outputs: JSON.stringify(outputs),
        status: 'completed'
      });

      res.status(200).json({
        status: 'success',
        message: 'Idea reprocessed successfully',
        idea: {
          id: idea.id,
          userId: idea.userId,
          title: idea.title,
          originalInput: idea.originalInput,
          context: idea.context,
          structuredContent: JSON.parse(idea.structuredContent || '{}'),
          customization: JSON.parse(idea.customization || '{}'),
          attachments: JSON.parse(idea.attachments || '[]'),
          feedback: JSON.parse(idea.feedback || '{}'),
          outputs: JSON.parse(idea.outputs || '{}'),
          status: idea.status,
          isPublic: idea.isPublic,
          tags: JSON.parse(idea.tags || '[]'),
          views: idea.views,
          likes: JSON.parse(idea.likes || '[]'),
          aiProcessingTime: idea.aiProcessingTime,
          createdAt: idea.createdAt,
          updatedAt: idea.updatedAt
        }
      });
    } catch (aiError) {
      console.error('AI reprocessing error:', aiError);
      await idea.update({
        status: 'error',
        feedback: JSON.stringify({
          error: 'AI reprocessing failed. Please try again.'
        })
      });

      res.status(500).json({
        status: 'error',
        message: 'AI reprocessing failed'
      });
    }
  } catch (error) {
    console.error('Reprocess idea error:', error);
    next(error);
  }
};

// @desc    Generate summary
// @route   POST /api/ideas/:id/summary
// @access  Private
exports.generateSummary = async (req, res, next) => {
  try {
    const idea = await Idea.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!idea) {
      return res.status(404).json({
        status: 'error',
        message: 'Idea not found'
      });
    }

    const structuredContent = JSON.parse(idea.structuredContent || '{}');
    if (!structuredContent || Object.keys(structuredContent).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Idea must be processed first'
      });
    }

    const summary = await aiService.generateSummary(structuredContent);

    res.status(200).json({
      status: 'success',
      summary
    });
  } catch (error) {
    console.error('Generate summary error:', error);
    next(error);
  }
};
