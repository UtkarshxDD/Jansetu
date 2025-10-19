import express from 'express';
import {
    createCampaign,
    getAllCampaigns,
    getCampaignById,
    getUserCampaigns,
    updateCampaign,
    addCampaignUpdate,
    deleteCampaign,
    getPendingCampaigns,
    reviewCampaign,
    getCampaignStats,
    upload
} from '../controller/campaignController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/campaigns', getAllCampaigns);
router.get('/campaigns/:campaignId', getCampaignById);
router.get('/campaigns/stats/overview', getCampaignStats);

// User routes (protected)
router.post('/campaigns/create/:userId', authMiddleware, upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'documents', maxCount: 3 }
]), createCampaign);

router.get('/campaigns/user/:userId', authMiddleware, getUserCampaigns);
router.put('/campaigns/:campaignId/user/:userId', authMiddleware, updateCampaign);
router.delete('/campaigns/:campaignId/user/:userId', authMiddleware, deleteCampaign);

router.post('/campaigns/:campaignId/updates/:userId', authMiddleware, upload.fields([
    { name: 'images', maxCount: 3 }
]), addCampaignUpdate);

// Admin routes (protected)
router.get('/admin/campaigns/pending', authMiddleware, getPendingCampaigns);
router.put('/admin/campaigns/:campaignId/review', authMiddleware, reviewCampaign);

export default router;

