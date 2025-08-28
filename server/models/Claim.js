const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  claimNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  policy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy',
    required: true
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
  type: {
    type: String,
    required: true,
    enum: ['auto', 'home', 'life', 'health', 'business', 'travel', 'pet', 'umbrella']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'investigating', 'approved', 'denied', 'closed', 'appealed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  incidentDate: {
    type: Date,
    required: true
  },
  reportedDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  estimatedAmount: {
    type: Number,
    required: true,
    min: [0, 'Estimated amount cannot be negative']
  },
  approvedAmount: {
    type: Number,
    min: [0, 'Approved amount cannot be negative']
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  deductible: {
    type: Number,
    default: 0,
    min: [0, 'Deductible cannot be negative']
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  parties: [{
    name: String,
    type: {
      type: String,
      enum: ['insured', 'third-party', 'witness', 'other']
    },
    contact: {
      phone: String,
      email: String,
      address: String
    },
    statement: String
  }],
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  photos: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
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
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  timeline: [{
    action: String,
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  investigation: {
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startDate: Date,
    estimatedCompletion: Date,
    findings: String,
    recommendations: String
  },
  payment: {
    method: {
      type: String,
      enum: ['check', 'direct-deposit', 'credit-card', 'other']
    },
    scheduledDate: Date,
    actualDate: Date,
    reference: String
  },
  appeal: {
    requested: {
      type: Boolean,
      default: false
    },
    requestedDate: Date,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied'],
      default: 'pending'
    },
    decisionDate: Date,
    decisionNotes: String
  },
  tags: [String],
  isFraud: {
    type: Boolean,
    default: false
  },
  fraudScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

// Generate claim number early, before validation
claimSchema.pre('validate', async function(next) {
  try {
    if (this.isNew && !this.claimNumber) {
      const count = await this.constructor.countDocuments();
      const year = new Date().getFullYear();
      this.claimNumber = `CLM${year}${String(count + 1).padStart(6, '0')}`;
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Virtual for claim age
claimSchema.virtual('age').get(function() {
  const diffTime = Math.abs(new Date() - this.reportedDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for processing time
claimSchema.virtual('processingTime').get(function() {
  if (this.status === 'closed' || this.status === 'approved' || this.status === 'denied') {
    const diffTime = Math.abs(new Date() - this.reportedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

// Virtual for claim value
claimSchema.virtual('claimValue').get(function() {
  return this.approvedAmount || this.estimatedAmount;
});

// Virtual for net payout
claimSchema.virtual('netPayout').get(function() {
  if (this.approvedAmount) {
    return Math.max(0, this.approvedAmount - this.deductible);
  }
  return 0;
});

// Indexes for better query performance
claimSchema.index({ claimNumber: 1 });
claimSchema.index({ policy: 1 });
claimSchema.index({ customer: 1 });
claimSchema.index({ status: 1 });
claimSchema.index({ type: 1 });
claimSchema.index({ incidentDate: 1 });
claimSchema.index({ reportedDate: 1 });
claimSchema.index({ priority: 1 });
claimSchema.index({ 'investigation.assignedTo': 1 });

// Method to add timeline entry
claimSchema.methods.addTimelineEntry = function(action, description, performedBy) {
  this.timeline.push({
    action,
    description,
    performedBy,
    timestamp: new Date()
  });
  return this.save();
};

// Method to add note
claimSchema.methods.addNote = function(content, authorId, isInternal = false) {
  this.notes.push({
    content,
    author: authorId,
    isInternal,
    createdAt: new Date()
  });
  return this.save();
};

// Method to update status
claimSchema.methods.updateStatus = function(newStatus, reason, updatedBy) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  this.addTimelineEntry(
    'Status Updated',
    `Status changed from ${oldStatus} to ${newStatus}. ${reason || ''}`,
    updatedBy
  );
  
  return this.save();
};

// Method to assign investigator
claimSchema.methods.assignInvestigator = function(agentId, estimatedCompletion) {
  this.investigation.assignedTo = agentId;
  this.investigation.startDate = new Date();
  this.investigation.estimatedCompletion = estimatedCompletion;
  
  this.addTimelineEntry(
    'Investigator Assigned',
    'Claim assigned to investigator',
    agentId
  );
  
  return this.save();
};

// Method to approve claim
claimSchema.methods.approveClaim = function(amount, approvedBy, notes) {
  this.status = 'approved';
  this.approvedAmount = amount;
  
  this.addTimelineEntry(
    'Claim Approved',
    `Claim approved for $${amount}. ${notes || ''}`,
    approvedBy
  );
  
  return this.save();
};

// Method to deny claim
claimSchema.methods.denyClaim = function(reason, deniedBy) {
  this.status = 'denied';
  
  this.addTimelineEntry(
    'Claim Denied',
    `Claim denied. Reason: ${reason}`,
    deniedBy
  );
  
  return this.save();
};

// Method to close claim
claimSchema.methods.closeClaim = function(closedBy, notes) {
  this.status = 'closed';
  
  this.addTimelineEntry(
    'Claim Closed',
    `Claim closed. ${notes || ''}`,
    closedBy
  );
  
  return this.save();
};

// Ensure virtual fields are serialized
claimSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    return ret;
  }
});

module.exports = mongoose.model('Claim', claimSchema);
