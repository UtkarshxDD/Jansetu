import Campaign from '../models/campaignModel.js';
import User from '../models/userModel.js';
import cloudinary from '../config/cloudinary.js';
import multer from 'multer';

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDF files are allowed'), false);
        }
    }
});

// Upload files to Cloudinary
const uploadToCloudinary = async (file, folder = 'campaigns') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `jansetu/${folder}`,
                resource_type: 'auto',
                quality: 'auto:good',
                fetch_format: 'auto'
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        uploadStream.end(file.buffer);
    });
};

// Create new campaign
export const createCampaign = async (req, res) => {
    try {
        const userId = req.params.userId;
        const {
            title,
            description,
            shortDescription,
            disasterType,
            category,
            urgencyLevel,
            targetAmount,
            location,
            organizationName,
            organizationType,
            contactInfo,
            bankDetails,
            campaignDuration,
            tags,
            socialLinks
        } = req.body;

        // Validate user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Parse location coordinates if provided as string
        let parsedLocation = location;
        if (typeof location.coordinates === 'string') {
            parsedLocation.coordinates = JSON.parse(location.coordinates);
        }

        // Upload images
        const imageUrls = [];
        if (req.files && req.files.images) {
            const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            for (const file of imageFiles) {
                const imageUrl = await uploadToCloudinary(file, 'campaigns/images');
                imageUrls.push(imageUrl);
            }
        }

        // Upload documents
        const documentUrls = [];
        if (req.files && req.files.documents) {
            const docFiles = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
            for (const file of docFiles) {
                const docUrl = await uploadToCloudinary(file, 'campaigns/documents');
                documentUrls.push({
                    name: file.originalname,
                    url: docUrl,
                    type: 'other' // Can be enhanced to detect type
                });
            }
        }

        // Create campaign
        const campaign = new Campaign({
            title,
            description,
            shortDescription,
            disasterType,
            category,
            urgencyLevel,
            targetAmount: parseFloat(targetAmount),
            location: parsedLocation,
            images: imageUrls,
            documents: documentUrls,
            createdBy: userId,
            organizationName,
            organizationType,
            contactInfo: JSON.parse(contactInfo),
            bankDetails: JSON.parse(bankDetails),
            campaignDuration: {
                startDate: new Date(),
                endDate: new Date(campaignDuration.endDate)
            },
            tags: tags ? JSON.parse(tags) : [],
            socialLinks: socialLinks ? JSON.parse(socialLinks) : {},
            status: 'pending_review'
        });

        await campaign.save();

        // Populate creator info
        await campaign.populate('createdBy', 'name email phone');

        res.status(201).json({
            success: true,
            message: 'Campaign created successfully and submitted for review',
            campaign
        });

    } catch (error) {
        console.error('Create campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create campaign',
            error: error.message
        });
    }
};

// Get all campaigns (with filters)
export const getAllCampaigns = async (req, res) => {
    try {
        const {
            status = 'active',
            category,
            disasterType,
            urgencyLevel,
            sortBy = 'recent',
            page = 1,
            limit = 12,
            search
        } = req.query;

        // Build filter query
        const filter = {};
        
        if (status !== 'all') {
            filter.status = status;
        }
        
        if (category && category !== 'all') {
            filter.category = category;
        }
        
        if (disasterType && disasterType !== 'all') {
            filter.disasterType = disasterType;
        }
        
        if (urgencyLevel && urgencyLevel !== 'all') {
            filter.urgencyLevel = urgencyLevel;
        }

        // Add search functionality
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'location.city': { $regex: search, $options: 'i' } },
                { 'location.state': { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort query
        let sortQuery = {};
        switch (sortBy) {
            case 'urgent':
                sortQuery = { urgencyLevel: -1, createdAt: -1 };
                break;
            case 'popular':
                sortQuery = { donorCount: -1, viewCount: -1 };
                break;
            case 'ending':
                sortQuery = { 'campaignDuration.endDate': 1 };
                break;
            case 'amount':
                sortQuery = { targetAmount: -1 };
                break;
            case 'recent':
            default:
                sortQuery = { createdAt: -1 };
        }

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const campaigns = await Campaign.find(filter)
            .populate('createdBy', 'name email phone')
            .sort(sortQuery)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Campaign.countDocuments(filter);

        res.status(200).json({
            success: true,
            campaigns,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalCampaigns: total,
                hasNext: skip + campaigns.length < total,
                hasPrev: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaigns',
            error: error.message
        });
    }
};

// Get single campaign by ID
export const getCampaignById = async (req, res) => {
    try {
        const { campaignId } = req.params;

        const campaign = await Campaign.findById(campaignId)
            .populate('createdBy', 'name email phone')
            .populate('donations.donorId', 'name');

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Increment view count
        campaign.viewCount += 1;
        await campaign.save();

        res.status(200).json({
            success: true,
            campaign
        });

    } catch (error) {
        console.error('Get campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaign',
            error: error.message
        });
    }
};

