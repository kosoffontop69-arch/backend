const User = require('../models/UserSQLite');
const { validationResult } = require('express-validator');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: JSON.parse(user.profile || '{}'),
          preferences: JSON.parse(user.preferences || '{}'),
          stats: JSON.parse(user.stats || '{}'),
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { profile, preferences } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const updateData = {};
    if (profile) updateData.profile = JSON.stringify(profile);
    if (preferences) updateData.preferences = JSON.stringify(preferences);

    await user.update(updateData);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: JSON.parse(user.profile || '{}'),
          preferences: JSON.parse(user.preferences || '{}'),
          stats: JSON.parse(user.stats || '{}'),
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const stats = JSON.parse(user.stats || '{}');

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          ideasRefined: stats.ideasRefined || 0,
          interviewsCompleted: stats.interviewsCompleted || 0,
          totalPracticeTime: stats.totalPracticeTime || 0,
          averageScore: stats.averageScore || 0
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    next(error);
  }
};

// @desc    Update user stats
// @route   PUT /api/users/stats
// @access  Private
exports.updateStats = async (req, res, next) => {
  try {
    const { ideasRefined, interviewsCompleted, totalPracticeTime, averageScore } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const currentStats = JSON.parse(user.stats || '{}');
    const updatedStats = {
      ...currentStats,
      ...(ideasRefined !== undefined && { ideasRefined }),
      ...(interviewsCompleted !== undefined && { interviewsCompleted }),
      ...(totalPracticeTime !== undefined && { totalPracticeTime }),
      ...(averageScore !== undefined && { averageScore })
    };

    await user.update({ stats: JSON.stringify(updatedStats) });

    res.status(200).json({
      status: 'success',
      message: 'Stats updated successfully',
      data: {
        stats: updatedStats
      }
    });
  } catch (error) {
    console.error('Update stats error:', error);
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin role required.'
      });
    }

    const { page = 1, limit = 10, role, isActive } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (role) whereClause.role = role;
    if (typeof isActive === 'boolean') whereClause.isActive = isActive;
    
    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        users: users.rows.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: JSON.parse(user.profile || '{}'),
          preferences: JSON.parse(user.preferences || '{}'),
          stats: JSON.parse(user.stats || '{}'),
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(users.count / limit),
          totalItems: users.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    next(error);
  }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin role required.'
      });
    }

    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: JSON.parse(user.profile || '{}'),
          preferences: JSON.parse(user.preferences || '{}'),
          stats: JSON.parse(user.stats || '{}'),
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    next(error);
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin role required.'
      });
    }

    const { name, email, role, isActive, profile, preferences } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (profile) updateData.profile = JSON.stringify(profile);
    if (preferences) updateData.preferences = JSON.stringify(preferences);

    await user.update(updateData);

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: JSON.parse(user.profile || '{}'),
          preferences: JSON.parse(user.preferences || '{}'),
          stats: JSON.parse(user.stats || '{}'),
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    next(error);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin role required.'
      });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    await user.destroy();

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    next(error);
  }
};

