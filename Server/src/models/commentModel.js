import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
  },
  userMade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toProblem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProblemReport',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
