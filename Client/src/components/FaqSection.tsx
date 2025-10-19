import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MapPin, Vote, Bell, Shield } from 'lucide-react';

interface Faq {
  question: string;
  answer: string;
}

interface FaqCategory {
  icon: React.ElementType;
  name: string;
  description: string;
  faqs: Faq[];
}

const faqCategories: FaqCategory[] = [
  {
    icon: MapPin,
    name: 'Reporting Issues',
    description: 'Learn how to effectively report and describe civic problems',
    faqs: [
      {
        question: 'How do I report an issue?',
        answer: 'Click the "Report an Issue" button, mark the location on the map, add photos, and describe the problem. You can also add category tags and rate the severity.'
      },
      {
        question: 'What information should I include?',
        answer: 'Include clear photos, precise location, detailed description, and relevant category. The more information you provide, the faster the resolution.'
      },
      {
        question: 'Can I report issues anonymously?',
        answer: 'While you need an account to report issues, your personal information is kept private. Only the issue details are visible to the public.'
      }
    ]
  },
  {
    icon: Vote,
    name: 'Voting & Support',
    description: 'Understand how community voting impacts issue resolution',
    faqs: [
      {
        question: 'How does voting work?',
        answer: 'Rate issues on a scale of 1-5 based on severity. Ratings of 3+ count as votes for prioritization. Higher community support means faster resolution.'
      },
      {
        question: 'Can I vote on multiple issues?',
        answer: 'Yes, you can vote on any number of issues. However, you can only vote once per issue to ensure fair representation.'
      },
      {
        question: 'Do votes guarantee resolution?',
        answer: 'While votes help prioritize issues, resolution depends on various factors including resource availability and technical feasibility.'
      }
    ]
  },
  {
    icon: Bell,
    name: 'Tracking & Updates',
    description: 'Stay informed about the progress of reported issues',
    faqs: [
      {
        question: 'How can I track my reported issues?',
        answer: 'Visit "My Complaints" in your dashboard to see all your reported issues. Each issue shows its current status, comments, and resolution progress.'
      },
      {
        question: 'What are the different status types?',
        answer: 'Issues can be: Pending (newly reported), Under Review (being assessed), Assigned (work in progress), or Resolved (fixed).'
      },
      {
        question: 'Will I get notified of updates?',
        answer: 'Yes, you will receive notifications when your reported issues change status, receive comments, or get resolved.'
      }
    ]
  },
  {
    icon: Shield,
    name: 'Resolution Process',
    description: 'Learn how issues are handled and resolved',
    faqs: [
      {
        question: 'Who resolves the reported problems?',
        answer: 'Issues are assigned to relevant municipal departments based on category. Local authorities and officials handle the resolution process.'
      },
      {
        question: 'How long does resolution take?',
        answer: 'Resolution time varies based on issue complexity, urgency, and available resources. High-priority issues are typically addressed within 48-72 hours.'
      },
      {
        question: 'What if I am not satisfied with the resolution?',
        answer: 'You can reopen a resolved issue with comments explaining why the resolution is inadequate. This will trigger a review by senior officials.'
      }
    ]
  }
];

const FaqSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const [activeIndices, setActiveIndices] = useState<Record<number, boolean>>({});

  const toggleFaq = (categoryIndex: number, faqIndex: number) => {
    const key = categoryIndex * 100 + faqIndex;
    setActiveIndices(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-6"
          >
            <HelpCircle className="w-8 h-8 text-purple-600" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold font-serif mb-6"
          >
            Frequently Asked Questions
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600 text-lg max-w-2xl mx-auto"
          >
            Everything you need to know about using our platform effectively.
            Can't find your answer? Contact our support team.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Category Sidebar */}
          <div className="lg:col-span-4">
            <div className="space-y-2">
              {faqCategories.map((category, index) => (
                <motion.button
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => setActiveCategory(index)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                    activeCategory === index
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <category.icon className={`w-5 h-5 ${
                      activeCategory === index ? 'text-white' : 'text-gray-500'
                    }`} />
                    <div className="ml-3">
                      <div className="font-medium">{category.name}</div>
                      <div className={`text-sm ${
                        activeCategory === index ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {category.description}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* FAQ List */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {faqCategories[activeCategory].faqs.map((faq, faqIndex) => {
                  const key = activeCategory * 100 + faqIndex;
                  const isActive = activeIndices[key];

                  return (
                    <motion.div
                      key={faqIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: faqIndex * 0.1 }}
                      className="bg-white rounded-xl shadow-sm overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFaq(activeCategory, faqIndex)}
                        className="w-full px-6 py-4 flex justify-between items-center text-left transition-colors hover:bg-gray-50"
                      >
                        <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                          isActive ? 'rotate-180' : ''
                        }`} />
                      </button>

                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t"
                          >
                            <div className="px-6 py-4 text-gray-600">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;