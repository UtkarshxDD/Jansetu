import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ThumbsUp, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SuccessStory {
  id: string;
  title: string;
  location: string;
  date: string;
  votes: number;
  category: string;
  image: string;
  description: string;
}

const successStories: SuccessStory[] = [
  {
    id: '1',
    title: 'Road Repair in Karol Bagh',
    location: 'Karol Bagh, Delhi',
    date: '2 weeks ago',
    votes: 245,
    category: 'Infrastructure',
    image: '/public/road-repair.jpg',
    description: 'Major pothole fixed within 48 hours of reporting. Quick response from authorities!'
  },
  {
    id: '2',
    title: 'Street Light Installation',
    location: 'Rajouri Garden',
    date: '1 week ago',
    votes: 189,
    category: 'Lighting',
    image: '/public/street-light.jpg',
    description: 'Dark street corner now well-lit after community reporting.'
  },
  {
    id: '3',
    title: 'Garbage Collection Fixed',
    location: 'Pitampura',
    date: '3 days ago',
    votes: 156,
    category: 'Sanitation',
    image: '/public/garbage.jpg',
    description: 'Regular garbage collection resumed after community intervention.'
  }
];

const FeaturedIssues: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-green-50 text-green-700 text-sm font-medium"
          >
            Success Stories
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold font-serif mb-6"
          >
            Recently Resolved Issues
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600 text-lg max-w-2xl mx-auto"
          >
            See how citizens and authorities are working together to improve our city.
            These success stories showcase the power of community engagement.
          </motion.p>
        </div>

        {/* Success Stories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {successStories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Resolved
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  {story.location}
                  <span className="mx-2">•</span>
                  <Calendar className="w-4 h-4 mr-1" />
                  {story.date}
                </div>
                
                <h3 className="text-xl font-bold mb-2">{story.title}</h3>
                <p className="text-gray-600 mb-4">{story.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    <span>{story.votes} votes</span>
                  </div>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {story.category}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Link
            to="/map"
            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            View All Success Stories
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedIssues;


