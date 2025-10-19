import React, { useEffect, useState } from 'react';
import { ChevronDown, Menu, X, User, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Logo.jpeg'
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { useButtonExperiment } from '../hooks/useButtonExperiment';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const { experiment, loading, trackClick } = useButtonExperiment(localStorage.getItem("id") || undefined);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
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
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img className="h-10 w-10 rounded-full object-cover" src={logo} alt="JanSetu Logo" />
              <span className="text-xl font-bold text-gray-900">{t('app_name')}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/feed" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Community Feed
              </Link>
              <Link 
                to="/disaster-fundraising" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                🤝 Disaster Relief
              </Link>
              {isLoggedIn && (
                <Link 
                  to="/mycomplaints" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  My Complaints
                </Link>
              )}
              <Link 
                to="/officials" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Officials
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

            {/* Report Issue Button */}
            <Link
              to="/map"
              onClick={() => trackClick()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <span>{loading ? 'Loading...' : experiment.buttonText}</span>
              <span>→</span>
            </Link>

            {/* User Menu */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-10">
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
