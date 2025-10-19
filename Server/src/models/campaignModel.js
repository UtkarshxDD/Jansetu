import mongoose from 'mongoose';

const campaignUpdateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    images: [{
        type: String // Cloudinary URLs
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const donationSchema = new mongoose.Schema({
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    donorName: {
        type: String,
        required: true
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        trim: true
    },
    paymentId: {
        type: String, // Payment gateway transaction ID
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const campaignSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000
    },
    shortDescription: {
        type: String,
        required: true,
        maxlength: 300
    },
    disasterType: {
        type: String,
        required: true,
        enum: ['flood', 'earthquake', 'fire', 'cyclone', 'drought', 'landslide', 'other']
    },
    category: {
        type: String,
        required: true,
        enum: ['medical', 'shelter', 'food', 'education', 'infrastructure', 'emergency']
    },
    urgencyLevel: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    targetAmount: {
        type: Number,
        required: true,
        min: 1000 // Minimum ₹1000
    },
    raisedAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    location: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default: 'India'
        },
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        }
    },
    images: [{
        type: String, // Cloudinary URLs
        required: true
    }],
    documents: [{
        name: String,
        url: String, // Cloudinary URL
        type: {
            type: String,
            enum: ['identity', 'organization', 'disaster_proof', 'other']
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organizationName: {
        type: String,
        trim: true
    },
    organizationType: {
        type: String,
        enum: ['individual', 'ngo', 'charity', 'government', 'corporate'],
        default: 'individual'
    },
    contactInfo: {
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        website: String
    },
    bankDetails: {
        accountNumber: {
            type: String,
            required: true
        },
        ifscCode: {
            type: String,
            required: true
        },
        accountHolderName: {
            type: String,
            required: true
        },
        bankName: {
            type: String,
            required: true
        }
    },
    campaignDuration: {
        startDate: {
            type: Date,
            default: Date.now
        },
        endDate: {
            type: Date,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['draft', 'pending_review', 'approved', 'rejected', 'active', 'completed', 'cancelled'],
        default: 'draft'
    },
    adminReview: {
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        reviewDate: Date,
        reviewNotes: String,
        rejectionReason: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }],
    updates: [campaignUpdateSchema],
    donations: [donationSchema],
    donorCount: {
        type: Number,
        default: 0
    },
    shareCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    socialLinks: {
        facebook: String,
        twitter: String,
        instagram: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for better query performance
campaignSchema.index({ location: '2dsphere' });
campaignSchema.index({ disasterType: 1, status: 1 });
campaignSchema.index({ category: 1, status: 1 });
campaignSchema.index({ urgencyLevel: 1, status: 1 });
campaignSchema.index({ createdBy: 1 });
campaignSchema.index({ status: 1, createdAt: -1 });

// Virtual for days left
campaignSchema.virtual('daysLeft').get(function() {
    const now = new Date();
    const endDate = new Date(this.campaignDuration.endDate);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
});

// Virtual for progress percentage
campaignSchema.virtual('progressPercentage').get(function() {
    return Math.min((this.raisedAmount / this.targetAmount) * 100, 100);
});

// Pre-save middleware to update updatedAt
campaignSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Method to add donation
campaignSchema.methods.addDonation = function(donationData) {
    this.donations.push(donationData);
    this.raisedAmount += donationData.amount;
    this.donorCount = this.donations.filter(d => d.paymentStatus === 'completed').length;
    return this.save();
};

// Method to add update
campaignSchema.methods.addUpdate = function(updateData) {
    this.updates.push(updateData);
    return this.save();
};

// Static method to get campaigns by status
campaignSchema.statics.findByStatus = function(status) {
    return this.find({ status }).populate('createdBy', 'name email phone');
};

// Static method to get active campaigns
campaignSchema.statics.findActive = function() {
    return this.find({ 
        status: 'active',
        'campaignDuration.endDate': { $gt: new Date() }
    }).populate('createdBy', 'name email phone');
};

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign;
