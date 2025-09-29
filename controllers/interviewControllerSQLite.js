const Interview = require('../models/InterviewSQLite');
const User = require('../models/UserSQLite');
const aiService = require('../services/aiService');

// @desc    Create new interview
// @route   POST /api/interviews
// @access  Private
exports.createInterview = async (req, res, next) => {
  try {
    const { title, mode, configuration, tags, isPublic } = req.body;
    
    const interview = await Interview.create({
      userId: req.user.id,
      title,
      mode,
      configuration: JSON.stringify(configuration || {}),
      tags: JSON.stringify(tags || []),
      isPublic: isPublic || false,
      status: 'draft'
    });

    res.status(201).json({
      status: 'success',
      data: {
        interview: {
          id: interview.id,
          title: interview.title,
          mode: interview.mode,
          configuration: JSON.parse(interview.configuration),
          tags: JSON.parse(interview.tags),
          isPublic: interview.isPublic,
          status: interview.status,
          createdAt: interview.createdAt,
          updatedAt: interview.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Create interview error:', error);
    next(error);
  }
};

// @desc    Get user's interviews
// @route   GET /api/interviews
// @access  Private
exports.getInterviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, mode } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = { userId: req.user.id };
    if (status) whereClause.status = status;
    if (mode) whereClause.mode = mode;
    
    const interviews = await Interview.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        interviews: interviews.rows.map(interview => ({
          id: interview.id,
          title: interview.title,
          mode: interview.mode,
          configuration: JSON.parse(interview.configuration),
          tags: JSON.parse(interview.tags),
          isPublic: interview.isPublic,
          status: interview.status,
          score: interview.score,
          feedback: interview.feedback ? JSON.parse(interview.feedback) : null,
          createdAt: interview.createdAt,
          updatedAt: interview.updatedAt
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(interviews.count / limit),
          totalItems: interviews.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get interviews error:', error);
    next(error);
  }
};

// @desc    Get single interview
// @route   GET /api/interviews/:id
// @access  Private
exports.getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    });

    if (!interview) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        interview: {
          id: interview.id,
          title: interview.title,
          mode: interview.mode,
          configuration: JSON.parse(interview.configuration),
          tags: JSON.parse(interview.tags),
          isPublic: interview.isPublic,
          status: interview.status,
          questions: interview.questions ? JSON.parse(interview.questions) : [],
          responses: interview.responses ? JSON.parse(interview.responses) : [],
          score: interview.score,
          feedback: interview.feedback ? JSON.parse(interview.feedback) : null,
          createdAt: interview.createdAt,
          updatedAt: interview.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get interview error:', error);
    next(error);
  }
};

// @desc    Start interview
// @route   POST /api/interviews/:id/start
// @access  Private
exports.startInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    });

    if (!interview) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview not found'
      });
    }

    if (interview.status !== 'draft') {
      return res.status(400).json({
        status: 'error',
        message: 'Interview has already been started or completed'
      });
    }

    // Generate questions using AI
    const configuration = JSON.parse(interview.configuration);
    const questions = await aiService.generateInterviewQuestions(configuration);

    // Update interview with questions and start
    await interview.update({
      status: 'in-progress',
      questions: JSON.stringify(questions),
      startedAt: new Date()
    });

    res.status(200).json({
      status: 'success',
      data: {
        interview: {
          id: interview.id,
          title: interview.title,
          mode: interview.mode,
          configuration: JSON.parse(interview.configuration),
          questions: questions,
          status: 'in-progress',
          startedAt: interview.startedAt
        }
      }
    });
  } catch (error) {
    console.error('Start interview error:', error);
    next(error);
  }
};

// @desc    Submit response
// @route   POST /api/interviews/:id/responses
// @access  Private
exports.submitResponse = async (req, res, next) => {
  try {
    const { questionId, answerText, responseTime, audioUrl } = req.body;
    
    const interview = await Interview.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    });

    if (!interview) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview not found'
      });
    }

    if (interview.status !== 'in-progress') {
      return res.status(400).json({
        status: 'error',
        message: 'Interview is not in progress'
      });
    }

    const responses = interview.responses ? JSON.parse(interview.responses) : [];
    const newResponse = {
      questionId,
      answerText,
      responseTime,
      audioUrl,
      submittedAt: new Date()
    };

    responses.push(newResponse);

    await interview.update({
      responses: JSON.stringify(responses)
    });

    res.status(200).json({
      status: 'success',
      data: {
        response: newResponse
      }
    });
  } catch (error) {
    console.error('Submit response error:', error);
    next(error);
  }
};

