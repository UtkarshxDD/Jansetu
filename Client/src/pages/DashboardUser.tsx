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
    address: ""
  });

  const [issues] = useState([
    { id: 1, title: "Pothole on Main Road", status: "Pending" },
    { id: 2, title: "Streetlight not working", status: "Assigned" },
    { id: 3, title: "Garbage collection delayed", status: "Resolved" },
  ]);

  useEffect(() => {
    fetchUserProfile();
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
          address: user.address || ""
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
                <h1 className="text-2xl font-bold text-gray-900">{formData.name}</h1>
                <p className="text-gray-600">{formData.email}</p>
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
              <h2 className="text-lg font-medium mb-6">Your Issues</h2>
              <div className="bg-white rounded-lg shadow-sm p-6">
                {issues.length > 0 ? (
                  issues.map(issue => (
                    <div key={issue.id} className="border-b border-gray-200 py-2">
                      <p className="font-medium">{issue.title}</p>
                      <p className="text-sm text-gray-600">Status: {issue.status}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No issues found.</p>
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
