const express = require('express');
const User = require('../models/User');
const { authenticateToken, requireAdmin, requireAgent } = require('../middleware/auth');

const router = express.Router();

// Create user (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { firstName, lastName, password, email, account, role } = req.body;

    if (!firstName || !lastName || !password) {
      return res.status(400).json({ success: false, message: 'firstName, lastName and password are required' });
    }

    // Auto-generate unique email if not provided
    let finalEmail = (email || '').toString().trim().toLowerCase();
    if (!finalEmail) {
      const slug = `${(firstName||'').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g,'-')}.${(lastName||'').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g,'-')}`.replace(/-+/g,'-').replace(/^\-|\-$/g,'');
      let candidate = `${slug || 'user' }@local.test`;
      let n = 1;
      while (await User.exists({ email: candidate })) {
        n += 1;
        candidate = `${slug || 'user'}${n}@local.test`;
      }
      finalEmail = candidate;
    }

    const newUser = new User({
      firstName,
      lastName,
      email: finalEmail,
      password,
      role: role && ['customer','agent','admin'].includes(role) ? role : 'customer',
      account: {
        balance: account?.balance ?? 0,
        transferFee: account?.transferFee ?? 0,
      }
    });

    await newUser.save();

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const users = await User.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get user by ID (admin/agent or own profile)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const requestingUser = req.user;

    // Users can only access their own profile unless they're admin/agent
    if (requestingUser.userId !== userId && !['admin', 'agent'].includes(requestingUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// Update user (admin/agent or own profile)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const requestingUser = req.user;
    const updateData = req.body;

    // Users can only update their own profile unless they're admin/agent
    if (requestingUser.userId !== userId && !['admin', 'agent'].includes(requestingUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Non-admin users cannot change role or sensitive fields
    if (requestingUser.role !== 'admin') {
      delete updateData.role;
      delete updateData.isActive;
      delete updateData.emailVerified;
      delete updateData.phoneVerified;
      delete updateData.security;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Deactivate user (admin only)
router.patch('/:id/deactivate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deactivating themselves
    if (userId === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: user
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user'
    });
  }
});

// Reactivate user (admin only)
router.patch('/:id/reactivate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User reactivated successfully',
      data: user
    });

  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate user'
    });
  }
});

// Get agents (for customer selection)
router.get('/agents/list', authenticateToken, async (req, res) => {
  try {
    const agents = await User.find({ 
      role: 'agent', 
      isActive: true 
    })
    .select('firstName lastName email phone')
    .sort({ firstName: 1, lastName: 1 });

    res.json({
      success: true,
      data: agents
    });

  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agents'
    });
  }
});

// Get user dashboard data
router.get('/:id/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const requestingUser = req.user;

    // Users can only access their own dashboard unless they're admin/agent
    if (requestingUser.userId !== userId && !['admin', 'agent'].includes(requestingUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Basic user stats
    const stats = {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      profile: {
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        profilePicture: user.profilePicture
      },
      preferences: user.preferences
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user dashboard'
    });
  }
});

// Update user preferences
router.put('/:id/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const requestingUser = req.user;
    const { preferences } = req.body;

    // Users can only update their own preferences
    if (requestingUser.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

// Get user activity log (admin/agent or own)
router.get('/:id/activity', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const requestingUser = req.user;
    const { limit = 50 } = req.query;

    // Users can only access their own activity unless they're admin/agent
    if (requestingUser.userId !== userId && !['admin', 'agent'].includes(requestingUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // For now, return basic user activity
    // In a real application, you might want to track user actions in a separate collection
    const activity = [
      {
        action: 'Account created',
        timestamp: user.createdAt,
        description: 'User account was created'
      }
    ];

    if (user.lastLogin) {
      activity.push({
        action: 'Last login',
        timestamp: user.lastLogin,
        description: 'User last logged in'
      });
    }

    if (user.updatedAt !== user.createdAt) {
      activity.push({
        action: 'Profile updated',
        timestamp: user.updatedAt,
        description: 'User profile was last updated'
      });
    }

    // Sort by timestamp (newest first)
    activity.sort((a, b) => b.timestamp - a.timestamp);

    res.json({
      success: true,
      data: activity.slice(0, limit)
    });

  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity'
    });
  }
});

module.exports = router;
