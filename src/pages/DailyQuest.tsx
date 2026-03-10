import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sword, CheckCircle, XCircle, ArrowRight, Brain } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

export default function DailyQuest() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ score: number, message: string } | null>(null);
  const [sessionStats, setSessionStats] = useState({ xpEarned: 0, correct: 0, total: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDue();
  }, []);

  const fetchDue = async () => {
    try {
      const res = await fetch('/api/reviews/due');
      const data = await res.json();
      setPrompts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentPrompt = prompts[currentIndex];

  // Simple heuristic scoring
  const evaluateAnswer = (userAns: string, targetNodes: any[]) => {
    const normalizedAns = userAns.toLowerCase().trim();
    let bestScore = 0;

    for (const node of targetNodes) {
      const targetVal = node.value.toLowerCase().trim();
      if (normalizedAns === targetVal) {
        bestScore = 1;
        break;
      }
      // Simple keyword overlap
      const userWords = normalizedAns.split(' ');
      const targetWords = targetVal.split(' ');
      const overlap = userWords.filter(w => targetWords.includes(w)).length;
      const score = overlap / Math.max(userWords.length, targetWords.length);
      if (score > bestScore) bestScore = score;
    }

    // Boost score slightly for partial matches to be forgiving
    return Math.min(1, bestScore * 1.5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || feedback) return;

    const score = evaluateAnswer(answer, currentPrompt.targetNodes);
    
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treeId: currentPrompt.treeId,
          promptType: currentPrompt.promptType,
          userAnswer: answer,
          score
        })
      });
      const data = await res.json();
      
      setFeedback({
        score,
        message: score >= 0.8 ? 'Excellent!' : score >= 0.5 ? 'Close enough!' : 'Needs work.'
      });
      
      setSessionStats(prev => ({
        xpEarned: prev.xpEarned + data.xpEarned,
        correct: prev.correct + (score >= 0.6 ? 1 : 0),
        total: prev.total + 1
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNext = () => {
    setAnswer('');
    setFeedback(null);
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) return <div className="p-6 text-[#8892b0] text-center">Loading quest...</div>;

  if (prompts.length === 0 || currentIndex >= prompts.length) {
    return (
      <div className="p-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 bg-[#64ffda]/10 rounded-full flex items-center justify-center mb-6 border-2 border-[#64ffda] shadow-[0_0_30px_rgba(100,255,218,0.2)]">
          <CheckCircle size={48} className="text-[#64ffda]" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Quest Complete!</h1>
        <p className="text-[#8892b0] text-lg mb-8">You've reviewed all due words for today.</p>
        
        <div className="bg-[#112240] border border-[#233554] rounded-xl p-6 w-full max-w-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#8892b0] font-bold uppercase tracking-wider">XP Earned</span>
            <span className="text-[#64ffda] font-mono text-xl">+{sessionStats.xpEarned}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8892b0] font-bold uppercase tracking-wider">Accuracy</span>
            <span className="text-white font-mono text-xl">
              {sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0}%
            </span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/app')}
          className="bg-[#64ffda] text-[#0a192f] px-8 py-4 rounded font-bold text-lg hover:bg-[#64ffda]/90 transition-colors shadow-[0_0_20px_rgba(100,255,218,0.3)]"
        >
          Return to Forest
        </button>
      </div>
    );
  }

  const progress = (currentIndex / prompts.length) * 100;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sword className="text-[#64ffda]" /> Daily Quest
          </h1>
          <span className="text-[#8892b0] font-mono text-sm">
            {currentIndex + 1} / {prompts.length}
          </span>
        </div>
        <div className="w-full bg-[#112240] h-2 rounded-full overflow-hidden border border-[#233554]">
          <div 
            className="bg-[#64ffda] h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(100,255,218,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-[#112240] border border-[#233554] rounded-xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <span className="inline-block bg-[#233554] text-[#64ffda] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-[#64ffda]/30">
              {currentPrompt.promptType}
            </span>
            <h2 className="text-4xl font-bold text-white capitalize mb-2">{currentPrompt.rootWord}</h2>
            <p className="text-[#8892b0]">Provide a {currentPrompt.promptType} for this word.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={!!feedback}
              placeholder="Type your answer here..."
              className="w-full bg-[#0a192f] border-2 border-[#233554] rounded-xl p-4 text-white placeholder-[#8892b0] focus:outline-none focus:border-[#64ffda] transition-colors resize-none h-32 mb-6"
              autoFocus
            />

            {!feedback ? (
              <button 
                type="submit"
                disabled={!answer.trim()}
                className="w-full bg-[#64ffda] text-[#0a192f] px-6 py-4 rounded-xl font-bold text-lg hover:bg-[#64ffda]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(100,255,218,0.2)]"
              >
                <Brain size={20} /> Evaluate
              </button>
            ) : (
              <div className="space-y-6">
                <div className={clsx(
                  "p-4 rounded-xl border flex items-start gap-4",
                  feedback.score >= 0.8 ? "bg-green-900/20 border-green-500/50 text-green-400" :
                  feedback.score >= 0.5 ? "bg-yellow-900/20 border-yellow-500/50 text-yellow-400" :
                  "bg-red-900/20 border-red-500/50 text-red-400"
                )}>
                  {feedback.score >= 0.8 ? <CheckCircle className="shrink-0 mt-0.5" /> : <XCircle className="shrink-0 mt-0.5" />}
                  <div>
                    <h4 className="font-bold text-lg mb-1">{feedback.message}</h4>
                    <p className="text-sm opacity-80">Score: {Math.round(feedback.score * 100)}%</p>
                    
                    {/* Show correct answers if score is low */}
                    {feedback.score < 0.8 && (
                      <div className="mt-4 pt-4 border-t border-current/20">
                        <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Target Answers:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {currentPrompt.targetNodes.map((n: any) => (
                            <li key={n.id}>{n.value}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={handleNext}
                  type="button"
                  className="w-full bg-[#233554] text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-[#304770] transition-colors flex items-center justify-center gap-2 border border-[#64ffda]/30"
                >
                  Next Word <ArrowRight size={20} />
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
