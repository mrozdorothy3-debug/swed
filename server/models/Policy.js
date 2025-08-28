const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policyNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  policyType: {
    type: String,
    required: true,
    enum: ['auto', 'home', 'life', 'health', 'business', 'travel', 'pet', 'umbrella']
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'expired', 'cancelled', 'pending', 'suspended'],
    default: 'pending'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  premium: {
    amount: {
      type: Number,
      required: true,
      min: [0, 'Premium cannot be negative']
    },
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'semi-annually', 'annually'],
      default: 'monthly'
    },
    nextDueDate: {
      type: Date,
      required: true
    }
  },
  coverage: {
    limits: {
      liability: Number,
      property: Number,
      medical: Number,
      uninsured: Number
    },
    deductibles: {
      collision: Number,
      comprehensive: Number,
      property: Number
    },
    features: [{
      name: String,
      description: String,
      additionalCost: Number
    }]
  },
  insuredItems: [{
    type: {
      type: String,
      enum: ['vehicle', 'property', 'person', 'business', 'other']
    },
    details: mongoose.Schema.Types.Mixed,
    value: Number
  }],
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  claims: [{
    claimNumber: String,
    date: Date,
    description: String,
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied', 'closed'],
      default: 'pending'
    }
  }],
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  autoRenew: {
    type: Boolean,
    default: true
  },
  cancellationReason: String,
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Generate policy number early, before validation
policySchema.pre('validate', async function(next) {
  try {
    if (this.isNew && !this.policyNumber) {
      const count = await this.constructor.countDocuments();
      const year = new Date().getFullYear();
      this.policyNumber = `ATL${year}${String(count + 1).padStart(6, '0')}`;
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Virtual for policy duration
policySchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Virtual for days until expiration
policySchema.virtual('daysUntilExpiration').get(function() {
  if (this.endDate) {
    const diffTime = this.endDate - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
  return 0;
});

// Virtual for total claims amount
policySchema.virtual('totalClaimsAmount').get(function() {
  return this.claims.reduce((total, claim) => total + (claim.amount || 0), 0);
});

// Virtual for policy status
policySchema.virtual('isExpired').get(function() {
  return this.endDate && this.endDate < new Date();
});

policySchema.virtual('isActive').get(function() {
  return this.status === 'active' && !this.isExpired;
});

// Indexes for better query performance
policySchema.index({ policyNumber: 1 });
policySchema.index({ customer: 1 });
policySchema.index({ policyType: 1 });
policySchema.index({ status: 1 });
policySchema.index({ startDate: 1 });
policySchema.index({ endDate: 1 });
policySchema.index({ 'premium.nextDueDate': 1 });

// Method to calculate renewal premium
policySchema.methods.calculateRenewalPremium = function() {
  // Basic calculation - can be enhanced with business logic
  let renewalPremium = this.premium.amount;
  
  // Apply claims history adjustment
  if (this.claims.length > 0) {
    const claimsCount = this.claims.filter(c => c.status === 'approved').length;
    if (claimsCount > 2) {
      renewalPremium *= 1.15; // 15% increase for multiple claims
    }
  }
  
  // Apply policy age adjustment
  const policyAge = new Date().getFullYear() - this.startDate.getFullYear();
  if (policyAge > 5) {
    renewalPremium *= 0.95; // 5% discount for long-term customers
  }
  
  return Math.round(renewalPremium * 100) / 100;
};

// Method to add claim
policySchema.methods.addClaim = function(claimData) {
  this.claims.push({
    claimNumber: `CLM${Date.now()}`,
    date: new Date(),
    ...claimData
  });
  return this.save();
};

// Method to add note
policySchema.methods.addNote = function(content, authorId) {
  this.notes.push({
    content,
    author: authorId,
    createdAt: new Date()
  });
  return this.save();
};

// Ensure virtual fields are serialized
policySchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    return ret;
  }
});

module.exports = mongoose.model('Policy', policySchema);