// @desc    Complete interview
// @route   POST /api/interviews/:id/complete
// @access  Private
exports.completeInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    });

    if (!interview) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview not found'
      });
    }

    if (interview.status !== 'in-progress') {
      return res.status(400).json({
        status: 'error',
        message: 'Interview is not in progress'
      });
    }

    // Generate feedback using AI
    const questions = JSON.parse(interview.questions || '[]');
    const responses = JSON.parse(interview.responses || '[]');
    const configuration = JSON.parse(interview.configuration);
    
    const feedback = await aiService.generateInterviewFeedback(questions, responses, configuration);
    const score = feedback.overallScore || 0;

    // Update interview
    await interview.update({
      status: 'completed',
      completedAt: new Date(),
      score: score,
      feedback: JSON.stringify(feedback)
    });

    // Update user stats
    const user = await User.findByPk(req.user.id);
    const stats = JSON.parse(user.stats || '{}');
    stats.interviewsCompleted = (stats.interviewsCompleted || 0) + 1;
    stats.averageScore = ((stats.averageScore || 0) * (stats.interviewsCompleted - 1) + score) / stats.interviewsCompleted;
    await user.update({ stats: JSON.stringify(stats) });

    res.status(200).json({
      status: 'success',
      data: {
        interview: {
          id: interview.id,
          title: interview.title,
          status: 'completed',
          score: score,
          feedback: feedback,
          completedAt: interview.completedAt
        }
      }
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    next(error);
  }
};

// @desc    Get interview feedback
// @route   GET /api/interviews/:id/feedback
// @access  Private
exports.getInterviewFeedback = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    });

    if (!interview) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview not found'
      });
    }

    if (interview.status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Interview is not completed yet'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        feedback: JSON.parse(interview.feedback),
        score: interview.score,
        completedAt: interview.completedAt
      }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    next(error);
  }
};

// @desc    Update interview
// @route   PUT /api/interviews/:id
// @access  Private
exports.updateInterview = async (req, res, next) => {
  try {
    const { title, configuration, tags, isPublic } = req.body;
    
    const interview = await Interview.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    });

    if (!interview) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview not found'
      });
    }

    if (interview.status !== 'draft') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot update interview that has been started'
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (configuration) updateData.configuration = JSON.stringify(configuration);
    if (tags) updateData.tags = JSON.stringify(tags);
    if (typeof isPublic === 'boolean') updateData.isPublic = isPublic;

    await interview.update(updateData);

    res.status(200).json({
      status: 'success',
      data: {
        interview: {
          id: interview.id,
          title: interview.title,
          mode: interview.mode,
          configuration: JSON.parse(interview.configuration),
          tags: JSON.parse(interview.tags),
          isPublic: interview.isPublic,
          status: interview.status,
          updatedAt: interview.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update interview error:', error);
    next(error);
  }
};

// @desc    Delete interview
// @route   DELETE /api/interviews/:id
// @access  Private
exports.deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    });

    if (!interview) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview not found'
      });
    }

    await interview.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Interview deleted successfully'
    });
  } catch (error) {
    console.error('Delete interview error:', error);
    next(error);
  }
};

// @desc    Get public interviews
// @route   GET /api/interviews/public
// @access  Public
exports.getPublicInterviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, mode } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = { isPublic: true };
    if (mode) whereClause.mode = mode;
    
    const interviews = await Interview.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        interviews: interviews.rows.map(interview => ({
          id: interview.id,
          title: interview.title,
          mode: interview.mode,
          configuration: JSON.parse(interview.configuration),
          tags: JSON.parse(interview.tags),
          score: interview.score,
          createdAt: interview.createdAt,
          user: {
            id: interview.User.id,
            name: interview.User.name
          }
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(interviews.count / limit),
          totalItems: interviews.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get public interviews error:', error);
    next(error);
  }
};

