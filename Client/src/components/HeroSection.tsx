import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Droplet, Heart, ShieldCheck, Zap } from 'lucide-react';

const HeroSection: React.FC = () => {
    return (
        <section className="relative pt-12 pb-24 overflow-hidden bg-white">
            {/* Soft Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-50/50 rounded-[100%] blur-[100px] -z-10 pointer-events-none"></div>
            <div className="absolute top-32 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left Column: Massive CTA & Typography */}
                    <div className="lg:col-span-7 pt-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-6"
                        >
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            <span className="text-sm font-semibold text-blue-700 tracking-wide">JanSetu v2.0 is Live</span>
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight font-heading"
                        >
                            Give Your City <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                A Powerful Voice.
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg sm:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed"
                        >
                            Report potholes, water leaks, and safety hazards instantly. 
                            Track progress in real-time and hold authorities accountable. 
                            Join the fastest growing civic-tech movement in India.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 mb-12"
                        >
                            {/* Primary Massive Button */}
                            <Link 
                                to="/map"
                                className="group relative flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(59,130,246,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(59,130,246,0.4)]"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] animate-gradient"></div>
                                <span className="relative flex items-center">
                                    <MapPin className="w-6 h-6 mr-2" />
                                    Report Issue on Map
                                </span>
                            </Link>
                            
                            <Link 
                                to="/feed"
                                className="flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                            >
                                View Live Issues
                            </Link>
                        </motion.div>

                        {/* Trust Indicators */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex items-center space-x-6 text-sm font-medium text-slate-500"
                        >
                            <div className="flex items-center">
                                <ShieldCheck className="w-5 h-5 text-emerald-500 mr-2" />
                                10k+ Verified Reports
                            </div>
                            <div className="flex items-center">
                                <Zap className="w-5 h-5 text-amber-500 mr-2" />
                                48hr Avg Resolution
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Floating Cards (Sideways Features) */}
                    <div className="lg:col-span-5 relative hidden lg:block">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-[2.5rem] transform rotate-3 scale-105 -z-10"></div>
                        
                        <div className="relative space-y-6">
                            {/* Visual Map Mockup Card */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.7, delay: 0.4 }}
                                className="bg-white p-2 rounded-[2rem] shadow-2xl border border-slate-100 transform -rotate-2"
                            >
                                <div className="bg-slate-50 rounded-3xl h-64 w-full relative overflow-hidden flex items-center justify-center border border-slate-100">
                                    {/* Abstract Map Grid */}
                                    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                                    
                                    {/* Heatmap Hotspots */}
                                    <div className="absolute top-1/4 left-1/3 w-40 h-40 bg-rose-600 rounded-full mix-blend-multiply filter blur-[50px] opacity-60 animate-pulse"></div>
                                    <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-orange-500 rounded-full mix-blend-multiply filter blur-[40px] opacity-70 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                    <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply filter blur-[40px] opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
                                    <div className="absolute bottom-10 right-1/4 w-32 h-32 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[40px] opacity-40 animate-pulse" style={{ animationDelay: '1.5s' }}></div>

                                    {/* Glassmorphism Message Card */}
                                    <div className="relative z-10 bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-white flex flex-col items-start hover:scale-105 transition-transform duration-300 cursor-default">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="bg-rose-100 p-2 rounded-xl">
                                                <MapPin className="w-5 h-5 text-rose-600 animate-bounce" />
                                            </div>
                                            <p className="font-bold text-slate-900 text-sm">Live Heatmap Analytics</p>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                            AI-powered visualization mapping civic issues<br />
                                            to help officials prioritize problem zones.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Secondary Features (Sideways) */}
                            <div className="grid grid-cols-2 gap-4">
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                >
                                    <Link to="/feed" className="block bg-white p-5 rounded-2xl shadow-lg border border-slate-100 hover:-translate-y-1 transition-transform group">
                                        <div className="bg-emerald-50 w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Droplet className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-sm">Community Feed</h3>
                                        <p className="text-xs text-slate-500 mt-1">Connect locally</p>
                                    </Link>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.7 }}
                                >
                                    <Link to="/disaster-fundraising" className="block bg-white p-5 rounded-2xl shadow-lg border border-slate-100 hover:-translate-y-1 transition-transform group">
                                        <div className="bg-rose-50 w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Heart className="w-5 h-5 text-rose-600" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-sm">Disaster Relief</h3>
                                        <p className="text-xs text-slate-500 mt-1">Help others in need</p>
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            {/* CSS for gradient animation */}
            <style>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    animation: gradient 3s ease infinite;
                }
            `}</style>
        </section>
    );
};

export default HeroSection;