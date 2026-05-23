import ProblemReport from "../models/problemModel.js";
import Vote from "../models/voteModel.js";
import User from "../models/userModel.js";
import Official from "../models/officialModel.js";
import Comment from "../models/commentModel.js";
import mongoose from "mongoose";
import fetch from "node-fetch";
import path from "path";
import fs from "fs";
import { sendEmail } from "../utils/sendEmail.js";
import { createNotification, notifyAdmins } from "../utils/notificationUtils.js";
import { v2 as cloudinary } from "cloudinary";

export const createProblem = async (req, res) => {
    try {
        const { title, description, category, coordinates, rating, priority, exifLat, exifLng } = req.body;
        const userId = req.params.userId;

        const ratingNum = Number(rating);
        if (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" })
        }

        const voteCount = ratingNum >= 3 ? 1 : 0;

        let coordsArray = coordinates;
        if (typeof coordsArray === 'string') {
            try {
                coordsArray = JSON.parse(coordsArray);
            } catch (_) {
                return res.status(400).json({ success: false, message: 'Invalid coordinates format' });
            }
        }
        if (!Array.isArray(coordsArray) || coordsArray.length !== 2) {
            return res.status(400).json({ success: false, message: 'Coordinates must be [lng, lat]' });
        }
        coordsArray = [Number(coordsArray[0]), Number(coordsArray[1])];
        if (coordsArray.some((n) => Number.isNaN(n))) {
            return res.status(400).json({ success: false, message: 'Coordinates must be numbers' });
        }

        // Duplicate Issue Prevention ($near geospatial query)
        const duplicateIssue = await ProblemReport.findOne({
            category: category,
            status: { $in: ['pending', 'under_review', 'assigned'] },
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: coordsArray },
                    $maxDistance: 50 // 50 meters
                }
            }
        });

        if (duplicateIssue) {
            return res.status(409).json({
                success: false,
                message: "A similar issue was already reported nearby.",
                duplicateId: duplicateIssue._id
            });
        }

        // Reverse geocoding (optional best-effort)
        let humanAddress = '';
        try {
            if (Array.isArray(coordsArray) && coordsArray.length === 2) {
                const [lng, lat] = coordsArray;
                const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
                const resp = await fetch(url, { headers: { 'User-Agent': 'Janhit/1.0' } });
                const data = await resp.json();
                humanAddress = data?.display_name || '';
            }
        } catch (_) {
            // ignore reverse geocoding failures
        }

        // Collect uploaded media file paths (Cloudinary URLs)
        const mediaPaths = (req.files || []).map((f) => f.path);

        // EXIF Location Verification
        let locationVerified = false;
        if (exifLat && exifLng && mediaPaths.length > 0) {
            const eLat = Number(exifLat);
            const eLng = Number(exifLng);
            const pLat = coordsArray[1];
            const pLng = coordsArray[0];

            // Haversine formula
            const R = 6371e3; // metres
            const φ1 = pLat * Math.PI/180;
            const φ2 = eLat * Math.PI/180;
            const Δφ = (eLat - pLat) * Math.PI/180;
            const Δλ = (eLng - pLng) * Math.PI/180;

            const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;

            // Verify if photo was taken within 500 meters of the pin
            if (distance <= 500) {
                locationVerified = true;
            }
        }

        // Calculate Initial Urgency & SLA Deadline
        const urgencyScore = priority === 'high' ? 5 : priority === 'low' ? 1 : 3;
        const slaDays = priority === 'high' ? 2 : priority === 'low' ? 14 : 7;
        const slaDueAt = new Date();
        slaDueAt.setDate(slaDueAt.getDate() + slaDays);

        const newProblem = await ProblemReport.create({
            title,
            description,
            category,
            location: {
                type: "Point",
                coordinates: coordsArray,
            },
            createdBy: userId,
            voteCount,
            averageRating: ratingNum,
            address: humanAddress,
            priority: priority || 'medium',
            timeline: [{ type: 'created', message: 'Problem reported' }],
            media: mediaPaths,
            locationVerified,
            urgencyScore,
            slaDueAt
        });

        // Award 10 Civic Points to the User
        await User.findByIdAndUpdate(userId, { $inc: { points: 10 } });

        await Vote.create({
            user: userId,
            problem: newProblem._id,
            rating: ratingNum
        });

        // Notify Admins
        await notifyAdmins({
            type: 'new_issue',
            message: `A new ${priority || 'medium'} priority ${category} issue was reported: "${title}"`,
            problem: newProblem._id,
            sender: userId
        });

        res.status(201).json({
            success: true,
            message: "Problem reported successfully",
            problem: newProblem,
        });

    } catch (error) {
        console.error("Error creating problem report:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}


export const rateProblem = async (req, res) => {
    try {
        const userId = req.params.userId;
        const problemId = req.params.problemId;

        const { rating } = req.body;

        if (!mongoose.Types.ObjectId.isValid(problemId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid IDs" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
        }

        const alreadyRated = await Vote.findOne({ user: userId, problem: problemId });

        if (alreadyRated) {
            return res.status(400).json({ success: false, message: "You already rated this problem" });
        }

        await Vote.create({
            user: userId,
            problem: problemId,
            rating,
        });

        if (rating >= 3) {
            await ProblemReport.findByIdAndUpdate(problemId, {
                $inc: { voteCount: 1 },
                $push: { timeline: { type: 'vote', message: `Vote received: ${rating} stars`, at: new Date() } }
            });
        }

        const allVotes = await Vote.find({ problem: problemId });

        if (allVotes.length > 0) {
            const totalRating = allVotes.reduce((sum, vote) => sum + vote.rating, 0);
            const avgRating = totalRating / allVotes.length;

            await ProblemReport.findByIdAndUpdate(problemId, {
                averageRating: Number(avgRating.toFixed(2)),
            });
        }


        res.status(200).json({
            success: true,
            message: "Rating submitted successfully",
        });

    } catch (error) {
        console.error("Error rating problem:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export const toggleUpvote = async (req, res) => {
    try {
        const { problemId, userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(problemId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid IDs" });
        }

        const problem = await ProblemReport.findById(problemId);
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        const upvoteIndex = problem.upvotedBy.indexOf(userId);
        let hasUpvoted = false;

        if (upvoteIndex > -1) {
            problem.upvotedBy.splice(upvoteIndex, 1);
        } else {
            problem.upvotedBy.push(userId);
            hasUpvoted = true;
        }

        await problem.save();

        res.status(200).json({
            success: true,
            hasUpvoted,
            upvotesCount: problem.upvotedBy.length,
            message: hasUpvoted ? "Upvoted successfully" : "Upvote removed"
        });
    } catch (error) {
        console.error("Error toggling upvote:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}


export const assignProblem = async (req, res) => {
    try {
        const problemId = req.params.problemId;
        const problem = await ProblemReport.findById(problemId);

        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        if (problem.voteCount < 5) {
            return res.status(400).json({ success: false, message: "Votes are less than 5. Not eligible for assignment." });
        }

        if (problem.assignedTo) {
            return res.status(400).json({ success: false, message: "Problem is already assigned" });
        }

        const official = await Official.findOne({ department: problem.category });

        if (!official) {
            return res.status(404).json({ success: false, message: "No official found for this department" });
        }

        problem.assignedTo = official._id;
        problem.status = "assigned";
        problem.timeline.push({ type: 'assigned', message: `Assigned to ${official.name}` });
        await problem.save();

        official.assignedProblems.push(problemId);
        await official.save();


        res.status(200).json({
            success: true,
            message: `Problem assigned to official of ${problem.category} department`,
            problem
        });

    } catch (error) {
        console.error("Error assigning problem:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}


export const deleteProblem = async (req, res) => {
    try {
        const { problemId, userId } = req.params;

        const problem = await ProblemReport.findById(problemId);

        if (!problem) {
            return res.status(404).json({ success: false, message: "No problem exists" });
        }

        if (problem.createdBy.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized: You can only delete your own problem" });
        }

        if (problem.assignedTo) {
            await Official.findByIdAndUpdate(problem.assignedTo, {
                $pull: { assignedProblems: problemId }
            });
        }

        // Delete associated media files
        if (problem.media?.length) {
            for (const m of problem.media) {
                if (m.includes('cloudinary.com')) {
                    const parts = m.split('/');
                    const filenameWithExt = parts.pop();
                    const folder = parts.pop();
                    const publicId = `${folder}/${filenameWithExt.split('.')[0]}`;
                    cloudinary.uploader.destroy(publicId).catch(err => console.error("Cloudinary delete err:", err));
                } else {
                    const filePath = path.resolve(process.cwd(), m.replace(/^\//, ''));
                    fs.unlink(filePath, () => {});
                }
            }
        }
        await ProblemReport.findByIdAndDelete(problemId);

        await Vote.deleteMany({ problem: problemId });
        await Comment.deleteMany({ toProblem: problemId });

        res.status(200).json({ success: true, message: "Problem deleted successfully" });
    } catch (error) {
        console.error("Error deleting problem:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


export const getAllProblems = async (req, res) => {
    try {
        const { q, lat, lng, radiusKm, page, limit } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, parseInt(limit) || 50); // default 50, max 100
        const skip = (pageNum - 1) * limitNum;

        const query = {};

        if (q) {
            Object.assign(query, { $text: { $search: q } });
        }

        if (lat && lng && radiusKm) {
            Object.assign(query, {
                location: {
                    $geoWithin: {
                        $centerSphere: [[Number(lng), Number(lat)], Number(radiusKm) / 6371]
                    }
                }
            });
        }

        const [problems, total] = await Promise.all([
            ProblemReport.find(query).skip(skip).limit(limitNum).lean(),
            ProblemReport.countDocuments(query)
        ]);

        const formattedProblems = problems.map((problem) => ({
            ...problem,
            createdBy: problem.createdBy ? problem.createdBy.toString() : null,
        }));

        res.status(200).json({
            success: true,
            count: formattedProblems.length,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            problems: formattedProblems,
        });
    } catch (error) {
        console.error("Error fetching all problems:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};




export const getOfficialProblems = async (req, res) => {
    try {
        // Prefer authenticated official id; fallback to param :officialId
        const paramId = req.params.officialId;
        const officialId = req.user?._id || paramId;
        if (!officialId) {
            return res.status(400).json({ success: false, message: "Official ID not provided" });
        }

        const problems = await ProblemReport.find({ assignedTo: officialId })


        res.status(200).json({
            success: true,
            count: problems.length,
            problems,
        });
    } catch (error) {
        console.error("Error fetching official's problems:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Allow an assigned official to update problem status
export const updateProblemStatusByOfficial = async (req, res) => {
    try {
        const official = req.user;
        const { problemId } = req.params;
        const { status, note } = req.body;

        const allowedStatuses = ['under_review', 'assigned', 'resolved'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const problem = await ProblemReport.findById(problemId);
        if (!problem) {
            return res.status(404).json({ success: false, message: 'Problem not found' });
        }

        // Ensure official is assigned to this problem
        if (!official || String(problem.assignedTo) !== String(official._id)) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this problem' });
        }

        problem.status = status;
        problem.timeline.push({ type: 'status', message: `Status changed to ${status}${note ? ` — ${note}` : ''}` });
        await problem.save();

        if (status && status !== problem.status) {
            import('../utils/notificationUtils.js').then(({ createNotification }) => {
                createNotification({
                    recipient: problem.createdBy,
                    recipientModel: 'User',
                    type: 'status_update',
                    message: `Your issue "${problem.title}" status changed to ${status.replace('_', ' ')}`,
                    problem: problem._id
                });
            });
        }

        if (status === 'resolved') {
            const user = await User.findById(problem.createdBy);
            if (user && user.email) {
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <h2 style="color: #2563eb; text-align: center;">Jansetu Civic Action</h2>
                        <p style="font-size: 16px; color: #374151;">Hello <strong>${user.name}</strong>,</p>
                        <p style="font-size: 16px; color: #374151;">Great news! Your reported issue <strong>"${problem.title}"</strong> has been officially marked as <strong style="color: #16a34a;">Resolved</strong>.</p>
                        <p style="font-size: 16px; color: #374151;">Thank you for your proactive contribution to making our community better.</p>
                        <br/>
                        <p style="font-size: 14px; color: #6b7280; text-align: center;">- The Jansetu Team</p>
                    </div>
                `;
                await sendEmail(user.email, '✅ Your Civic Issue is Resolved - Jansetu', emailHtml);
            }
        }

        // Emit realtime update to all connected clients
        import('../index.js').then(({ io }) => {
            if (io) io.emit('status_updated', { issueId: problem._id.toString(), status });
        }).catch(() => {});

        return res.status(200).json({ success: true, message: 'Status updated', problem });
    } catch (error) {
        console.error('official status update error', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
}

export const getUserComplaints = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const complaints = await ProblemReport.find({ createdBy: userId })
            .sort({ createdAt: -1 }) // Most recent first
            .lean();

        const formattedComplaints = complaints.map((complaint) => ({
            ...complaint,
            createdBy: complaint.createdBy.toString(),
            _id: complaint._id.toString(),
            createdAt: complaint.createdAt,
        }));

        res.status(200).json({
            success: true,
            count: formattedComplaints.length,
            complaints: formattedComplaints,
        });
    } catch (error) {
        console.error("Error fetching user complaints:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Find near-duplicate problems by text and distance
export const findSimilarProblems = async (req, res) => {
    try {
        const { lat, lng, text } = req.query;
        if (!lat || !lng || !text) {
            return res.status(400).json({ success: false, message: 'lat,lng,text are required' });
        }

        const center = [Number(lng), Number(lat)];
        const near = await ProblemReport.find({
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: center },
                    $maxDistance: 500
                }
            }
        })
            .limit(20)
            .lean();

        const norm = (s) => String(s || '').toLowerCase();
        const terms = new Set(norm(text).split(/\W+/).filter(Boolean));
        const score = (p) => {
            const hay = norm(p.title + ' ' + p.description).split(/\W+/);
            let matches = 0;
            for (const w of hay) if (terms.has(w)) matches++;
            return matches / Math.max(1, hay.length);
        };

        const ranked = near
            .map((p) => ({ p, s: score(p) }))
            .filter((x) => x.s > 0)
            .sort((a, b) => b.s - a.s)
            .slice(0, 5)
            .map((x) => x.p);

        res.json({ success: true, similar: ranked });
    } catch (e) {
        console.error('similar error', e);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}
