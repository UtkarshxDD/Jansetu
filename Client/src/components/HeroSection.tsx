import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    MapPin, 
    Droplet, 
    Heart
} from 'lucide-react';

const modules = [
    {
        Icon: Droplet,
        title: "Community Social Feed",
        description: "Connect with neighbors, share local stories, discover events, and build stronger community bonds",
        path: "/feed",
        code: "jansetu/community-feed",
        color: "green",
        stats: "25K+ Posts Shared"
    },
    {
        Icon: Heart,
        title: "Disaster Relief Fundraising",
        description: "Support disaster relief efforts through secure crowdfunding campaigns with transparent fund tracking",
        path: "/disaster-fundraising",
        code: "jansetu/disaster-relief",
        color: "red",
        stats: "₹2.5Cr+ Raised"
    },
    {
        Icon: MapPin,
        title: "Civic Issue Reporting",
        description: "Report and track civic problems with interactive maps, real-time updates, and direct communication with authorities",
        path: "/map",
        code: "jansetu/civic-reporting",
        color: "blue",
        stats: "10K+ Issues Resolved"
    }
];

const getColorClasses = (color: string) => ({
    bg: `bg-${color}-50`,
    text: `text-${color}-500`,
    border: `hover:border-${color}-100`
});

const HeroSection: React.FC = () => {
    return (
        <section className="relative pt-20 pb-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                {/* Main Heading */}
                <div className="text-center mb-20">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl sm:text-6xl lg:text-7xl font-bold text-[#303030] mb-6 tracking-tight"
                    >
                        Complete Digital Platform for
                        <br />
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Smart Governance
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg sm:text-xl text-[#666666] max-w-4xl mx-auto"
                    >
                        JanSetu is a comprehensive ecosystem connecting citizens, officials, and communities. 
                        Report civic issues, engage in social feeds, support disaster relief, and build stronger communities together.
                    </motion.p>
                </div>

                {/* Module Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                >
                    {modules.map((module, index) => {
                        const colors = getColorClasses(module.color);
                        return (
                            <Link 
                                key={index}
                                to={module.path}
                                className={`group bg-white rounded-2xl border-2 border-gray-200 ${colors.border} hover:shadow-[0_20px_50px_rgb(0,0,0,0.15)] transition-all duration-300 p-8 flex flex-col relative overflow-hidden`}
                            >
                                {/* Background Pattern */}
                                <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                                    <div className={`w-full h-full ${colors.bg} rounded-full transform translate-x-6 -translate-y-6`}></div>
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`p-3 ${colors.bg} rounded-xl`}>
                                            <module.Icon className={`w-8 h-8 ${colors.text}`} />
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-2xl font-bold text-[#303030] mb-3">
                                        {module.title}
                                    </h3>
                                    
                                    <p className="text-[#666666] text-base mb-6 flex-grow leading-relaxed">
                                        {module.description}
                                    </p>

                                    {/* Stats */}
                                    <div className={`inline-block px-3 py-1.5 ${colors.bg} ${colors.text} rounded-full text-sm font-semibold mb-4`}>
                                        {module.stats}
                                    </div>

                                    <div className="text-sm font-mono text-gray-400 pt-4 border-t border-gray-100">
                                        {module.code}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;