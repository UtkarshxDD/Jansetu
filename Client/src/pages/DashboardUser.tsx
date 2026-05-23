import React, { useState, useEffect } from "react";
import { FaHome, FaListAlt } from "react-icons/fa";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API } from '../ApiUri';
import toast from 'react-hot-toast';


const DashboardUser: React.FC = () => {
  const [activeSection, setActiveSection] = useState<"account" | "issues">("account");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    address: "",
    points: 0,
    level: ""
  });

  const [issues, setIssues] = useState<Array<{
    _id: string; title: string; status: string; category: string; createdAt: string;
  }>>([]);

  useEffect(() => {
    fetchUserProfile();
    fetchUserIssues();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('id');

      if (!token || !userId) {
        toast.error('Please login to view your profile');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API}/userProfile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const user = response.data.user;
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          location: user.location?.coordinates ? `${user.location.coordinates[1]}, ${user.location.coordinates[0]}` : "",
          address: user.address || "",
          points: user.points || 0,
          level: user.level || "Bronze Citizen"
        });
      } else {
        toast.error('Failed to fetch user profile');
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        toast.error('Failed to fetch user profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchUserIssues = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('id');
      if (!token || !userId) return;
      const res = await axios.get(`${API}/userComplaints/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setIssues(res.data.complaints);
    } catch (err) {
      console.error('Error fetching user issues:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('id');

      if (!token || !userId) {
        toast.error('Please login to update your profile');
        return;
      }

      // Parse location coordinates
      let locationData = null;
      if (formData.location) {
        const coords = formData.location.split(',').map(coord => parseFloat(coord.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          locationData = {
            type: 'Point',
            coordinates: [coords[1], coords[0]] // longitude, latitude
          };
        }
      }

      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: locationData,
        address: formData.address
      };

      const response = await axios.put(`${API}/updateUserProfile/${userId}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <div className="w-full md:w-64 bg-white shadow-sm p-4">
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 mb-4">MENU</h2>
            <div className="space-y-2">
              <div className="flex items-center p-2 rounded-md">
                <div className="w-6 h-6 flex items-center justify-center mr-3 text-gray-500">
                  <FaHome size={16} />
                </div>
                <span className="text-gray-600">Account</span>
              </div>
              <div className="flex items-center p-2 rounded-md">
                <div className="w-6 h-6 flex items-center justify-center mr-3 text-gray-500">
                  <FaListAlt size={16} />
                </div>
                <span className="text-gray-600">All Issues</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white shadow-sm p-4">
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 mb-4">MENU</h2>
          <div className="space-y-2">
            <div
              className={`flex items-center p-2 rounded-md cursor-pointer ${activeSection === "account" ? "bg-purple-50" : "hover:bg-gray-100"}`}
              onClick={() => setActiveSection("account")}
            >
              <div className={`w-6 h-6 flex items-center justify-center mr-3 ${activeSection === "account" ? "text-purple-600" : "text-gray-500"}`}>
                <FaHome size={16} />
              </div>
              <span className={`${activeSection === "account" ? "text-purple-600 font-medium" : "text-gray-600"}`}>
                Account
              </span>
            </div>

            <div
              className={`flex items-center p-2 rounded-md cursor-pointer ${activeSection === "issues" ? "bg-purple-50" : "hover:bg-gray-100"}`}
              onClick={() => setActiveSection("issues")}
            >
              <div className={`w-6 h-6 flex items-center justify-center mr-3 ${activeSection === "issues" ? "text-purple-600" : "text-gray-500"}`}>
                <FaListAlt size={16} />
              </div>
              <span className={`${activeSection === "issues" ? "text-purple-600 font-medium" : "text-gray-600"}`}>
                All Issues
              </span>
            </div>
          </div>
        </div>
      </div>

      
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {activeSection === "account" && (
            <div>
              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-2">
                  <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden flex items-end justify-center">
                    <img
                      src="\public\Profile.png"
                      alt="Profile"
                      className="w-24 h-24 object-cover"
                    />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">{formData.name}</h1>
                <p className="text-gray-600 mb-3">{formData.email}</p>
                <div className="flex gap-4 mb-4">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-md flex flex-col items-center">
                    <span className="text-xs uppercase font-bold opacity-90 tracking-wider">Civic Points</span>
                    <span className="text-2xl font-black">{formData.points}</span>
                  </div>
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md flex flex-col items-center justify-center">
                    <span className="text-xs uppercase font-bold opacity-90 tracking-wider">Current Level</span>
                    <span className="text-lg font-bold mt-1">{formData.level}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium mb-6">Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location (lat, lng)</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g., 28.7041, 77.1025"
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`px-6 py-2 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                      saving 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection === "issues" && (
            <div>
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                🌟 Your Civic Impact Timeline
              </h2>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                {issues.length > 0 ? (
                  <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
                    {issues.map((issue) => {
                      const statusColors: Record<string, string> = {
                        pending: 'bg-amber-100 text-amber-700 ring-amber-500/30',
                        under_review: 'bg-blue-100 text-blue-700 ring-blue-500/30',
                        assigned: 'bg-purple-100 text-purple-700 ring-purple-500/30',
                        resolved: 'bg-emerald-100 text-emerald-700 ring-emerald-500/30',
                      };
                      return (
                        <div key={issue._id} className="relative pl-8">
                          {/* Timeline dot */}
                          <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white ring-2 ${issue.status === 'resolved' ? 'bg-emerald-500 ring-emerald-200' : 'bg-blue-500 ring-blue-200'}`}></div>
                          
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                                  {new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">Reported: {issue.title}</h3>
                                <p className="text-sm text-slate-500 font-medium">Category: {issue.category}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ring-1 ${statusColors[issue.status] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                                  {issue.status.replace('_', ' ')}
                                </span>
                                {issue.status === 'resolved' && (
                                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                    +50 Points Earned!
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🌱</div>
                    <p className="text-slate-500 font-medium mb-4">Your impact timeline is empty.</p>
                    <button onClick={() => navigate('/map')} className="text-blue-600 font-bold hover:underline">
                      Plant your first seed (Report an Issue) →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardUser;
