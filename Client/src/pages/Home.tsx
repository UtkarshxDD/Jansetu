import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import ModulesSection from '../components/ModulesSection';
import HowItWorksSection from '../components/HowItWorksSection';
import LiveStatsSection from '../components/LiveStatsSection';
import FaqSection from '../components/FaqSection';



const Home: React.FC = () => {
  return (
    <>
      <HeroSection />
      <ModulesSection />
      <HowItWorksSection />
      <LiveStatsSection />
      <FaqSection />
    </>
  );
};

export default Home;