// Get user's campaigns
export const getUserCampaigns = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.query;

        const filter = { createdBy: userId };
        if (status && status !== 'all') {
            filter.status = status;
        }

        const campaigns = await Campaign.find(filter)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name email phone');

        res.status(200).json({
            success: true,
            campaigns
        });

    } catch (error) {
        console.error('Get user campaigns error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user campaigns',
            error: error.message
        });
    }
};

// Update campaign (only by creator)
export const updateCampaign = async (req, res) => {
    try {
        const { campaignId, userId } = req.params;
        const updateData = req.body;

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Check if user is the creator
        if (campaign.createdBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this campaign'
            });
        }

        // Don't allow updates to approved/active campaigns without admin approval
        if (['approved', 'active'].includes(campaign.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot update approved campaigns. Contact admin for changes.'
            });
        }

        // Update campaign
        Object.assign(campaign, updateData);
        await campaign.save();

        res.status(200).json({
            success: true,
            message: 'Campaign updated successfully',
            campaign
        });

    } catch (error) {
        console.error('Update campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update campaign',
            error: error.message
        });
    }
};

// Add campaign update
export const addCampaignUpdate = async (req, res) => {
    try {
        const { campaignId, userId } = req.params;
        const { title, description } = req.body;

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Check if user is the creator
        if (campaign.createdBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this campaign'
            });
        }

        // Upload images if provided
        const imageUrls = [];
        if (req.files && req.files.images) {
            const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            for (const file of imageFiles) {
                const imageUrl = await uploadToCloudinary(file, 'campaigns/updates');
                imageUrls.push(imageUrl);
            }
        }

        // Add update
        const updateData = {
            title,
            description,
            images: imageUrls
        };

        await campaign.addUpdate(updateData);

        res.status(200).json({
            success: true,
            message: 'Campaign update added successfully',
            update: updateData
        });

    } catch (error) {
        console.error('Add campaign update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add campaign update',
            error: error.message
        });
    }
};

// Delete campaign (only by creator, only if not approved)
export const deleteCampaign = async (req, res) => {
    try {
        const { campaignId, userId } = req.params;

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Check if user is the creator
        if (campaign.createdBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this campaign'
            });
        }

        // Don't allow deletion of approved/active campaigns
        if (['approved', 'active'].includes(campaign.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete approved campaigns. Contact admin.'
            });
        }

        await Campaign.findByIdAndDelete(campaignId);

        res.status(200).json({
            success: true,
            message: 'Campaign deleted successfully'
        });

    } catch (error) {
        console.error('Delete campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete campaign',
            error: error.message
        });
    }
};

// Admin: Get campaigns pending review
export const getPendingCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ status: 'pending_review' })
            .populate('createdBy', 'name email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            campaigns
        });

    } catch (error) {
        console.error('Get pending campaigns error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending campaigns',
            error: error.message
        });
    }
};

// Admin: Approve/Reject campaign
export const reviewCampaign = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { action, reviewNotes, rejectionReason } = req.body;
        const adminId = req.user.id; // From auth middleware

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        if (campaign.status !== 'pending_review') {
            return res.status(400).json({
                success: false,
                message: 'Campaign is not pending review'
            });
        }

        // Update campaign status
        campaign.status = action === 'approve' ? 'active' : 'rejected';
        campaign.adminReview = {
            reviewedBy: adminId,
            reviewDate: new Date(),
            reviewNotes,
            rejectionReason: action === 'reject' ? rejectionReason : undefined
        };

        if (action === 'approve') {
            campaign.isVerified = true;
        }

        await campaign.save();

        res.status(200).json({
            success: true,
            message: `Campaign ${action}d successfully`,
            campaign
        });

    } catch (error) {
        console.error('Review campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to review campaign',
            error: error.message
        });
    }
};

// Get campaign statistics
export const getCampaignStats = async (req, res) => {
    try {
        const stats = await Campaign.aggregate([
            {
                $group: {
                    _id: null,
                    totalCampaigns: { $sum: 1 },
                    activeCampaigns: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    },
                    pendingCampaigns: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending_review'] }, 1, 0] }
                    },
                    totalRaised: { $sum: '$raisedAmount' },
                    totalDonors: { $sum: '$donorCount' }
                }
            }
        ]);

        const categoryStats = await Campaign.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalRaised: { $sum: '$raisedAmount' }
                }
            }
        ]);

        const disasterStats = await Campaign.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: '$disasterType',
                    count: { $sum: 1 },
                    totalRaised: { $sum: '$raisedAmount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            stats: stats[0] || {
                totalCampaigns: 0,
                activeCampaigns: 0,
                pendingCampaigns: 0,
                totalRaised: 0,
                totalDonors: 0
            },
            categoryStats,
            disasterStats
        });

    } catch (error) {
        console.error('Get campaign stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaign statistics',
            error: error.message
        });
    }
};

export { upload };
