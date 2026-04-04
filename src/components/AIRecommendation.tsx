import { useState } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { Sparkles, Loader2, Car as CarIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Car } from "../types";
import CarCard from "./CarCard";

interface AIRecommendationProps {
  allCars: Car[];
}

export default function AIRecommendation({ allCars }: AIRecommendationProps) {
  const [prompt, setPrompt] = useState("");
  const [recommendations, setRecommendations] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRecommend = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setRecommendations([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      const carListString = allCars.map(c => `${c.id}: ${c.brand} ${c.name} (${c.type}) - ${c.description}`).join("\n");

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on the user's request: "${prompt}", recommend exactly 2-3 car IDs from the following list that best match their needs. Return ONLY a JSON array of IDs.
        
        Available Cars:
        ${carListString}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      const recommendedIds = JSON.parse(response.text || "[]");
      const matchedCars = allCars.filter(c => recommendedIds.includes(c.id));
      setRecommendations(matchedCars);
      
      if (matchedCars.length === 0) {
        setError("I couldn't find a perfect match, but here are some of our best vehicles.");
      }
    } catch (err) {
      console.error("AI Error:", err);
      setError("Failed to get AI recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="bg-gradient-to-br from-blue-600/20 to-transparent p-12 rounded-[40px] border border-white/5 space-y-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-32 h-32 text-blue-500" />
        </div>
        
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-xs">
            <Sparkles className="w-4 h-4" />
            AI-Powered Assistant
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-white">
            FIND YOUR <span className="text-blue-500">PERFECT MATCH</span>
          </h2>
          <p className="text-gray-400 max-w-xl">
            Tell our AI what you're looking for (e.g., "I need a fast car for a weekend in the mountains" or "Something elegant for a wedding") and we'll find it for you.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRecommend()}
            placeholder="Describe your ideal driving experience..."
            className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={handleRecommend}
            disabled={loading}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Get Recommendations
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(recommendations.length > 0 || error) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10"></div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">AI Recommendations</h3>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            {error && <p className="text-center text-gray-500 italic">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendations.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
