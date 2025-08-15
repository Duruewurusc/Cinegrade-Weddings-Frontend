import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const WeddingFAQ = () => {
  const faqData = [
    {
      id: 1,
      question: "Why should we choose you?",
      answer: "We specialize in creating bespoke wedding experiences that reflect your unique love story. With over 10 years in luxury wedding planning, we bring unparalleled attention to detail, creative vision, and seamless execution to ensure your day is absolutely perfect."
    },
    {
      id: 2,
      question: "How is your work different from others?",
      answer: "Our approach combines artistic vision with meticulous planning. We limit bookings to 12 weddings per year to ensure personalized service. Every wedding receives a dedicated team including a lead planner, designer, and coordinator who work exclusively on your event from concept to execution."
    },
    {
      id: 3,
      question: "Do you cover destination weddings?",
      answer: "Absolutely! We've planned weddings in 15+ countries and have established relationships with premium vendors worldwide. From beach ceremonies in Bali to castle weddings in France, we handle all logistics including travel arrangements, legal requirements, and local coordination."
    },
    {
      id: 4,
      question: "How many people will come for my wedding?",
      answer: "Our standard team includes 4 specialists (lead planner, assistant, designer, and day-of coordinator). For larger events (200+ guests), we add 2 additional coordinators. All team members arrive 6 hours before your ceremony and stay until the final farewell."
    },
    {
      id: 5,
      question: "How are your services priced?",
      answer: "We offer tiered packages starting at $5,000. Pricing is based on guest count, complexity, and services required. All-inclusive packages range from $12,000-$25,000. We provide transparent quotes with no hidden fees and offer flexible payment plans."
    },
    {
      id: 6,
      question: "What are your delivery timelines?",
      answer: "Initial concept presentation within 3 weeks of booking. Vendor selection finalized at 6 months. Final walkthrough 30 days prior. On your wedding day, we arrive early to oversee setup and manage all details until the last guest departs."
    }
  ];

  const [openId, setOpenId] = useState(1);

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#4d4946] mb-4">
          Frequently Asked Questions
        </h2>
        <div className="w-24 h-1 bg-[#d9b683] mx-auto"></div>
      </div>

      <div className="space-y-6">
        {faqData.map((item) => (
          <div 
            key={item.id}
            className="border-b border-[#e8d6b9] pb-6"
          >
            <button
              className="flex justify-between items-center w-full text-left"
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
            >
              <h3 className="text-lg md:text-xl font-medium text-[#363636] pr-4">
                {item.question}
              </h3>
              <span className="text-[#d9b683] flex-shrink-0 ml-2">
                {openId === item.id ? (
                  <FiChevronUp size={24} />
                ) : (
                  <FiChevronDown size={24} />
                )}
              </span>
            </button>

            {openId === item.id && (
              <div className="mt-4 pl-2">
                <p className="text-[#474747] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-[#1a1a1a] italic">
          Still have questions? 
          <a 
            href="#contact" 
            className="ml-2 text-[#d9b683] hover:underline font-medium"
          >
            Contact us directly
          </a>
        </p>
      </div>
    </div>
  );
};

export default WeddingFAQ;