import React, { useState, useEffect } from 'react';
import { User, Trophy, Flame, TreePine, Globe } from 'lucide-react';
import { clsx } from 'clsx';

export default function Profile() {
  const [stats, setStats] = useState({
    xp: 0,
    wordsLearned: 0,
    languagesExplored: 0,
    streak: 3 // Mock streak for MVP
  });
  const [username, setUsername] = useState('Explorer');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load username from local storage
    const savedName = localStorage.getItem('wordquest_username');
    if (savedName) setUsername(savedName);

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/trees');
      const trees = await res.json();
      
      let totalXp = 0;
      let languages = new Set<string>();
      
      for (const tree of trees) {
        totalXp += tree.xp;
        
        // Fetch nodes to find languages
        const nRes = await fetch(`/api/trees/${tree.id}`);
        const tData = await nRes.json();
        const translations = tData.nodes.filter((n: any) => n.type === 'translation');
        translations.forEach((t: any) => {
          try {
            if (t.meta) languages.add(JSON.parse(t.meta).language);
          } catch (e) {}
        });
      }

      setStats({
        xp: totalXp,
        wordsLearned: trees.length,
        languagesExplored: languages.size,
        streak: 3
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = () => {
    localStorage.setItem('wordquest_username', username);
    setIsEditing(false);
  };

  if (loading) return <div className="p-6 text-[#8892b0] text-center">Loading profile...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto pb-32">
      <header className="mb-12 flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#64ffda] to-[#0a192f] flex items-center justify-center border-4 border-[#112240] shadow-[0_0_30px_rgba(100,255,218,0.2)]">
          <User size={48} className="text-[#0a192f]" />
        </div>
        
        <div>
          {isEditing ? (
            <div className="flex gap-2 items-center mb-2">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-[#112240] border border-[#233554] rounded px-3 py-1 text-white focus:outline-none focus:border-[#64ffda]"
                autoFocus
              />
              <button onClick={handleSaveName} className="text-[#64ffda] text-sm font-bold uppercase tracking-wider hover:underline">Save</button>
            </div>
          ) : (
            <div className="flex gap-4 items-center mb-2">
              <h1 className="text-4xl font-bold text-white">{username}</h1>
              <button onClick={() => setIsEditing(true)} className="text-[#8892b0] text-sm hover:text-[#64ffda] transition-colors">Edit</button>
            </div>
          )}
          <p className="text-[#8892b0] flex items-center gap-2">
            <Trophy size={16} className="text-[#fcd34d]" /> Level {Math.floor(stats.xp / 500) + 1} Explorer
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-12">
        <StatBox 
          icon={<Trophy size={24} className="text-[#fcd34d]" />}
          label="Total XP"
          value={stats.xp.toString()}
          color="border-[#fcd34d]/30"
        />
        <StatBox 
          icon={<Flame size={24} className="text-[#ff6b6b]" />}
          label="Day Streak"
          value={stats.streak.toString()}
          color="border-[#ff6b6b]/30"
        />
        <StatBox 
          icon={<TreePine size={24} className="text-[#10b981]" />}
          label="Words Learned"
          value={stats.wordsLearned.toString()}
          color="border-[#10b981]/30"
        />
        <StatBox 
          icon={<Globe size={24} className="text-[#60a5fa]" />}
          label="Languages"
          value={stats.languagesExplored.toString()}
          color="border-[#60a5fa]/30"
        />
      </div>

      <div className="bg-[#112240] border border-[#233554] rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Achievements</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-[#0a192f] rounded-lg border border-[#233554]">
            <div className="w-12 h-12 rounded-full bg-[#64ffda]/20 flex items-center justify-center border border-[#64ffda]/50">
              <TreePine size={24} className="text-[#64ffda]" />
            </div>
            <div>
              <h3 className="font-bold text-white">First Sprout</h3>
              <p className="text-sm text-[#8892b0]">Planted your first word tree.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-[#0a192f] rounded-lg border border-[#233554] opacity-50 grayscale">
            <div className="w-12 h-12 rounded-full bg-[#fcd34d]/20 flex items-center justify-center border border-[#fcd34d]/50">
              <Globe size={24} className="text-[#fcd34d]" />
            </div>
            <div>
              <h3 className="font-bold text-white">Polyglot</h3>
              <p className="text-sm text-[#8892b0]">Explore 3 different languages. (Locked)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className={clsx("bg-[#112240] border rounded-xl p-6 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1", color)}>
      <div className="mb-3">{icon}</div>
      <div className="text-3xl font-bold text-white mb-1 font-mono">{value}</div>
      <div className="text-xs text-[#8892b0] uppercase tracking-wider font-bold">{label}</div>
    </div>
  );
}
