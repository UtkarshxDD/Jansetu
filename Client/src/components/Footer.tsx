import React, { useState } from 'react';
import { FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';
import toast from 'react-hot-toast';

const Footer: React.FC = () => {
    const { t } = useI18n();
    const currentYear = new Date().getFullYear();
    const [email, setEmail] = useState('');

    const handleBackToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
        if (!isValid) {
            toast.error('Please enter a valid email');
            return;
        }
        toast.success('Subscribed! We\'ll keep you updated.');
        setEmail('');
    };

    return (
        <footer className="bg-gradient-to-b from-[#2b2b2b] via-[#1e1e1e] to-black
 text-white py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Top Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
                    {/* Logo */}
                    <div className="md:col-span-4">
                        <a href="/" className="text-white text-3xl font-bold">
                            JanSetu 
                        </a>
                        <p className="text-sm text-gray-300 mt-2">Your City, Your Voice — आपकी आवाज़, आपकी पहचान</p>
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-semibold mb-4">Explore</h3>
                        <ul className="space-y-2 text-gray-300">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/map">Report an Issue</Link></li>
                            <li><Link to="/map">Live Map</Link></li>
                            <li><Link to="/aboutus">How It Works</Link></li>
                        </ul>
                    </div>

                    {/* Community */}
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-semibold mb-4">Community</h3>
                        <ul className="space-y-2 text-gray-300">
                            <li><Link to="/#faq">FAQs</Link></li>
                            <li><Link to="/aboutus">Volunteer</Link></li>
                            <li><Link to="/admin/login">Municipal Login</Link></li>
                            <li><Link to="/contactUs">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="md:col-span-4">
                        <h3 className="text-xl font-semibold mb-4">{t('stay_updated')}</h3>
                        <p className="text-gray-300 mb-4">{t('newsletter_cta')}</p>
                        <form className="flex flex-col sm:flex-row items-center gap-3" onSubmit={handleNewsletterSubmit}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="px-4 py-2 w-full sm:w-auto rounded-md text-white"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="bg-white text-black font-semibold px-4 py-2 rounded-md hover:bg-gray-100 transition"
                            >
                                {t('subscribe')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Social Icons */}
                <div className="flex space-x-5 mb-6">
                    <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white transition" target="_blank" rel="noopener noreferrer">
                        <FaTwitter size={20} />
                    </a>
                    <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition" target="_blank" rel="noopener noreferrer">
                        <FaInstagram size={20} />
                    </a>
                    <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-white transition" target="_blank" rel="noopener noreferrer">
                        <FaLinkedin size={20} />
                    </a>
                    <a href="#" aria-label="YouTube" className="text-gray-400 hover:text-white transition" target="_blank" rel="noopener noreferrer">
                        <FaYoutube size={20} />
                    </a>
                </div>

                {/* Bottom */}
                <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <p className="text-sm text-gray-400">
                        © {currentYear} JanSetu. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <a href="#" className="hover:text-white">Privacy Policy</a>
                        <a href="#" className="hover:text-white">Terms of Use</a>
                        <button onClick={handleBackToTop} className="ml-2 px-3 py-1 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition text-xs">{t('back_to_top')} ↑</button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
