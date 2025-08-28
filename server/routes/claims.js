const express = require('express');
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const User = require('../models/User');
const { authenticateToken, requireAgent, requireOwnership } = require('../middleware/auth');

const router = express.Router();

// Get all claims (filtered by role)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let query = {};

    // Filter claims based on user role
    if (role === 'customer') {
      query.customer = userId;
    } else if (role === 'agent') {
      query.$or = [
        { customer: userId },
        { agent: userId },
        { 'investigation.assignedTo': userId }
      ];
    }
    // Admin can see all claims

    const claims = await Claim.find(query)
      .populate('customer', 'firstName lastName email')
      .populate('agent', 'firstName lastName email')
      .populate('policy', 'policyNumber policyType')
      .populate('investigation.assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: claims,
      count: claims.length
    });
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claims',
      error: error.message
    });
  }
});

// Get claim by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone address')
      .populate('agent', 'firstName lastName email phone')
      .populate('policy', 'policyNumber policyType coverage')
      .populate('investigation.assignedTo', 'firstName lastName email')
      .populate('notes.author', 'firstName lastName email');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Check if user has access to this claim
    if (req.user.role === 'customer' && claim.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: claim
    });
  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claim',
      error: error.message
    });
  }
});

// Create new claim
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { policyId, type, incidentDate, description, estimatedAmount, location } = req.body;

    // Validate required fields
    if (!policyId || !type || !incidentDate || !description || !estimatedAmount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Verify policy exists and belongs to user
    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    if (req.user.role === 'customer' && policy.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this policy'
      });
    }

    // Create claim
    const claimData = {
      policy: policyId,
      customer: policy.customer,
      agent: policy.agent,
      type,
      incidentDate,
      description,
      estimatedAmount,
      location: location || {},
      reportedDate: new Date()
    };

    const claim = await Claim.create(claimData);

    // Add initial timeline entry
    await claim.addTimelineEntry(
      'Claim Filed',
      'Claim was submitted successfully',
      req.user.id
    );

    // Populate references for response
    await claim.populate([
      { path: 'customer', select: 'firstName lastName email' },
      { path: 'policy', select: 'policyNumber policyType' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Claim created successfully',
      data: claim
    });
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create claim',
      error: error.message
    });
  }
});

// Update claim
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'customer' && claim.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only agents and admins can update certain fields
    const allowedUpdates = ['description', 'estimatedAmount', 'location'];
    if (req.user.role === 'agent' || req.user.role === 'admin') {
      allowedUpdates.push('status', 'priority', 'investigation', 'payment', 'appeal');
    }

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid updates provided'
      });
    }

    // Update claim
    Object.assign(claim, updates);
    await claim.save();

    // Add timeline entry
    await claim.addTimelineEntry(
      'Claim Updated',
      'Claim information was modified',
      req.user.id
    );

    res.json({
      success: true,
      message: 'Claim updated successfully',
      data: claim
    });
  } catch (error) {
    console.error('Error updating claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update claim',
      error: error.message
    });
  }
});

// Update claim status
router.patch('/:id/status', authenticateToken, requireAgent, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    await claim.updateStatus(status, reason, req.user.id);

    res.json({
      success: true,
      message: 'Claim status updated successfully',
      data: claim
    });
  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update claim status',
      error: error.message
    });
  }
});

// Assign investigator
router.patch('/:id/assign', authenticateToken, requireAgent, async (req, res) => {
  try {
    const { agentId, estimatedCompletion } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    await claim.assignInvestigator(agentId, estimatedCompletion);

    res.json({
      success: true,
      message: 'Investigator assigned successfully',
      data: claim
    });
  } catch (error) {
    console.error('Error assigning investigator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign investigator',
      error: error.message
    });
  }
});

// Approve claim
router.patch('/:id/approve', authenticateToken, requireAgent, async (req, res) => {
  try {
    const { amount, notes } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    await claim.approveClaim(amount, req.user.id, notes);

    res.json({
      success: true,
      message: 'Claim approved successfully',
      data: claim
    });
  } catch (error) {
    console.error('Error approving claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve claim',
      error: error.message
    });
  }
});

// Deny claim
router.patch('/:id/deny', authenticateToken, requireAgent, async (req, res) => {
  try {
    const { reason } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    await claim.denyClaim(reason, req.user.id);

    res.json({
      success: true,
      message: 'Claim denied successfully',
      data: claim
    });
  } catch (error) {
    console.error('Error denying claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deny claim',
      error: error.message
    });
  }
});

// Close claim
router.patch('/:id/close', authenticateToken, requireAgent, async (req, res) => {
  try {
    const { notes } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    await claim.closeClaim(req.user.id, notes);

    res.json({
      success: true,
      message: 'Claim closed successfully',
      data: claim
    });
  } catch (error) {
    console.error('Error closing claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close claim',
      error: error.message
    });
  }
});

// Add note to claim
router.post('/:id/notes', authenticateToken, async (req, res) => {
  try {
    const { content, isInternal } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'customer' && claim.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only agents can add internal notes
    if (isInternal && req.user.role === 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Customers cannot add internal notes'
      });
    }

    await claim.addNote(content, req.user.id, isInternal);

    res.json({
      success: true,
      message: 'Note added successfully',
      data: claim
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: error.message
    });
  }
});

// Get claim notes
router.get('/:id/notes', authenticateToken, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'customer' && claim.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Filter notes based on user role
    let notes = claim.notes;
    if (req.user.role === 'customer') {
      notes = notes.filter(note => !note.isInternal);
    }

    res.json({
      success: true,
      data: notes
    });
  } catch (error) {
    console.error('Error fetching claim notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claim notes',
      error: error.message
    });
  }
});

// Get claim timeline
router.get('/:id/timeline', authenticateToken, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'customer' && claim.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: claim.timeline
    });
  } catch (error) {
    console.error('Error fetching claim timeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claim timeline',
      error: error.message
    });
  }
});

// Get claims analytics
router.get('/analytics/overview', authenticateToken, async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let matchQuery = {};

    // Filter based on user role
    if (role === 'customer') {
      matchQuery.customer = userId;
    } else if (role === 'agent') {
      matchQuery.$or = [
        { customer: userId },
        { agent: userId },
        { 'investigation.assignedTo': userId }
      ];
    }

    const analytics = await Claim.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$estimatedAmount' }
        }
      },
      {
        $group: {
          _id: null,
          totalClaims: { $sum: '$count' },
          totalAmount: { $sum: '$totalAmount' },
          statusBreakdown: {
            $push: {
              status: '$_id',
              count: '$count',
              amount: '$totalAmount'
            }
          }
        }
      }
    ]);

    // Get recent claims
    const recentClaims = await Claim.find(matchQuery)
      .populate('customer', 'firstName lastName')
      .populate('policy', 'policyNumber policyType')
      .sort({ createdAt: -1 })
      .limit(5);

    const result = analytics[0] || {
      totalClaims: 0,
      totalAmount: 0,
      statusBreakdown: []
    };

    result.recentClaims = recentClaims;

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching claims analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claims analytics',
      error: error.message
    });
  }
});

// Delete claim (admin only)
router.delete('/:id', authenticateToken, requireAgent, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Only allow deletion of pending claims
    if (claim.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending claims can be deleted'
      });
    }

    await Claim.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Claim deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete claim',
      error: error.message
    });
  }
});

module.exports = router;
