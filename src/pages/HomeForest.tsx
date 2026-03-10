import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Sword, TreePine, Clock, ChevronRight } from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';
import { clsx } from 'clsx';

export default function HomeForest() {
  const [trees, setTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWord, setNewWord] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrees();
  }, []);

  const fetchTrees = async () => {
    try {
      const res = await fetch('/api/trees');
      const data = await res.json();
      setTrees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    
    try {
      const res = await fetch('/api/trees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rootWord: newWord.trim() })
      });
      const data = await res.json();
      navigate(`/app/tree/${data.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const dueCount = trees.filter(t => isPast(new Date(t.next_review_at))).length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#ccd6f6] tracking-tight">My Forest</h1>
          <p className="text-[#8892b0] text-sm mt-1">{trees.length} words planted</p>
        </div>
        <Link 
          to="/app/quest"
          className="bg-[#64ffda] text-[#0a192f] px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-[#64ffda]/90 transition-colors shadow-[0_0_15px_rgba(100,255,218,0.2)]"
        >
          <Sword size={18} />
          <span>Daily Quest</span>
          {dueCount > 0 && (
            <span className="bg-[#0a192f] text-[#64ffda] text-xs px-2 py-0.5 rounded-full ml-1">
              {dueCount}
            </span>
          )}
        </Link>
      </header>

      {/* New Tree Form */}
      <form onSubmit={handleCreate} className="mb-8 flex gap-2">
        <input 
          type="text" 
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="Plant a new word..."
          className="flex-1 bg-[#112240] border border-[#233554] rounded px-4 py-3 text-white placeholder-[#8892b0] focus:outline-none focus:border-[#64ffda] transition-colors"
        />
        <button 
          type="submit"
          disabled={!newWord.trim() || isCreating}
          className="bg-[#233554] text-[#64ffda] px-4 py-3 rounded font-bold hover:bg-[#112240] border border-[#233554] hover:border-[#64ffda] transition-colors disabled:opacity-50"
        >
          <Plus size={24} />
        </button>
      </form>

      {/* Tree List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-[#8892b0] py-10">Loading forest...</div>
        ) : trees.length === 0 ? (
          <div className="text-center text-[#8892b0] py-10 border border-dashed border-[#233554] rounded-xl">
            <TreePine size={48} className="mx-auto mb-4 opacity-50" />
            <p>Your forest is empty. Plant your first word above.</p>
          </div>
        ) : (
          trees.map(tree => {
            const isDue = isPast(new Date(tree.next_review_at));
            return (
              <Link 
                key={tree.id} 
                to={`/app/tree/${tree.id}`}
                className="block bg-[#112240] border border-[#233554] hover:border-[#64ffda]/50 rounded-xl p-4 transition-all hover:-translate-y-1 group relative overflow-hidden"
              >
                {isDue && (
                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                    <div className="absolute top-0 right-0 bg-[#ff6b6b] text-white text-[10px] font-bold uppercase tracking-wider py-1 text-center w-24 transform rotate-45 translate-x-6 translate-y-2 shadow-md">
                      Due
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-white capitalize">{tree.root_word}</h3>
                      <LevelBadge level={tree.level} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#8892b0]">
                      <span className="flex items-center gap-1">
                        <TreePine size={14} /> {tree.nodeCount} nodes
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> 
                        {isDue ? 'Review now' : `Review in ${formatDistanceToNow(new Date(tree.next_review_at))}`}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="text-[#233554] group-hover:text-[#64ffda] transition-colors" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

export function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    seed: 'bg-[#8892b0]/20 text-[#8892b0]',
    sapling: 'bg-[#64ffda]/20 text-[#64ffda]',
    branching: 'bg-[#5eead4]/20 text-[#5eead4]',
    blooming: 'bg-[#fcd34d]/20 text-[#fcd34d]',
    forest: 'bg-[#10b981]/20 text-[#10b981]',
  };

  return (
    <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-current/20", colors[level] || colors.seed)}>
      {level}
    </span>
  );
}
