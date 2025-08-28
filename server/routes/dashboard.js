const express = require('express');
const User = require('../models/User');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get dashboard overview (protected route)
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let dashboardData = {};

    if (userRole === 'customer') {
      // Customer dashboard
      const policies = await Policy.find({ customer: userId }).populate('agent', 'firstName lastName email');
      const claims = await Claim.find({ customer: userId }).populate('policy', 'policyNumber policyType');
      
      const activePolicies = policies.filter(policy => policy.status === 'active');
      const expiringPolicies = policies.filter(policy => {
        const daysUntilExpiration = policy.daysUntilExpiration;
        return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
      });
      
      const totalPremium = activePolicies.reduce((sum, policy) => sum + policy.premium.amount, 0);
      const totalCoverage = activePolicies.reduce((sum, policy) => {
        const coverage = policy.coverage.limits;
        return sum + (coverage.liability || 0) + (coverage.property || 0);
      }, 0);

      dashboardData = {
        policies: {
          total: policies.length,
          active: activePolicies.length,
          expiring: expiringPolicies.length,
          totalPremium,
          totalCoverage
        },
        claims: {
          total: claims.length,
          pending: claims.filter(c => c.status === 'pending').length,
          approved: claims.filter(c => c.status === 'approved').length,
          totalAmount: claims.reduce((sum, claim) => sum + (claim.approvedAmount || 0), 0)
        },
        recentPolicies: policies.slice(0, 5),
        recentClaims: claims.slice(0, 5),
        expiringPolicies
      };

    } else if (userRole === 'agent') {
      // Agent dashboard
      const assignedPolicies = await Policy.find({ agent: userId }).populate('customer', 'firstName lastName email');
      const assignedClaims = await Claim.find({ agent: userId }).populate('customer', 'firstName lastName email');
      
      const activePolicies = assignedPolicies.filter(policy => policy.status === 'active');
      const pendingClaims = assignedClaims.filter(claim => claim.status === 'pending');
      
      const totalPremium = activePolicies.reduce((sum, policy) => sum + policy.premium.amount, 0);
      const totalClaimsValue = assignedClaims.reduce((sum, claim) => sum + (claim.estimatedAmount || 0), 0);

      dashboardData = {
        policies: {
          total: assignedPolicies.length,
          active: activePolicies.length,
          totalPremium
        },
        claims: {
          total: assignedClaims.length,
          pending: pendingClaims.length,
          totalValue: totalClaimsValue
        },
        assignedPolicies: assignedPolicies.slice(0, 10),
        assignedClaims: assignedClaims.slice(0, 10),
        pendingClaims
      };

    } else if (userRole === 'admin') {
      // Admin dashboard
      const totalUsers = await User.countDocuments();
      const totalPolicies = await Policy.countDocuments();
      const totalClaims = await Claim.countDocuments();
      
      const activePolicies = await Policy.countDocuments({ status: 'active' });
      const pendingClaims = await Claim.countDocuments({ status: 'pending' });
      
      const policiesByType = await Policy.aggregate([
        { $group: { _id: '$policyType', count: { $sum: 1 } } }
      ]);
      
      const claimsByStatus = await Claim.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
      const recentPolicies = await Policy.find().populate('customer', 'firstName lastName').sort({ createdAt: -1 }).limit(5);
      const recentClaims = await Claim.find().populate('customer', 'firstName lastName').sort({ createdAt: -1 }).limit(5);

      dashboardData = {
        overview: {
          totalUsers,
          totalPolicies,
          totalClaims,
          activePolicies,
          pendingClaims
        },
        analytics: {
          policiesByType,
          claimsByStatus
        },
        recentUsers,
        recentPolicies,
        recentClaims
      };
    }

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// Get user statistics (protected route)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'customer') {
      // Customer statistics
      const policies = await Policy.find({ customer: userId });
      const claims = await Claim.find({ customer: userId });

      const monthlyPremiums = policies
        .filter(policy => policy.status === 'active')
        .reduce((sum, policy) => {
          if (policy.premium.frequency === 'monthly') return sum + policy.premium.amount;
          if (policy.premium.frequency === 'quarterly') return sum + (policy.premium.amount / 3);
          if (policy.premium.frequency === 'semi-annually') return sum + (policy.premium.amount / 6);
          if (policy.premium.frequency === 'annually') return sum + (policy.premium.amount / 12);
          return sum;
        }, 0);

      const annualPremiums = monthlyPremiums * 12;
      const totalCoverage = policies
        .filter(policy => policy.status === 'active')
        .reduce((sum, policy) => {
          const coverage = policy.coverage.limits;
          return sum + (coverage.liability || 0) + (coverage.property || 0);
        }, 0);

      stats = {
        policies: {
          total: policies.length,
          active: policies.filter(p => p.status === 'active').length,
          expiring: policies.filter(p => p.daysUntilExpiration <= 30).length
        },
        premiums: {
          monthly: monthlyPremiums,
          annual: annualPremiums
        },
        coverage: {
          total: totalCoverage
        },
        claims: {
          total: claims.length,
          pending: claims.filter(c => c.status === 'pending').length,
          approved: claims.filter(c => c.status === 'approved').length,
          totalAmount: claims.reduce((sum, c) => sum + (c.approvedAmount || 0), 0)
        }
      };

    } else if (userRole === 'agent') {
      // Agent statistics
      const assignedPolicies = await Policy.find({ agent: userId });
      const assignedClaims = await Claim.find({ agent: userId });

      const totalPremium = assignedPolicies
        .filter(policy => policy.status === 'active')
        .reduce((sum, policy) => sum + policy.premium.amount, 0);

      const claimsByPriority = await Claim.aggregate([
        { $match: { agent: userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]);

      stats = {
        policies: {
          total: assignedPolicies.length,
          active: assignedPolicies.filter(p => p.status === 'active').length
        },
        premiums: {
          total: totalPremium
        },
        claims: {
          total: assignedClaims.length,
          pending: assignedClaims.filter(c => c.status === 'pending').length,
          byPriority: claimsByPriority
        }
      };

    } else if (userRole === 'admin') {
      // Admin statistics
      const totalUsers = await User.countDocuments();
      const totalPolicies = await Policy.countDocuments();
      const totalClaims = await Claim.countDocuments();

      const usersByRole = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);

      const policiesByStatus = await Policy.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      const claimsByStatus = await Claim.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      const totalRevenue = await Policy.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, total: { $sum: '$premium.amount' } } }
      ]);

      stats = {
        users: {
          total: totalUsers,
          byRole: usersByRole
        },
        policies: {
          total: totalPolicies,
          byStatus: policiesByStatus
        },
        claims: {
          total: totalClaims,
          byStatus: claimsByStatus
        },
        revenue: {
          total: totalRevenue[0]?.total || 0
        }
      };
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// Get recent activity (protected route)
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const limit = parseInt(req.query.limit) || 20;

    let activities = [];

    if (userRole === 'customer') {
      // Customer activity
      const policies = await Policy.find({ customer: userId })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .populate('agent', 'firstName lastName');

      const claims = await Claim.find({ customer: userId })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .populate('policy', 'policyNumber policyType');

      activities = [
        ...policies.map(policy => ({
          type: 'policy',
          action: 'Policy updated',
          description: `${policy.policyType} policy ${policy.policyNumber}`,
          timestamp: policy.updatedAt,
          data: policy
        })),
        ...claims.map(claim => ({
          type: 'claim',
          action: 'Claim updated',
          description: `${claim.type} claim ${claim.claimNumber}`,
          timestamp: claim.updatedAt,
          data: claim
        }))
      ].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);

    } else if (userRole === 'agent') {
      // Agent activity
      const policies = await Policy.find({ agent: userId })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .populate('customer', 'firstName lastName');

      const claims = await Claim.find({ agent: userId })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .populate('customer', 'firstName lastName');

      activities = [
        ...policies.map(policy => ({
          type: 'policy',
          action: 'Policy updated',
          description: `${policy.policyType} policy for ${policy.customer.firstName} ${policy.customer.lastName}`,
          timestamp: policy.updatedAt,
          data: policy
        })),
        ...claims.map(claim => ({
          type: 'claim',
          action: 'Claim updated',
          description: `${claim.type} claim for ${claim.customer.firstName} ${claim.customer.lastName}`,
          timestamp: claim.updatedAt,
          data: claim
        }))
      ].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);

    } else if (userRole === 'admin') {
      // Admin activity
      const users = await User.find()
        .sort({ updatedAt: -1 })
        .limit(limit);

      const policies = await Policy.find()
        .sort({ updatedAt: -1 })
        .limit(limit)
        .populate('customer', 'firstName lastName');

      const claims = await Claim.find()
        .sort({ updatedAt: -1 })
        .limit(limit)
        .populate('customer', 'firstName lastName');

      activities = [
        ...users.map(user => ({
          type: 'user',
          action: 'User updated',
          description: `${user.firstName} ${user.lastName} (${user.role})`,
          timestamp: user.updatedAt,
          data: user
        })),
        ...policies.map(policy => ({
          type: 'policy',
          action: 'Policy updated',
          description: `${policy.policyType} policy for ${policy.customer.firstName} ${policy.customer.lastName}`,
          timestamp: policy.updatedAt,
          data: policy
        })),
        ...claims.map(claim => ({
          type: 'claim',
          action: 'Claim updated',
          description: `${claim.type} claim for ${claim.customer.firstName} ${claim.customer.lastName}`,
          timestamp: claim.updatedAt,
          data: claim
        }))
      ].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
    }

    res.json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Dashboard activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity data'
    });
  }
});

