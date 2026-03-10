import React from 'react';
import { User, Trophy, Flame, Activity, Settings, LogOut } from 'lucide-react';
import { clsx } from 'clsx';

export default function Profile() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32 neo-container bg-brand-yellow flex items-center justify-center overflow-hidden">
          <User size={80} className="text-brand-black" />
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">Marcus <span className="text-brand-pink">Aurelius</span></h1>
          <p className="text-xl font-bold uppercase tracking-widest text-gray-500">Rank: Elite Operator • Level 42</p>
          <div className="flex gap-4 mt-4 justify-center md:justify-start">
            <button className="neo-button text-xs py-2">Edit Profile</button>
            <button className="neo-button bg-white text-xs py-2"><Settings size={16} /></button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatBox label="Total Reps" value="12,450" icon={<Activity size={24} />} color="bg-white" />
        <StatBox label="Current Streak" value="14 Days" icon={<Flame size={24} />} color="bg-brand-yellow" />
        <StatBox label="Missions" value="156" icon={<Trophy size={24} />} color="bg-brand-pink" textColor="text-white" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Achievements */}
        <section className="neo-container p-6 bg-white">
          <h2 className="text-2xl font-black uppercase mb-6">Tactical Achievements</h2>
          <div className="grid grid-cols-2 gap-4">
            <Achievement icon="🥊" title="Speed Demon" desc="100 strikes in 60s" />
            <Achievement icon="🏋️" title="Power House" desc="500kg total volume" />
            <Achievement icon="🏃" title="Marathoner" desc="100 miles tracked" />
            <Achievement icon="🔥" title="Unstoppable" desc="30 day streak" />
          </div>
        </section>

        {/* Settings/Danger Zone */}
        <section className="space-y-6">
          <div className="neo-card">
            <h3 className="text-xl font-black uppercase mb-4">Account Settings</h3>
            <div className="space-y-2">
              <SettingItem label="Notifications" active />
              <SettingItem label="Public Profile" active />
              <SettingItem label="GPS High Precision" />
              <SettingItem label="Coach Voice (Brutal)" active />
            </div>
          </div>
          
          <button className="w-full neo-button bg-brand-black text-white py-4 flex items-center justify-center gap-2">
            <LogOut size={20} /> Terminate Session
          </button>
        </section>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon, color, textColor = "text-brand-black" }: { label: string; value: string; icon: React.ReactNode; color: string; textColor?: string }) {
  return (
    <div className={clsx("neo-card flex items-center justify-between", color, textColor)}>
      <div>
        <p className="text-xs font-black uppercase opacity-60">{label}</p>
        <p className="text-4xl font-black italic tracking-tighter">{value}</p>
      </div>
      <div className="p-3 border-2 border-brand-black bg-white text-brand-black">
        {icon}
      </div>
    </div>
  );
}

function Achievement({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="p-4 border-2 border-brand-black flex items-center gap-3">
      <span className="text-3xl">{icon}</span>
      <div>
        <h4 className="font-black uppercase text-sm">{title}</h4>
        <p className="text-[10px] font-bold text-gray-500 uppercase">{desc}</p>
      </div>
    </div>
  );
}

function SettingItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 border-2 border-brand-black">
      <span className="font-bold uppercase text-sm">{label}</span>
      <div className={clsx("w-10 h-6 border-2 border-brand-black p-1 transition-colors", active ? "bg-brand-yellow" : "bg-gray-200")}>
        <div className={clsx("w-3 h-full bg-brand-black transition-transform", active ? "translate-x-4" : "translate-x-0")} />
      </div>
    </div>
  );
}
