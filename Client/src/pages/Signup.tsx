import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff, ArrowRight, Locate } from 'lucide-react';
import toast from 'react-hot-toast';
import { API } from '../ApiUri';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    longitude: '',
    latitude: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Getting your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            longitude: position.coords.longitude.toString(),
            latitude: position.coords.latitude.toString(),
          });
          toast.dismiss();
          toast.success('Location obtained successfully!');
        },
        (error) => {
          toast.dismiss();
          toast.error('Could not get your location. Please enter manually.');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate coordinates
    const longitude = parseFloat(formData.longitude);
    const latitude = parseFloat(formData.latitude);
    
    if (isNaN(longitude) || isNaN(latitude)) {
      toast.error('Please enter valid longitude and latitude coordinates');
      setIsLoading(false);
      return;
    }

    if (longitude < -180 || longitude > 180) {
      toast.error('Longitude must be between -180 and 180');
      setIsLoading(false);
      return;
    }

    if (latitude < -90 || latitude > 90) {
      toast.error('Latitude must be between -90 and 90');
      setIsLoading(false);
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    };
    
    try {
      const response = await axios.post(`${API}/signupUser`, payload);
      
      if (response.status === 201) {
        toast.success('Signup successful! Please login to continue.');
        navigate('/login');
      } else {
        toast.error('Signup failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Signup failed. Please try again.';
        toast.error(errorMessage);
      } else if (error.request) {
        // Network error
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Other error
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-8">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://www.zone4solution.in/images/Disaster-Management.jpg)'
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-blue-800/80"></div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Join JanSetu
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-blue-100"
            >
              Create your account to get started
            </motion.p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    name="name"
                    type="text"
                    placeholder="Your Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    required
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    required
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Phone Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Aadhar Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    name="phone"
                    type="text"
                    placeholder="Aadhar Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    required
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              {/* Location Fields */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">
                    Location Coordinates
                  </label>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    <Locate className="w-4 h-4 mr-1" />
                    Get Location
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      name="longitude"
                      type="number"
                      step="any"
                      placeholder="Longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      name="latitude"
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Back to Home Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="text-center mt-6"
        >
          <Link 
            to="/" 
            className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