// Get notifications (protected route)
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const limit = parseInt(req.query.limit) || 20;

    let notifications = [];

    if (userRole === 'customer') {
      // Customer notifications
      const expiringPolicies = await Policy.find({
        customer: userId,
        status: 'active'
      }).where('endDate').lte(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days

      const pendingClaims = await Claim.find({
        customer: userId,
        status: 'pending'
      });

      const duePremiums = await Policy.find({
        customer: userId,
        status: 'active'
      }).where('premium.nextDueDate').lte(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days

      notifications = [
        ...expiringPolicies.map(policy => ({
          type: 'policy_expiring',
          title: 'Policy Expiring Soon',
          message: `Your ${policy.policyType} policy ${policy.policyNumber} expires on ${policy.endDate.toLocaleDateString()}`,
          priority: 'medium',
          timestamp: new Date(),
          data: { policyId: policy._id, policyNumber: policy.policyNumber }
        })),
        ...pendingClaims.map(claim => ({
          type: 'claim_pending',
          title: 'Claim Under Review',
          message: `Your ${claim.type} claim ${claim.claimNumber} is being reviewed`,
          priority: 'low',
          timestamp: claim.updatedAt,
          data: { claimId: claim._id, claimNumber: claim.claimNumber }
        })),
        ...duePremiums.map(policy => ({
          type: 'premium_due',
          title: 'Premium Payment Due',
          message: `Premium payment of $${policy.premium.amount} is due on ${policy.premium.nextDueDate.toLocaleDateString()}`,
          priority: 'high',
          timestamp: new Date(),
          data: { policyId: policy._id, policyNumber: policy.policyNumber }
        }))
      ];

    } else if (userRole === 'agent') {
      // Agent notifications
      const assignedClaims = await Claim.find({ agent: userId, status: 'pending' });
      const expiringPolicies = await Policy.find({
        agent: userId,
        status: 'active'
      }).where('endDate').lte(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

      notifications = [
        ...assignedClaims.map(claim => ({
          type: 'claim_assigned',
          title: 'New Claim Assigned',
          message: `New ${claim.type} claim ${claim.claimNumber} has been assigned to you`,
          priority: 'high',
          timestamp: claim.createdAt,
          data: { claimId: claim._id, claimNumber: claim.claimNumber }
        })),
        ...expiringPolicies.map(policy => ({
          type: 'policy_expiring',
          title: 'Client Policy Expiring',
          message: `Policy ${policy.policyNumber} expires on ${policy.endDate.toLocaleDateString()}`,
          priority: 'medium',
          timestamp: new Date(),
          data: { policyId: policy._id, policyNumber: policy.policyNumber }
        }))
      ];

    } else if (userRole === 'admin') {
      // Admin notifications
      const pendingClaims = await Claim.countDocuments({ status: 'pending' });
      const expiringPolicies = await Policy.countDocuments({
        status: 'active'
      }).where('endDate').lte(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

      if (pendingClaims > 0) {
        notifications.push({
          type: 'claims_pending',
          title: 'Claims Requiring Attention',
          message: `${pendingClaims} claims are pending review`,
          priority: 'high',
          timestamp: new Date(),
          data: { count: pendingClaims }
        });
      }

      if (expiringPolicies > 0) {
        notifications.push({
          type: 'policies_expiring',
          title: 'Policies Expiring Soon',
          message: `${expiringPolicies} policies will expire in the next 30 days`,
          priority: 'medium',
          timestamp: new Date(),
          data: { count: expiringPolicies }
        });
      }
    }

    // Sort by priority and timestamp
    notifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.timestamp - a.timestamp;
    });

    res.json({
      success: true,
      data: notifications.slice(0, limit)
    });

  } catch (error) {
    console.error('Dashboard notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

module.exports = router;
