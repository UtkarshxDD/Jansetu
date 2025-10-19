import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { addCommentToProblem, deleteComment, getCommentsForProblem, loginUser, logout, signupUser, getUserProfile, updateUserProfile } from "../controller/userController.js";
import { assignProblem, createProblem, deleteProblem, getAllProblems, getOfficialProblems, rateProblem, getUserComplaints, findSimilarProblems, updateProblemStatusByOfficial } from "../controller/problemController.js";
import { getButtonText, trackButtonClick } from "../controller/experimentController.js";
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

// uploads config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, unique + ext);
  }
});
const upload = multer({ storage });

// problem
router.route("/createProblem/:userId").post(verifyJWT, upload.array('media', 4), createProblem);
router.route("/problems/:problemId/rate/:userId").post(verifyJWT, rateProblem);
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

// VWO experiments
router.route("/experiment/button/:userId").get(getButtonText);
router.route("/experiment/track-click/:userId").post(trackButtonClick);

export default router;