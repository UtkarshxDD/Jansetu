import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    MapPin, 
    MessageSquare, 
    Heart,
    ArrowRight
} from 'lucide-react';

const modules = [
    {
        icon: MessageSquare,
        title: "Community Social Feed",
        description: "Connect with neighbors, share local stories, discover events, and build stronger community bonds.",
        features: ["Location-based Posts", "Rich Media Support", "Community Engagement", "Local Discovery"],
        path: "/feed",
        color: "green",
        stats: "25K+ Posts Shared"
    },
    {
        icon: Heart,
        title: "Disaster Relief Fundraising",
        description: "Support disaster relief efforts through secure crowdfunding campaigns with transparent fund tracking.",
        features: ["Verified Campaigns", "Secure Donations", "Progress Tracking", "Impact Reports"],
        path: "/disaster-fundraising",
        color: "red",
        stats: "₹2.5Cr+ Raised"
    },
    {
        icon: MapPin,
        title: "Civic Issue Reporting",
        description: "Report and track civic problems with interactive maps, real-time updates, and direct communication with authorities.",
        features: ["Interactive Map Interface", "Real-time Tracking", "Photo Documentation", "Status Updates"],
        path: "/map",
        color: "blue",
        stats: "10K+ Issues Resolved"
    }
];

const getColorClasses = (color: string) => ({
    bg: `bg-${color}-50`,
    text: `text-${color}-600`,
    border: `border-${color}-200`,
    hover: `hover:border-${color}-300`,
    gradient: `from-${color}-500 to-${color}-600`
});

const ModulesSection: React.FC = () => {
    return (
        <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 text-blue-700 text-sm font-medium"
                    >
                        Platform Modules
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                    >
                        Three Core Modules, One Powerful Platform
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-gray-600 text-lg max-w-3xl mx-auto"
                    >
                        JanSetu brings together civic reporting, community engagement, and disaster relief 
                        in one comprehensive platform designed for modern digital governance.
                    </motion.p>
                </div>

                {/* Modules Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {modules.map((module, index) => {
                        const colors = getColorClasses(module.color);
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`group bg-white rounded-2xl border-2 ${colors.border} ${colors.hover} hover:shadow-xl transition-all duration-300 p-8 relative overflow-hidden`}
                            >
                                {/* Background Pattern */}
                                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                                    <div className={`w-full h-full bg-gradient-to-br ${colors.gradient} rounded-full transform translate-x-8 -translate-y-8`}></div>
                                </div>

                                {/* Icon */}
                                <div className={`inline-flex p-3 ${colors.bg} rounded-xl mb-6 relative z-10`}>
                                    <module.icon className={`w-8 h-8 ${colors.text}`} />
                                </div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        {module.title}
                                    </h3>
                                    
                                    <p className="text-gray-600 mb-6 leading-relaxed">
                                        {module.description}
                                    </p>

                                    {/* Features */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Features:</h4>
                                        <ul className="space-y-2">
                                            {module.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center text-sm text-gray-600">
                                                    <div className={`w-1.5 h-1.5 ${colors.bg} rounded-full mr-3`}></div>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Stats */}
                                    <div className={`inline-block px-3 py-1 ${colors.bg} ${colors.text} rounded-full text-sm font-medium mb-6`}>
                                        {module.stats}
                                    </div>

                                    {/* CTA */}
                                    <Link
                                        to={module.path}
                                        className={`inline-flex items-center text-sm font-semibold ${colors.text} hover:opacity-80 transition-opacity`}
                                    >
                                        Explore Module
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center mt-16"
                >
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                        <h3 className="text-2xl font-bold mb-4">
                            Ready to Transform Your Community?
                        </h3>
                        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                            Join thousands of citizens, officials, and organizations using JanSetu to build smarter, more connected communities.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/signup"
                                className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                            >
                                Get Started Free
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                            <Link
                                to="/about"
                                className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default ModulesSection;
