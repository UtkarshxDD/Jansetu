import React from 'react';
import { motion } from 'framer-motion';
import { Camera, ChevronRight, ClipboardCheck, Users, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
    {
        icon: Camera,
        title: "Report & Track Issues",
        description: "Take photos, mark location, and describe civic problems. Monitor resolution progress on interactive maps with real-time updates.",
        path: "/map",
        code: "jansetu/civic-reporting"
    },
    {
        icon: Users,
        title: "Connect & Engage",
        description: "Join community discussions, share local stories, and discover neighborhood events through our social feed platform.",
        path: "/feed",
        code: "jansetu/community-feed"
    },
    {
        icon: Heart,
        title: "Support Relief Efforts",
        description: "Contribute to verified disaster relief campaigns and track the impact of your donations in real-time.",
        path: "/disaster-fundraising",
        code: "jansetu/disaster-relief"
    },
    {
        icon: Shield,
        title: "Manage & Resolve",
        description: "Officials can efficiently assign, track, and resolve issues while citizens receive notifications at every step.",
        path: "/officialsDashboard",
        code: "jansetu/official-portal"
    }
];

const HowItWorksSection: React.FC = () => {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 text-blue-700 text-sm font-medium"
                    >
                        How It Works
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                    >
                        Four Powerful Ways to Engage
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-gray-600 text-lg max-w-3xl mx-auto"
                    >
                        Whether you're a citizen, official, or community leader, JanSetu provides the tools you need to create positive change in your community.
                    </motion.p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative bg-white rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200"
                        >
                            {/* Icon */}
                            <div className="mb-4">
                                <feature.icon className="w-12 h-12 text-blue-600" />
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-semibold text-[#303030] mb-3">
                                {feature.title}
                            </h3>

                            {/* Code Path */}
                            <div className="text-sm font-mono text-gray-500 mb-3">
                                {feature.code}
                            </div>

                            {/* Description */}
                            <p className="text-[#666666] mb-6">
                                {feature.description}
                            </p>

                            {/* Learn More Link */}
                            <Link
                                to={feature.path}
                                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Learn more
                                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            {/* Usage Stats */}
                            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-4">
                                <div className="flex items-center text-gray-600">
                                    <ClipboardCheck className="w-4 h-4 mr-2" />
                                    <span className="text-sm">4.5</span>
                                </div>
                                <div className="text-gray-600">
                                    <span className="text-sm">1.5K users</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;