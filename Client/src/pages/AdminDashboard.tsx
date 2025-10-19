import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API } from '../ApiUri';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  LogOut,
  MapPin,
  Heart,
  XCircle,
  User,
  DollarSign,
  Calendar
} from 'lucide-react';

// Interfaces
interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  underReviewComplaints: number;
  assignedComplaints: number;
  resolvedComplaints: number;
  totalUsers: number;
  totalOfficials: number;
}

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  images: string[];
  createdAt: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    department: string;
  };
}

interface PendingCampaign {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  disasterType: string;
  category: string;
  urgencyLevel: string;
  targetAmount: number;
  location: {
    address: string;
    city: string;
    state: string;
  };
  images: string[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  organizationName?: string;
  organizationType: string;
  contactInfo: {
    phone: string;
    email: string;
  };
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
  campaignDuration: {
    endDate: string;
  };
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // State Management
  const [activeTab, setActiveTab] = useState<'complaints' | 'campaigns'>('complaints');
  const [loading, setLoading] = useState(true);
  
  // Complaints State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  
  // Campaigns State
  const [pendingCampaigns, setPendingCampaigns] = useState<PendingCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<PendingCampaign | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Initialize Dashboard
  useEffect(() => {
    checkAuth();
    if (activeTab === 'complaints') {
      fetchComplaintsData();
    } else {
      fetchCampaignsData();
    }
  }, [activeTab]);

  // Authentication Check
  const checkAuth = () => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      toast.error('Please login as admin');
      navigate('/admin/login');
    }
  };

  // Fetch Complaints Data
  const fetchComplaintsData = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      
      // Fetch stats
      const statsResponse = await axios.get(`${API.replace('/users', '/admin')}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }

      // Fetch complaints
      const complaintsResponse = await axios.get(`${API.replace('/users', '/admin')}/complaints`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (complaintsResponse.data.success) {
        setComplaints(complaintsResponse.data.complaints);
      }

    } catch (error) {
      console.error('Failed to fetch complaints data:', error);
      toast.error('Failed to load complaints data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Campaigns Data
  const fetchCampaignsData = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await axios.get(
        'http://localhost:8000/api/v1/campaign/admin/campaigns/pending',
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );

      if (response.data.success) {
        setPendingCampaigns(response.data.campaigns);
      }

    } catch (error) {
      console.error('Failed to fetch campaigns data:', error);
      toast.error('Failed to load campaigns data');
    } finally {
      setLoading(false);
    }
  };

  // Handle Campaign Review
  const handleCampaignReview = async (campaignId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setReviewLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.put(
        `http://localhost:8000/api/v1/campaign/admin/campaigns/${campaignId}/review`,
        {
          action,
          reviewNotes: reviewNotes.trim(),
          rejectionReason: action === 'reject' ? rejectionReason.trim() : undefined
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );

      if (response.data.success) {
        toast.success(`Campaign ${action}d successfully`);
        setPendingCampaigns(prev => prev.filter(c => c._id !== campaignId));
        setShowCampaignModal(false);
        setSelectedCampaign(null);
        setReviewNotes('');
        setRejectionReason('');
      }
    } catch (error: any) {
      console.error('Review error:', error);
      toast.error(error.response?.data?.message || `Failed to ${action} campaign`);
    } finally {
      setReviewLoading(false);
    }
  };

  // Handle Complaint Status Update
  const updateComplaintStatus = async (complaintId: string, status: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.put(
        `${API.replace('/users', '/admin')}/complaints/${complaintId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      if (response.data.success) {
        toast.success('Complaint status updated');
        fetchComplaintsData();
        setShowComplaintModal(false);
      }
    } catch (error) {
      console.error('Failed to update complaint:', error);
      toast.error('Failed to update complaint status');
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  // Utility Functions
  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (level: string) => {
    if (!level) return 'bg-gray-500 text-white';
    
    switch (level) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDisasterIcon = (type: string) => {
    if (!type) return '⚠️';
    
    switch (type) {
      case 'flood': return '🌊';
      case 'earthquake': return '🌍';
      case 'fire': return '🔥';
      case 'cyclone': return '🌪️';
      case 'drought': return '🏜️';
      case 'landslide': return '⛰️';
      default: return '⚠️';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">JanSetu Admin Dashboard</h1>
              <p className="text-gray-600">Manage complaints and fundraising campaigns</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('complaints')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'complaints'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText size={20} />
                  <span>Complaint Management</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'campaigns'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Heart size={20} />
                  <span>Campaign Review</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Complaints Tab Content */}
        {activeTab === 'complaints' && (
          <div>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalComplaints}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingComplaints}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Under Review</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.underReviewComplaints}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Resolved</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.resolvedComplaints}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Complaints Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Complaints</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Complaint
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {complaints.map((complaint) => (
                      <tr key={complaint._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{complaint.title || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{complaint.category || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{complaint.user?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{complaint.user?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                            {complaint.status ? complaint.status.replace('_', ' ') : 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.priority)}`}>
                            {complaint.priority || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setShowComplaintModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Tab Content */}
        {activeTab === 'campaigns' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Campaign Reviews</h2>
              <p className="text-gray-600">Review and approve fundraising campaigns</p>
            </div>

            {pendingCampaigns.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-600">No campaigns pending review at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {pendingCampaigns.map((campaign) => (
                  <div key={campaign._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {/* Campaign Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={campaign.images && campaign.images[0] || 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400'}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 flex space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getUrgencyColor(campaign.urgencyLevel)}`}>
                          {campaign.urgencyLevel.toUpperCase()}
                        </span>
                        <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                          {getDisasterIcon(campaign.disasterType)} {campaign.disasterType.toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          PENDING REVIEW
                        </span>
                      </div>
                    </div>

                    {/* Campaign Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {campaign.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {campaign.shortDescription}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin size={16} className="mr-1" />
                          <span>{campaign.location.city}, {campaign.location.state}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign size={16} className="mr-1" />
                          <span>Target: {formatCurrency(campaign.targetAmount)}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <User size={16} className="mr-1" />
                          <span>{campaign.organizationName || campaign.createdBy?.name || 'N/A'}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={16} className="mr-1" />
                          <span>Ends: {new Date(campaign.campaignDuration.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowCampaignModal(true);
                        }}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-1"
                      >
                        <Eye size={16} />
                        <span>Review Campaign</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Complaint Detail Modal */}
        {showComplaintModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Complaint Details</h3>
                  <button
                    onClick={() => setShowComplaintModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedComplaint.title || 'N/A'}</h4>
                    <p className="text-gray-600 mt-1">{selectedComplaint.description || 'N/A'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Category:</span>
                      <p className="text-gray-900">{selectedComplaint.category || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Priority:</span>
                      <p className="text-gray-900">{selectedComplaint.priority || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">Location:</span>
                    <p className="text-gray-900">{selectedComplaint.location?.address || 'N/A'}</p>
                  </div>

                        <div>
                          <span className="text-sm font-medium text-gray-500">Reported by:</span>
                          <p className="text-gray-900">{selectedComplaint.user?.name || 'N/A'} ({selectedComplaint.user?.email || 'N/A'})</p>
                        </div>

                  {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Images:</span>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {selectedComplaint.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Complaint ${index + 1}`}
                            className="w-full h-32 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-4">
                    <button
                      onClick={() => updateComplaintStatus(selectedComplaint._id, 'under_review')}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    >
                      Mark Under Review
                    </button>
                    <button
                      onClick={() => updateComplaintStatus(selectedComplaint._id, 'resolved')}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Review Modal */}
        {showCampaignModal && selectedCampaign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Campaign Review</h2>
                    <p className="text-gray-600">Submitted on {new Date(selectedCampaign.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => setShowCampaignModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Column - Campaign Details */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Campaign Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div>
                          <span className="font-medium">Title:</span>
                          <p className="text-gray-700">{selectedCampaign.title}</p>
                        </div>
                        <div>
                          <span className="font-medium">Description:</span>
                          <p className="text-gray-700">{selectedCampaign.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium">Disaster Type:</span>
                            <p className="text-gray-700 capitalize">{selectedCampaign.disasterType}</p>
                          </div>
                          <div>
                            <span className="font-medium">Category:</span>
                            <p className="text-gray-700 capitalize">{selectedCampaign.category}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium">Target Amount:</span>
                            <p className="text-gray-700">{formatCurrency(selectedCampaign.targetAmount)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Urgency:</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${getUrgencyColor(selectedCampaign.urgencyLevel)}`}>
                              {selectedCampaign.urgencyLevel.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Location Details</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700">{selectedCampaign.location.address}</p>
                        <p className="text-gray-700">{selectedCampaign.location.city}, {selectedCampaign.location.state}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Campaign Images</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedCampaign.images && selectedCampaign.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Campaign image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Creator & Review */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Creator Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div>
                          <span className="font-medium">Name:</span>
                          <p className="text-gray-700">{selectedCampaign.createdBy?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium">Email:</span>
                          <p className="text-gray-700">{selectedCampaign.createdBy?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span>
                          <p className="text-gray-700">{selectedCampaign.createdBy?.phone || 'N/A'}</p>
                        </div>
                        {selectedCampaign.organizationName && (
                          <div>
                            <span className="font-medium">Organization:</span>
                            <p className="text-gray-700">{selectedCampaign.organizationName}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Type:</span>
                          <p className="text-gray-700 capitalize">{selectedCampaign.organizationType}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Bank Details</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div>
                          <span className="font-medium">Account Holder:</span>
                          <p className="text-gray-700">{selectedCampaign.bankDetails.accountHolderName}</p>
                        </div>
                        <div>
                          <span className="font-medium">Bank Name:</span>
                          <p className="text-gray-700">{selectedCampaign.bankDetails.bankName}</p>
                        </div>
                        <div>
                          <span className="font-medium">Account Number:</span>
                          <p className="text-gray-700">****{selectedCampaign.bankDetails.accountNumber.slice(-4)}</p>
                        </div>
                        <div>
                          <span className="font-medium">IFSC Code:</span>
                          <p className="text-gray-700">{selectedCampaign.bankDetails.ifscCode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Review Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Review Notes</h3>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add any notes about this campaign review..."
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Rejection Reason (if rejecting)</h3>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide reason for rejection (required if rejecting)..."
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                  <button
                    onClick={() => handleCampaignReview(selectedCampaign._id, 'reject')}
                    disabled={reviewLoading}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <XCircle size={20} />
                    <span>{reviewLoading ? 'Processing...' : 'Reject Campaign'}</span>
                  </button>
                  <button
                    onClick={() => handleCampaignReview(selectedCampaign._id, 'approve')}
                    disabled={reviewLoading}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <CheckCircle size={20} />
                    <span>{reviewLoading ? 'Processing...' : 'Approve Campaign'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
