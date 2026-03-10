import { Link } from 'react-router-dom';
import React from 'react';
import { motion } from 'motion/react';
import { Leaf, Sword, Brain, Globe } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a192f] text-[#ccd6f6] font-sans selection:bg-[#64ffda] selection:text-[#0a192f]">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#64ffda] to-[#0a192f] flex items-center justify-center border-2 border-[#64ffda]">
            <span className="text-[#0a192f] font-bold text-xl">WQ</span>
          </div>
          <span className="text-2xl font-bold tracking-tighter text-white">Word-Quest</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/app" className="text-[#8892b0] hover:text-[#64ffda] transition-colors text-sm font-medium uppercase tracking-widest">Login</Link>
          <Link to="/app" className="bg-transparent border border-[#64ffda] text-[#64ffda] px-4 py-2 rounded text-sm font-medium hover:bg-[#64ffda]/10 transition-colors uppercase tracking-widest">Play Demo</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold text-white max-w-4xl leading-tight mb-6"
        >
          Grow your vocabulary into a <span className="text-[#64ffda]">living forest.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-[#8892b0] max-w-2xl mb-12"
        >
          Master languages through active recall, spaced repetition, and semantic network graphs. Turn words into trees, and trees into a forest of knowledge.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/app" className="bg-[#64ffda] text-[#0a192f] px-8 py-4 rounded font-bold text-lg hover:bg-[#64ffda]/90 transition-colors shadow-[0_0_20px_rgba(100,255,218,0.3)]">
            Start Your Quest
          </Link>
          <button className="bg-[#112240] text-[#ccd6f6] px-8 py-4 rounded font-bold text-lg hover:bg-[#233554] transition-colors border border-[#233554]">
            Download App (Coming Soon)
          </button>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 w-full text-left">
          <FeatureCard 
            icon={<Brain className="text-[#64ffda]" size={32} />}
            title="Active Recall"
            desc="Don't just read definitions. Write them. Build stronger neural pathways by actively retrieving information."
          />
          <FeatureCard 
            icon={<Leaf className="text-[#64ffda]" size={32} />}
            title="Spaced Repetition"
            desc="Our SM-2 algorithm ensures you review words right before you forget them, optimizing your learning time."
          />
          <FeatureCard 
            icon={<Globe className="text-[#64ffda]" size={32} />}
            title="Semantic Networks"
            desc="Connect synonyms, antonyms, and translations. Build a graph of meaning that mirrors how the brain actually learns."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-[#112240] p-8 rounded-xl border border-[#233554] hover:-translate-y-2 transition-transform duration-300">
      <div className="mb-6 bg-[#0a192f] w-16 h-16 rounded-lg flex items-center justify-center border border-[#233554]">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-[#8892b0] leading-relaxed">{desc}</p>
    </div>
  );
}
