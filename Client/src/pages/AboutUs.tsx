import React from 'react';
import { Link } from 'react-router-dom';
import FaqSection from '../components/FaqSection';
const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <div className="flex flex-col justify-center">
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              Empowering Citizens,<br />Improving Communities
            </h1>

            <p className="text-gray-700 text-lg mb-4">
              <strong>JanSetu</strong> is a civic engagement platform designed to bridge the gap between citizens and local authorities. We make it easy for residents to report problems like potholes, streetlight failures, or water leaks using a location-based map interface.
            </p>

            <p className="text-gray-700 text-lg mb-4">
              Issues raised by the community are visible to all and can be upvoted. Once a certain number of votes is reached, the issue is automatically assigned to the concerned department, making governance more participative and transparent.
            </p>

            <p className="text-gray-700 text-lg mb-6">
              Whether you're a concerned resident or a government official, <span className="text-blue-600 font-semibold">JanSetu</span> brings real-time civic collaboration to your fingertips.
            </p>

            <Link
              to="/map"
              className="inline-block mt-4 bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition"
            >
              Start Reporting →
            </Link>
          </div>

          {/* Images */}
          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition duration-300">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                alt="Civic workers inspecting a road"
                className="w-full h-64 object-cover transform hover:scale-105 transition duration-300"
              />
            </div>
            <div className="overflow-hidden rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition duration-300">
              <img
                src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80"
                alt="Community engagement and public infrastructure"
                className="w-full h-64 object-cover transform hover:scale-105 transition duration-300"
              />
            </div>
          </div>
        </div>
      </div>
      <FaqSection/>
    </div>
  );
};

export default AboutUs;
