import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  permissions: {
    canViewComplaints: { type: Boolean, default: true },
    canUpdateComplaints: { type: Boolean, default: true },
    canDeleteComplaints: { type: Boolean, default: true },
    canAssignOfficials: { type: Boolean, default: true },
    canManageUsers: { type: Boolean, default: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Admin = mongoose.model('Admin', adminSchema);
export default Admin; 