import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Dumbbell, Zap, Target, Shield, ArrowRight } from 'lucide-react';
import { Logo } from '../components/Logo';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-brand-black selection:bg-brand-yellow selection:text-brand-black overflow-x-hidden">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto border-b-4 border-brand-black">
        <Logo />
        <div className="flex gap-4 items-center">
          <Link to="/app" className="font-black uppercase tracking-widest text-sm hover:text-brand-pink transition-colors">Login</Link>
          <Link to="/app" className="neo-button text-sm py-2">Join the Forge</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-block bg-brand-pink text-white px-4 py-1 border-2 border-brand-black font-black uppercase tracking-widest text-sm italic"
          >
            Tactical Fitness Intelligence
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.85]"
          >
            Forge Your <br />
            <span className="text-brand-yellow stroke-black stroke-2">Legacy.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold uppercase tracking-tight max-w-xl leading-tight"
          >
            Computer vision rep tracking. GPS tactical mapping. AI nutrition analysis. No excuses. Just results.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <Link to="/app" className="neo-button-pink text-2xl py-6 px-12 flex items-center gap-4">
              Start Training <ArrowRight size={32} />
            </Link>
          </motion.div>
        </div>

        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="neo-container bg-brand-yellow aspect-square relative z-10 overflow-hidden"
          >
            <img 
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000" 
              className="w-full h-full object-cover grayscale contrast-125 mix-blend-multiply"
              alt="Training"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-8 left-8 right-8 neo-container bg-white p-6">
              <p className="font-black uppercase italic text-3xl">"Pain is temporary. Pride is forever."</p>
            </div>
          </motion.div>
          {/* Decorative background blocks */}
          <div className="absolute -top-8 -right-8 w-full h-full border-4 border-brand-black -z-10 bg-brand-pink" />
          <div className="absolute top-8 right-8 w-full h-full border-4 border-brand-black -z-20 bg-brand-black" />
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-brand-black text-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Zap size={40} />}
              title="Pose Tracking"
              desc="Real-time MediaPipe analysis ensures perfect form and counts every rep."
            />
            <FeatureCard 
              icon={<Target size={40} />}
              title="Tactical GPS"
              desc="Map your missions with precision. Track pace, elevation, and splits."
            />
            <FeatureCard 
              icon={<Shield size={40} />}
              title="AI Coaching"
              desc="Sgt. Major Gemini watches your every move and provides brutal feedback."
            />
            <FeatureCard 
              icon={<Dumbbell size={40} />}
              title="Nutrition Scan"
              desc="Scan your rations. Understand the impact on your next operation."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 border-4 border-white hover:bg-brand-yellow hover:text-brand-black transition-all group">
      <div className="mb-6 text-brand-yellow group-hover:text-brand-black">
        {icon}
      </div>
      <h3 className="text-2xl font-black uppercase italic mb-4">{title}</h3>
      <p className="font-bold uppercase tracking-widest text-sm opacity-70 leading-relaxed">{desc}</p>
    </div>
  );
}
