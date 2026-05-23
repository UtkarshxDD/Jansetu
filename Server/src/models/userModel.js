import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    type: String
  },
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    default: 'Bronze Citizen'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);
export default User;