import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { addCommentToProblem, deleteComment, getCommentsForProblem, loginUser, logout, signupUser, getUserProfile, updateUserProfile, getLeaderboard } from "../controller/userController.js";
import { assignProblem, createProblem, deleteProblem, getAllProblems, getOfficialProblems, rateProblem, getUserComplaints, findSimilarProblems, updateProblemStatusByOfficial, toggleUpvote } from "../controller/problemController.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { loginOfficial, signupOfficial } from "../controller/officialController.js";



const router = Router();

// local user
router.route("/signupUser").post(signupUser);
router.route("/loginUser").post(loginUser);
router.route("/logout").post(verifyJWT, logout);
router.route("/userProfile/:userId").get(verifyJWT, getUserProfile);
router.route("/updateUserProfile/:userId").put(verifyJWT, updateUserProfile);
router.route("/addComment/:problemId/:userId").post(verifyJWT, addCommentToProblem);
router.route("/comments/:commentId/:userId").delete(verifyJWT, deleteComment)
router.route("/getComment/:problemId").get(getCommentsForProblem)
router.route("/leaderboard").get(getLeaderboard)

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "jansetu_issues",
    allowed_formats: ["jpg", "jpeg", "png", "webp"]
  }
});

const upload = multer({ storage });

// problem
router.route("/createProblem/:userId").post(verifyJWT, upload.array('media', 4), createProblem);
router.route("/problems/:problemId/rate/:userId").post(verifyJWT, rateProblem);
router.route("/problems/:problemId/upvote/:userId").post(verifyJWT, toggleUpvote);
router.route("/assign/:problemId").post(assignProblem)
router.route("/problem/:problemId/user/:userId").delete(verifyJWT, deleteProblem)
router.route("/getAllproblems").get(getAllProblems)
router.route("/similar").get(findSimilarProblems)
router.route("/userComplaints/:userId").get(verifyJWT, getUserComplaints)



// official
router.route("/signupOfficial").post(signupOfficial)
router.route("/loginOfficial").post(loginOfficial)
router.route("/getProblemOfficial").get(verifyJWT, getOfficialProblems);
router.route("/problems/:problemId/official/status").put(verifyJWT, updateProblemStatusByOfficial);

export default router;