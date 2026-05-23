import React, { useEffect, useState } from 'react';
import { ChevronDown, Menu, X, User, Settings, LogOut, Sun, Moon, Bell, Trophy, MapPin, HeartHandshake, BarChart2, MessageSquare, ClipboardList } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import multiavatar from '@multiavatar/multiavatar';
import logo from '../assets/Logo.jpeg'
import toast from 'react-hot-toast';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API } from '../ApiUri';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { useButtonExperiment } from '../hooks/useButtonExperiment';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const { experiment, loading, trackClick } = useButtonExperiment(localStorage.getItem("id") || undefined);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem("token");
    if (!token || unreadCount === 0) return;
    try {
      await axios.put(`${API}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark read");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (token) {
      fetchNotifications();
      const socket = io(API.replace('/api/v1/users', ''));
      const userId = localStorage.getItem("id");
      if (userId) {
        socket.on(`notification_${userId}`, (newNotif) => {
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
          toast.info(newNotif.message);
        });
      }
      return () => { socket.disconnect(); };
    }
  }, [])

  const handleLogOut =()=>{
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    toast.success("Successfully Logged out")
    setIsLoggedIn(false);
    navigate("/login")
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <nav className="bg-white/85 backdrop-blur-lg shadow-sm border-b border-slate-100/50 sticky top-0 z-[9999] transition-all duration-300">
      <div className="max-w-[98%] 2xl:max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img className="h-10 w-10 rounded-full object-cover" src={logo} alt="JanSetu Logo" />
              <span className="text-xl font-bold text-gray-900">{t('app_name')}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block overflow-hidden">
            <div className="flex items-center space-x-2 xl:space-x-4">

              <Link 
                to="/feed" 
                className="text-gray-700 hover:text-blue-600 px-2 xl:px-3 py-2 text-sm font-medium transition-colors flex items-center"
              >
                <MessageSquare className="w-4 h-4 mr-1 text-emerald-500" />
                Community Feed
              </Link>
              <Link 
                to="/leaderboard" 
                className="text-gray-700 hover:text-blue-600 px-2 xl:px-3 py-2 text-sm font-medium transition-colors flex items-center"
              >
                <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                Leaderboard
              </Link>
              <Link 
                to="/disaster-fundraising" 
                className="text-gray-700 hover:text-blue-600 px-2 xl:px-3 py-2 text-sm font-medium transition-colors flex items-center"
              >
                <HeartHandshake className="w-4 h-4 mr-1 text-rose-500" />
                Disaster Relief
              </Link>
              {isLoggedIn && (
                <Link 
                  to="/mycomplaints" 
                  className="text-gray-700 hover:text-blue-600 px-2 xl:px-3 py-2 text-sm font-medium transition-colors flex items-center"
                >
                  <ClipboardList className="w-4 h-4 mr-1 text-slate-500" />
                  My Complaints
                </Link>
              )}


              <Link 
                to="/analytics" 
                className="text-gray-700 hover:text-blue-600 px-2 xl:px-3 py-2 text-sm font-medium transition-colors flex items-center"
              >
                <BarChart2 className="w-4 h-4 mr-1 text-indigo-500" />
                Analytics
              </Link>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Language Selector */}
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as any)} 
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="en">EN</option>
              <option value="hi">हिं</option>
            </select>

            {/* Premium Report Issue Button */}
            <Link
              to="/map"
              onClick={() => trackClick()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md shadow-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/40 flex items-center space-x-2 transform hover:-translate-y-0.5"
            >
              <MapPin className="w-4 h-4 mr-1" />
              <span>Report Issue</span>
            </Link>

            {/* User Menu */}
            {isLoggedIn ? (
              <div className="relative flex items-center">
                <button
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    if (userDropdownOpen) setUserDropdownOpen(false);
                    if (!notifOpen) markAllRead();
                  }}
                  className="relative p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors mr-2"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 z-[10000] max-h-[400px] overflow-y-auto">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-gray-500 text-sm">No notifications yet</div>
                    ) : (
                      notifications.map((n: any) => (
                        <div key={n._id} className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                          <p className="text-sm text-gray-800">{n.message}</p>
                          <span className="text-xs text-gray-500 mt-1 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    if (notifOpen) setNotifOpen(false);
                  }}
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <div 
                    className="h-8 w-8 rounded-full flex items-center justify-center overflow-hidden border border-slate-200"
                    dangerouslySetInnerHTML={{ __html: multiavatar(localStorage.getItem('id') || 'guest') }}
                  />
                  <ChevronDown className={`h-4 w-4 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 z-[10000]">
                    <Link
                      to="/dashboardUser"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </Link>
                    <Link
                      to="/mycomplaints"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      My Complaints
                    </Link>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={() => {
                        handleLogOut();
                        setUserDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {/* Navigation Links */}
            <div className="space-y-3">
              <Link
                to="/"
                onClick={closeMenu}
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Home
              </Link>
              <Link
                to="/feed"
                onClick={closeMenu}
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Community Feed
              </Link>
              <Link
                to="/disaster-fundraising"
                onClick={closeMenu}
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                🤝 Disaster Relief
              </Link>
              {isLoggedIn && (
                <Link
                  to="/mycomplaints"
                  onClick={closeMenu}
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  My Complaints
                </Link>
              )}
              <Link
                to="/officials"
                onClick={closeMenu}
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Officials
              </Link>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* User Actions */}
            {isLoggedIn ? (
              <div className="space-y-3">
                <Link
                  to="/dashboardUser"
                  onClick={closeMenu}
                  className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <User className="h-4 w-4 mr-3" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogOut();
                    closeMenu();
                  }}
                  className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors text-center"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="block px-3 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-md transition-colors text-center"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-gray-600">Theme</span>
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-gray-600">Language</span>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="en">EN</option>
                  <option value="hi">हिं</option>
                </select>
              </div>
            </div>

            {/* Report Issue Button */}
            <Link
              to="/map"
              onClick={() => {
                trackClick();
                closeMenu();
              }}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-center font-medium transition-colors"
            >
              {loading ? 'Loading...' : experiment.buttonText} →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
