const express = require('express');
const Policy = require('../models/Policy');
const User = require('../models/User');
const { authenticateToken, requireAgent, requireOwnership } = require('../middleware/auth');

const router = express.Router();

// Get all policies (with role-based filtering)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, policyType, customer, agent, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Build query based on user role
    let query = {};
    
    if (userRole === 'customer') {
      query.customer = userId;
    } else if (userRole === 'agent') {
      query.agent = userId;
    }
    // Admin can see all policies

    if (status) query.status = status;
    if (policyType) query.policyType = policyType;
    if (customer && userRole !== 'customer') query.customer = customer;
    if (agent && userRole !== 'agent') query.agent = agent;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const policies = await Policy.find(query)
      .populate('customer', 'firstName lastName email')
      .populate('agent', 'firstName lastName email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Policy.countDocuments(query);

    res.json({
      success: true,
      data: policies,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get policies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policies'
    });
  }
});

// Get policy by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const policyId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const policy = await Policy.findById(policyId)
      .populate('customer', 'firstName lastName email phone address')
      .populate('agent', 'firstName lastName email phone')
      .populate('lastModifiedBy', 'firstName lastName');

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check access permissions
    if (userRole === 'customer' && policy.customer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (userRole === 'agent' && policy.agent.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: policy
    });

  } catch (error) {
    console.error('Get policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policy'
    });
  }
});

// Create new policy (agent/admin only)
router.post('/', authenticateToken, requireAgent, async (req, res) => {
  try {
    const { customer, policyType, startDate, endDate, premium, coverage, insuredItems } = req.body;
    const agentId = req.user.userId;

    // Validation
    if (!customer || !policyType || !startDate || !endDate || !premium || !coverage) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if customer exists
    const customerExists = await User.findById(customer);
    if (!customerExists) {
      return res.status(400).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Create new policy
    const newPolicy = new Policy({
      customer,
      agent: agentId,
      policyType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      premium: {
        amount: premium.amount,
        frequency: premium.frequency || 'monthly',
        nextDueDate: new Date(premium.nextDueDate || startDate)
      },
      coverage,
      insuredItems: insuredItems || [],
      lastModifiedBy: agentId
    });

    await newPolicy.save();

    // Populate customer and agent info
    await newPolicy.populate('customer', 'firstName lastName email');
    await newPolicy.populate('agent', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      data: newPolicy
    });

  } catch (error) {
    console.error('Create policy error:', error);
    
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
      message: 'Failed to create policy'
    });
  }
});

// Update policy
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const policyId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const updateData = req.body;

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check access permissions
    if (userRole === 'customer' && policy.customer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (userRole === 'agent' && policy.agent.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update policy
    updateData.lastModifiedBy = userId;
    const updatedPolicy = await Policy.findByIdAndUpdate(
      policyId,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('customer', 'firstName lastName email phone address')
    .populate('agent', 'firstName lastName email phone')
    .populate('lastModifiedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Policy updated successfully',
      data: updatedPolicy
    });

  } catch (error) {
    console.error('Update policy error:', error);
    
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
      message: 'Failed to update policy'
    });
  }
});

// Delete policy (admin only)
router.delete('/:id', authenticateToken, requireAgent, async (req, res) => {
  try {
    const policyId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check access permissions
    if (userRole === 'agent' && policy.agent.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Soft delete by changing status to cancelled
    policy.status = 'cancelled';
    policy.cancellationReason = 'Policy cancelled by user';
    policy.lastModifiedBy = userId;
    await policy.save();

    res.json({
      success: true,
      message: 'Policy cancelled successfully'
    });

  } catch (error) {
    console.error('Delete policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel policy'
    });
  }
});

