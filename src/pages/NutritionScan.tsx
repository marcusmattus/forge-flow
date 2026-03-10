import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Camera, Upload, Utensils, Zap, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function NutritionScan() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeMeal = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          {
            parts: [
              { text: "Analyze this meal. Identify ingredients, estimate macros (Protein, Carbs, Fats in grams), and explain how this meal will impact a high-intensity workout scheduled for 1 hour from now. Return as JSON with keys: ingredients (array), macros (object with p, c, f), impact (string)." },
              { inlineData: { mimeType: "image/jpeg", data: base64Data } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || "{}");
      setAnalysis(result);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-5xl font-black uppercase italic tracking-tighter">
          Fuel <span className="text-brand-pink">Intelligence</span>
        </h1>
        <p className="text-lg font-bold uppercase tracking-widest text-gray-500">AI Nutrition Scan & Performance Impact</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="neo-container bg-white aspect-video relative overflow-hidden flex flex-col items-center justify-center p-8 text-center">
            {image ? (
              <img src={image} className="absolute inset-0 w-full h-full object-cover" alt="Meal" />
            ) : (
              <>
                <div className="w-20 h-20 bg-brand-yellow border-4 border-brand-black flex items-center justify-center mb-4">
                  <Camera size={40} />
                </div>
                <h3 className="text-xl font-black uppercase mb-2">Scan Your Rations</h3>
                <p className="text-sm font-bold uppercase tracking-widest opacity-60">Upload a photo of your meal for tactical analysis</p>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setImage(null)} 
              className="flex-1 neo-button bg-white"
              disabled={!image}
            >
              Reset
            </button>
            <button 
              onClick={analyzeMeal} 
              className="flex-1 neo-button-pink flex items-center justify-center gap-2"
              disabled={!image || isAnalyzing}
            >
              {isAnalyzing ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
              {isAnalyzing ? "Analyzing..." : "Analyze Meal"}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {!analysis ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="neo-card h-full flex flex-col items-center justify-center text-center p-12 opacity-50"
              >
                <Utensils size={64} className="mb-4" />
                <p className="font-black uppercase tracking-widest">Awaiting Data Input</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="space-y-6"
              >
                {/* Macros */}
                <div className="grid grid-cols-3 gap-4">
                  <MacroBox label="Protein" value={analysis.macros?.p} color="bg-brand-pink" textColor="text-white" />
                  <MacroBox label="Carbs" value={analysis.macros?.c} color="bg-brand-yellow" />
                  <MacroBox label="Fats" value={analysis.macros?.f} color="bg-white" />
                </div>

                {/* Ingredients */}
                <div className="neo-container bg-white p-6">
                  <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
                    <Info size={20} /> Identified Components
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.ingredients?.map((ing: string, i: number) => (
                      <span key={i} className="px-3 py-1 border-2 border-brand-black font-bold uppercase text-xs">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Impact */}
                <div className="neo-card bg-brand-black text-white">
                  <h3 className="text-xl font-black uppercase mb-4 text-brand-yellow">Tactical Impact</h3>
                  <p className="font-bold italic text-lg leading-tight">
                    "{analysis.impact}"
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function MacroBox({ label, value, color, textColor = "text-brand-black" }: { label: string, value: number, color: string, textColor?: string }) {
  return (
    <div className={`neo-container p-4 text-center ${color} ${textColor}`}>
      <p className="text-[10px] font-black uppercase opacity-80">{label}</p>
      <p className="text-3xl font-black italic tracking-tighter">{value}g</p>
    </div>
  );
}
