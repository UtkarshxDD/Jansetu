import mongoose from 'mongoose';

const officialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  department: {
    type: String // e.g., "Roadworks", "Sanitation", etc.
  },

  assignedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProblemReport'
  }],

  completedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProblemReport'
  }],

  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

officialSchema.index({ location: '2dsphere' });

const Official = mongoose.model('Official', officialSchema);
export default Official;
