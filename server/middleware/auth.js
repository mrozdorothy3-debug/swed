const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'atlas-insurance-secret-key-2024';

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Add user info to request
    req.user = decoded;
    req.userProfile = user;
    
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = requireRole(['admin']);

// Middleware to check if user is agent or admin
const requireAgent = requireRole(['agent', 'admin']);

// Middleware to check if user is customer, agent, or admin
const requireCustomer = requireRole(['customer', 'agent', 'admin']);

// Middleware to check if user owns the resource or is admin/agent
const requireOwnership = (resourceModel, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Admin and agents can access any resource
      if (['admin', 'agent'].includes(req.user.role)) {
        return next();
      }

      // Get resource ID from request
      const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID required'
        });
      }

      // Find resource and check ownership
      const resource = await resourceModel.findById(resourceId);
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if user owns the resource
      if (resource.customer && resource.customer.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only access your own resources'
        });
      }

      next();

    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Ownership verification failed'
      });
    }
  };
};

// Middleware to rate limit requests
const rateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old requests
    if (requests.has(ip)) {
      requests.set(ip, requests.get(ip).filter(timestamp => timestamp > windowStart));
    }

    const userRequests = requests.get(ip) || [];
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }

    userRequests.push(now);
    requests.set(ip, userRequests);

    next();
  };
};

// Middleware to validate request body
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map(detail => detail.message)
        });
      }
      next();
    } catch (error) {
      console.error('Validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Validation failed'
      });
    }
  };
};

// Middleware to log requests
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireAgent,
  requireCustomer,
  requireOwnership,
  rateLimit,
  validateRequest,
  requestLogger
};
