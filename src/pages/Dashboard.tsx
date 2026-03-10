import React from 'react';
import { motion } from 'motion/react';
import { Flame, Trophy, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
            Welcome back, <span className="text-brand-pink">Soldier.</span>
          </h1>
          <p className="text-xl font-bold uppercase tracking-widest text-gray-500 mt-2">
            Day 14 Streak • 12,450 Reps Total
          </p>
        </div>
        <div className="flex gap-4">
          <div className="neo-container bg-brand-yellow p-4 flex items-center gap-3">
            <Flame className="text-brand-black" size={32} fill="currentColor" />
            <span className="text-2xl font-black italic">14</span>
          </div>
          <div className="neo-container bg-brand-pink p-4 flex items-center gap-3 text-white">
            <Trophy size={32} />
            <span className="text-2xl font-black italic">2.4k</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workout Modules */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp size={24} /> Training Modules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WorkoutCard 
                title="HIIT" 
                desc="High Intensity Interval Training. Burn fat, build lungs."
                color="bg-brand-yellow"
                to="/app/workout/hiit"
              />
              <WorkoutCard 
                title="Strength" 
                desc="Compound movements. Build raw power."
                color="bg-brand-pink"
                textColor="text-white"
                to="/app/workout/strength"
              />
              <WorkoutCard 
                title="Boxing" 
                desc="Striking speed and extension tracking."
                color="bg-white"
                to="/app/workout/boxing"
              />
              <WorkoutCard 
                title="MMA" 
                desc="Ground and pound. Full body conditioning."
                color="bg-brand-black"
                textColor="text-white"
                to="/app/workout/mma"
              />
            </div>
          </section>

          {/* Recent Activity */}
          <section className="neo-container p-6 bg-white">
            <h2 className="text-2xl font-black uppercase tracking-widest mb-6">Recent Missions</h2>
            <div className="space-y-4">
              <ActivityItem title="Boxing Session" date="Today, 08:30" reps="450 Strikes" intensity="High" />
              <ActivityItem title="HIIT Circuit" date="Yesterday, 17:45" reps="120 Squats" intensity="Extreme" />
              <ActivityItem title="Morning Run" date="2 days ago" reps="5.2 Miles" intensity="Medium" />
            </div>
          </section>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-8">
          <section className="neo-card bg-brand-yellow">
            <h3 className="text-xl font-black uppercase mb-4">Coach's Orders</h3>
            <p className="font-bold italic text-lg leading-tight">
              "Your squat depth was shallow on rep 8 yesterday. Fix it today or don't bother showing up."
            </p>
            <div className="mt-6 p-3 border-2 border-brand-black bg-white font-bold text-sm uppercase">
              - Sgt. Major Gemini
            </div>
          </section>

          <section className="neo-card">
            <h3 className="text-xl font-black uppercase mb-4">Nutrition Scan</h3>
            <div className="aspect-square bg-gray-100 border-4 border-brand-black border-dashed flex flex-col items-center justify-center text-center p-4">
              <Utensils size={48} className="mb-4" />
              <p className="font-bold uppercase tracking-widest text-sm">Scan your meal to see its impact</p>
              <Link to="/app/nutrition" className="mt-4 neo-button text-sm">Scan Now</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function WorkoutCard({ title, desc, color, textColor = "text-brand-black", to }: { title: string; desc: string; color: string; textColor?: string; to: string }) {
  return (
    <Link to={to} className={clsx("neo-card group", color, textColor)}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-3xl font-black uppercase italic tracking-tighter">{title}</h3>
        <ChevronRight className="group-hover:translate-x-2 transition-transform" size={32} />
      </div>
      <p className="font-bold text-sm uppercase tracking-wider opacity-80">{desc}</p>
    </Link>
  );
}

function ActivityItem({ title, date, reps, intensity }: { title: string; date: string; reps: string; intensity: string }) {
  return (
    <div className="flex items-center justify-between p-4 border-2 border-brand-black hover:bg-brand-yellow/10 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-black flex items-center justify-center text-white">
          <Clock size={24} />
        </div>
        <div>
          <h4 className="font-black uppercase text-lg">{title}</h4>
          <p className="text-xs font-bold text-gray-500 uppercase">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="font-black italic text-xl">{reps}</div>
        <div className="text-[10px] font-black uppercase px-2 py-0.5 bg-brand-black text-white inline-block">
          {intensity}
        </div>
      </div>
    </div>
  );
}

import { Utensils } from 'lucide-react';
import { clsx } from 'clsx';
