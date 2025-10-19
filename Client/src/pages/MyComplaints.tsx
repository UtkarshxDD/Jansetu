import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API } from '../ApiUri';
import toast from 'react-hot-toast';
import { Trash2, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'under_review' | 'assigned' | 'resolved';
  createdAt: string;
  voteCount: number;
  averageRating: number;
  timeline?: { type: string; message: string; at?: string }[];
  slaDueAt?: string | null;
}

const MyComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('id');

      if (!token || !userId) {
        toast.error('Please login to view your complaints');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API}/userComplaints/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setComplaints(response.data.complaints);
      } else {
        toast.error('Failed to fetch complaints');
      }
    } catch (error: any) {
      console.error('Error fetching complaints:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        toast.error('Failed to fetch complaints');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComplaint = async (complaintId: string) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('id');

      if (!token || !userId) {
        toast.error('Please login to delete complaints');
        return;
      }

      const response = await axios.delete(`${API}/problem/${complaintId}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('Complaint deleted successfully');
        fetchComplaints(); // Refresh the list
      } else {
        toast.error('Failed to delete complaint');
      }
    } catch (error: any) {
      console.error('Error deleting complaint:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to delete complaint');
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'under_review':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'assigned':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-green-100 text-green-800';
      case 'resolved':
        return 'bg-green-200 text-green-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (ms: number) => {
    const abs = Math.abs(ms);
    const minutes = Math.floor(abs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${Math.max(1, minutes)}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-[#f5f4ea] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#f5f4ea] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Complaints</h1>
          <p className="text-gray-600">Track the status of your reported issues</p>
        </div>

        {complaints.length === 0 ? (
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No complaints found</h3>
            <p className="text-gray-500 mb-6">You haven't reported any issues yet.</p>
            <button
              onClick={() => navigate('/map')}
              className="bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              Report an Issue
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {complaints.map((complaint) => (
              <div
                key={complaint._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {complaint.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    {Array.isArray(complaint.timeline) && complaint.timeline.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Timeline</h4>
                        <ol className="relative border-s border-gray-200">
                          {complaint.timeline.map((evt, idx) => (
                            <li key={idx} className="mb-4 ms-4">
                              <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white"></div>
                              <time className="mb-1 text-xs font-normal leading-none text-gray-400">
                                {evt.at ? formatDate(evt.at) : ''}
                              </time>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium capitalize">{evt.type}</span>: {evt.message}
                              </p>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    
                    <p className="text-gray-600 mb-4">{complaint.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Category:</span>
                        {complaint.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Votes:</span>
                        {complaint.voteCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Rating:</span>
                        {complaint.averageRating.toFixed(1)}/5
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Reported:</span>
                        {formatDate(complaint.createdAt)}
                      </span>
                      {complaint.slaDueAt && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium">SLA:</span>
                          {(() => {
                            const due = new Date(complaint.slaDueAt).getTime();
                            const delta = due - now;
                            const label = delta >= 0 ? 'due in' : 'overdue by';
                            return `${label} ${formatDuration(delta)}`;
                          })()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {getStatusIcon(complaint.status)}
                    <button
                      onClick={() => handleDeleteComplaint(complaint._id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2"
                      title="Delete complaint"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/map')}
            className="bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            Report New Issue
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyComplaints; 