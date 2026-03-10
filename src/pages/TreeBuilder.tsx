import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, BookOpen, MessageSquare, Globe, Network, Type } from 'lucide-react';
import { clsx } from 'clsx';
import { LevelBadge } from './HomeForest';

export default function TreeBuilder() {
  const { id } = useParams();
  const [tree, setTree] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('definition');
  const [newValue, setNewValue] = useState('');
  const [metaValue, setMetaValue] = useState('');

  useEffect(() => {
    fetchTree();
  }, [id]);

  const fetchTree = async () => {
    try {
      const res = await fetch(`/api/trees/${id}`);
      const data = await res.json();
      setTree(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    try {
      const res = await fetch(`/api/trees/${id}/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          value: newValue.trim(),
          meta: activeTab === 'translation' ? { language: metaValue || 'es' } : null
        })
      });
      
      if (res.ok) {
        setNewValue('');
        setMetaValue('');
        fetchTree(); // Refresh to get new XP and level
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-6 text-[#8892b0] text-center">Loading tree...</div>;
  if (!tree) return <div className="p-6 text-red-500 text-center">Tree not found</div>;

  const nodesByType = tree.nodes.reduce((acc: any, node: any) => {
    if (!acc[node.type]) acc[node.type] = [];
    acc[node.type].push(node);
    return acc;
  }, {});

  const tabs = [
    { id: 'definition', label: 'Definition', icon: <BookOpen size={16} /> },
    { id: 'synonym', label: 'Synonyms', icon: <Type size={16} /> },
    { id: 'translation', label: 'Translation', icon: <Globe size={16} /> },
    { id: 'sentence', label: 'Sentences', icon: <MessageSquare size={16} /> },
    { id: 'concept', label: 'Concepts', icon: <Network size={16} /> },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto pb-32">
      <header className="mb-8">
        <Link to="/app" className="inline-flex items-center text-[#8892b0] hover:text-[#64ffda] mb-4 transition-colors text-sm font-medium uppercase tracking-widest">
          <ArrowLeft size={16} className="mr-2" /> Back to Forest
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-white capitalize mb-2">{tree.root_word}</h1>
            <div className="flex items-center gap-3">
              <LevelBadge level={tree.level} />
              <span className="text-[#8892b0] text-sm font-mono">{tree.xp} XP</span>
            </div>
          </div>
        </div>
      </header>

      {/* Graph Visualization (Simple) */}
      <div className="bg-[#112240] border border-[#233554] rounded-xl p-8 mb-8 relative overflow-hidden min-h-[300px] flex items-center justify-center">
        {/* Central Node */}
        <div className="absolute z-10 bg-[#0a192f] border-2 border-[#64ffda] text-[#64ffda] px-6 py-3 rounded-full font-bold text-xl shadow-[0_0_30px_rgba(100,255,218,0.2)]">
          {tree.root_word}
        </div>
        
        {/* Orbiting Nodes (CSS approximation) */}
        {tree.nodes.map((node: any, i: number) => {
          const angle = (i / tree.nodes.length) * Math.PI * 2;
          const radius = 120 + (i % 2) * 30; // Stagger radius
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          const colors: Record<string, string> = {
            definition: 'border-blue-400 text-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.2)]',
            synonym: 'border-green-400 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]',
            translation: 'border-purple-400 text-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.2)]',
            sentence: 'border-yellow-400 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]',
            concept: 'border-pink-400 text-pink-400 shadow-[0_0_15px_rgba(244,114,182,0.2)]',
          };

          return (
            <div 
              key={node.id}
              className={clsx(
                "absolute bg-[#0a192f] border px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap max-w-[150px] truncate transition-all duration-500 hover:z-20 hover:scale-110",
                colors[node.type] || 'border-gray-400 text-gray-400'
              )}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              title={node.value}
            >
              {node.value}
            </div>
          );
        })}
        
        {/* Connecting Lines (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <g transform="translate(50%, 50%)">
            {tree.nodes.map((node: any, i: number) => {
              const angle = (i / tree.nodes.length) * Math.PI * 2;
              const radius = 120 + (i % 2) * 30;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              return (
                <line 
                  key={`line-${node.id}`} 
                  x1="0" y1="0" x2={x} y2={y} 
                  stroke="#64ffda" 
                  strokeWidth="1" 
                  strokeDasharray="4 4"
                />
              );
            })}
          </g>
        </svg>
      </div>

      {/* Builder Controls */}
      <div className="bg-[#112240] border border-[#233554] rounded-xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-[#233554] scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors",
                activeTab === tab.id 
                  ? "text-[#64ffda] border-b-2 border-[#64ffda] bg-[#233554]/30" 
                  : "text-[#8892b0] hover:text-[#ccd6f6] hover:bg-[#233554]/10"
              )}
            >
              {tab.icon} {tab.label}
              <span className="ml-2 bg-[#0a192f] text-xs px-2 py-0.5 rounded-full border border-[#233554]">
                {nodesByType[tab.id]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6">
          <form onSubmit={handleAddNode} className="flex gap-4 mb-6">
            {activeTab === 'translation' && (
              <select 
                value={metaValue}
                onChange={(e) => setMetaValue(e.target.value)}
                className="bg-[#0a192f] border border-[#233554] rounded px-4 py-3 text-white focus:outline-none focus:border-[#64ffda]"
              >
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
              </select>
            )}
            <input 
              type="text" 
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={`Add a ${activeTab}...`}
              className="flex-1 bg-[#0a192f] border border-[#233554] rounded px-4 py-3 text-white placeholder-[#8892b0] focus:outline-none focus:border-[#64ffda] transition-colors"
            />
            <button 
              type="submit"
              disabled={!newValue.trim()}
              className="bg-[#64ffda] text-[#0a192f] px-6 py-3 rounded font-bold hover:bg-[#64ffda]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={20} /> Add
            </button>
          </form>

          <div className="space-y-3">
            {nodesByType[activeTab]?.length > 0 ? (
              nodesByType[activeTab].map((node: any) => (
                <div key={node.id} className="bg-[#0a192f] border border-[#233554] p-4 rounded-lg flex justify-between items-center group">
                  <div>
                    {node.meta && (
                      <span className="text-xs text-[#8892b0] uppercase tracking-wider font-bold mr-2">
                        [{JSON.parse(node.meta).language}]
                      </span>
                    )}
                    <span className="text-[#ccd6f6]">{node.value}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-[#8892b0] py-8 border border-dashed border-[#233554] rounded-lg">
                No {activeTab}s added yet. Add one to grow your tree!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
