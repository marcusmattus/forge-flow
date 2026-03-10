import { useState, useEffect } from 'react';
import { Globe, BookOpen } from 'lucide-react';

export default function LanguageMap() {
  const [trees, setTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrees();
  }, []);

  const fetchTrees = async () => {
    try {
      // Fetch all trees, then fetch their nodes to find translations
      const res = await fetch('/api/trees');
      const data = await res.json();
      
      const detailedTrees = await Promise.all(
        data.map(async (t: any) => {
          const nRes = await fetch(`/api/trees/${t.id}`);
          return nRes.json();
        })
      );
      
      setTrees(detailedTrees);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-[#8892b0] text-center">Loading map...</div>;

  // Group translations by language
  const translationsByLang: Record<string, any[]> = {};
  
  trees.forEach(tree => {
    const translations = tree.nodes.filter((n: any) => n.type === 'translation');
    translations.forEach((t: any) => {
      let lang = 'unknown';
      try {
        if (t.meta) lang = JSON.parse(t.meta).language;
      } catch (e) {}
      
      if (!translationsByLang[lang]) translationsByLang[lang] = [];
      translationsByLang[lang].push({
        root: tree.root_word,
        translation: t.value,
        treeId: tree.id
      });
    });
  });

  const langNames: Record<string, string> = {
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    ja: 'Japanese',
    unknown: 'Other'
  };

  return (
    <div className="p-6 max-w-3xl mx-auto pb-32">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#ccd6f6] tracking-tight flex items-center gap-3">
          <Globe className="text-[#64ffda]" size={32} /> Language Map
        </h1>
        <p className="text-[#8892b0] text-sm mt-2">Explore your vocabulary across different languages.</p>
      </header>

      {Object.keys(translationsByLang).length === 0 ? (
        <div className="text-center text-[#8892b0] py-16 border border-dashed border-[#233554] rounded-xl">
          <Globe size={48} className="mx-auto mb-4 opacity-50" />
          <p>No translations added yet. Add some in the Tree Builder!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(translationsByLang).map(([lang, items]) => (
            <div key={lang} className="bg-[#112240] border border-[#233554] rounded-xl overflow-hidden">
              <div className="bg-[#233554]/50 px-6 py-4 border-b border-[#233554] flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {langNames[lang] || lang}
                </h2>
                <span className="bg-[#0a192f] text-[#64ffda] text-xs px-3 py-1 rounded-full font-mono border border-[#64ffda]/30">
                  {items.length} words
                </span>
              </div>
              
              <div className="p-6 grid gap-4 sm:grid-cols-2">
                {items.map((item, i) => (
                  <div key={i} className="bg-[#0a192f] border border-[#233554] p-4 rounded-lg flex flex-col justify-between group hover:border-[#64ffda]/50 transition-colors">
                    <div className="mb-2">
                      <span className="text-xs text-[#8892b0] uppercase tracking-wider font-bold mb-1 block">English</span>
                      <span className="text-white font-medium capitalize">{item.root}</span>
                    </div>
                    <div>
                      <span className="text-xs text-[#64ffda] uppercase tracking-wider font-bold mb-1 block">{langNames[lang] || lang}</span>
                      <span className="text-[#ccd6f6] font-medium">{item.translation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