// Renew policy
router.post('/:id/renew', authenticateToken, async (req, res) => {
  try {
    const policyId = req.params.id;
    const { newEndDate, premiumAdjustment } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check access permissions
    if (userRole === 'customer' && policy.customer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (userRole === 'agent' && policy.agent.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Calculate new premium
    let newPremium = policy.premium.amount;
    if (premiumAdjustment) {
      newPremium = Math.max(0, newPremium + premiumAdjustment);
    }

    // Create renewal policy
    const renewalPolicy = new Policy({
      customer: policy.customer,
      agent: policy.agent,
      policyType: policy.policyType,
      startDate: policy.endDate,
      endDate: new Date(newEndDate),
      premium: {
        amount: newPremium,
        frequency: policy.premium.frequency,
        nextDueDate: new Date(newEndDate)
      },
      coverage: policy.coverage,
      insuredItems: policy.insuredItems,
      lastModifiedBy: userId
    });

    await renewalPolicy.save();

    // Update original policy status
    policy.status = 'expired';
    policy.lastModifiedBy = userId;
    await policy.save();

    // Populate customer and agent info
    await renewalPolicy.populate('customer', 'firstName lastName email');
    await renewalPolicy.populate('agent', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Policy renewed successfully',
      data: renewalPolicy
    });

  } catch (error) {
    console.error('Renew policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to renew policy'
    });
  }
});

// Get policy documents
router.get('/:id/documents', authenticateToken, async (req, res) => {
  try {
    const policyId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check access permissions
    if (userRole === 'customer' && policy.customer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: policy.documents
    });

  } catch (error) {
    console.error('Get policy documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policy documents'
    });
  }
});

// Add document to policy
router.post('/:id/documents', authenticateToken, requireAgent, async (req, res) => {
  try {
    const policyId = req.params.id;
    const { name, type, url } = req.body;
    const userId = req.user.userId;

    if (!name || !type || !url) {
      return res.status(400).json({
        success: false,
        message: 'Document name, type, and URL are required'
      });
    }

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check if agent is assigned to this policy
    if (policy.agent.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add document
    policy.documents.push({
      name,
      type,
      url,
      uploadedAt: new Date(),
      uploadedBy: userId
    });

    policy.lastModifiedBy = userId;
    await policy.save();

    res.json({
      success: true,
      message: 'Document added successfully',
      data: policy.documents[policy.documents.length - 1]
    });

  } catch (error) {
    console.error('Add policy document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add document'
    });
  }
});

// Get policy notes
router.get('/:id/notes', authenticateToken, async (req, res) => {
  try {
    const policyId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const policy = await Policy.findById(policyId)
      .populate('notes.author', 'firstName lastName');

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check access permissions
    if (userRole === 'customer' && policy.customer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: policy.notes
    });

  } catch (error) {
    console.error('Get policy notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policy notes'
    });
  }
});

// Add note to policy
router.post('/:id/notes', authenticateToken, async (req, res) => {
  try {
    const policyId = req.params.id;
    const { content } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check access permissions
    if (userRole === 'customer' && policy.customer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add note
    await policy.addNote(content, userId);

    // Populate author info
    await policy.populate('notes.author', 'firstName lastName');

    res.json({
      success: true,
      message: 'Note added successfully',
      data: policy.notes[policy.notes.length - 1]
    });

  } catch (error) {
    console.error('Add policy note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note'
    });
  }
});

// Get policy analytics
router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const policyId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check access permissions
    if (userRole === 'customer' && policy.customer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Calculate analytics
    const analytics = {
      policyInfo: {
        policyNumber: policy.policyNumber,
        policyType: policy.policyType,
        status: policy.status,
        startDate: policy.startDate,
        endDate: policy.endDate,
        duration: policy.duration,
        daysUntilExpiration: policy.daysUntilExpiration
      },
      premium: {
        current: policy.premium.amount,
        frequency: policy.premium.frequency,
        nextDueDate: policy.premium.nextDueDate,
        renewalEstimate: policy.calculateRenewalPremium()
      },
      coverage: {
        total: (policy.coverage.limits.liability || 0) + (policy.coverage.limits.property || 0),
        liability: policy.coverage.limits.liability,
        property: policy.coverage.limits.property,
        medical: policy.coverage.limits.medical,
        uninsured: policy.coverage.limits.uninsured
      },
      claims: {
        total: policy.claims.length,
        totalAmount: policy.totalClaimsAmount,
        byStatus: policy.claims.reduce((acc, claim) => {
          acc[claim.status] = (acc[claim.status] || 0) + 1;
          return acc;
        }, {})
      }
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get policy analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policy analytics'
    });
  }
});

module.exports = router;
