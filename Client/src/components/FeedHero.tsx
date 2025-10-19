import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Heart, MapPin } from 'lucide-react';

const FeedHero: React.FC = () => {
  const stats = [
    { icon: Users, label: 'Active Users', value: '10K+', color: 'blue' },
    { icon: MessageSquare, label: 'Posts Shared', value: '25K+', color: 'green' },
    { icon: Heart, label: 'Likes Given', value: '100K+', color: 'red' },
    { icon: MapPin, label: 'Cities Connected', value: '500+', color: 'purple' }
  ];

  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect with Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Community</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Share stories, discover local events, and stay connected with what's happening in your city. 
            Join thousands of citizens building stronger communities together.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                stat.color === 'green' ? 'bg-green-100 text-green-600' :
                stat.color === 'red' ? 'bg-red-100 text-red-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Share Your Story</h3>
            <p className="text-gray-600">
              Post updates, photos, and experiences from your neighborhood with rich media support.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Discover Local</h3>
            <p className="text-gray-600">
              Find posts from your city and nearby areas. Stay updated with local events and news.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Engage & Connect</h3>
            <p className="text-gray-600">
              Like, comment, and interact with your community members. Build meaningful connections.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeedHero;
