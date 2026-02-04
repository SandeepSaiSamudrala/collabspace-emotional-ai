// src/components/TalkAIModal.jsx

import { useState } from "react";
import { Bot, X, Sparkles } from "lucide-react";
import useMoodStore from "../../store/MoodStore";
import getTalkAIResponse from "../../services/talkAIService";
import analyzeSentiment from "../../services/sentimentService";

export default function TalkAIModal({ onClose }) {
  const { currentMood } = useMoodStore();

  // AI response state
  const [response, setResponse] = useState(() =>
    getTalkAIResponse({
      mood: currentMood?.mood,
      stress: 50,
      energy: 60,
      stability: 70,
      step: "start",
    })
  );

  // Sentiment result state
  const [sentimentResult, setSentimentResult] = useState(null);

  // Handle option click
  const handleOption = async (optionId) => {
    const selectedOption = response.options.find((opt) => opt.id === optionId);
    if (!selectedOption) return;

   const textToAnalyze = "I feel sad and stressed today";
      console.log("Text sent to sentiment model:", textToAnalyze); // 🔥 LOG IT
      
    // Call Firebase function to get sentiment
    const sentiment = await analyzeSentiment(textToAnalyze);
    console.log("Raw sentiment from function:", sentiment);
    setSentimentResult(sentiment);

    // Get next AI response
    const next = getTalkAIResponse({
      mood: currentMood?.mood,
      stress: 50,
      energy: 60,
      stability: 70,
      step: "respond",
      userChoice: optionId,
    });
    setResponse(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-[420px] rounded-3xl bg-[#0f1b2a]/95 border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-400 to-cyan-400">
              <Bot size={18} className="text-white" />
            </div>
            <div className="text-white font-semibold flex items-center gap-1">
              Talk to AI <Sparkles size={14} className="text-cyan-300" />
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* AI message bubble */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-gray-200 text-sm leading-relaxed">
            {response.message}
          </div>

          {/* Sentiment result */}
          {sentimentResult && (
            <div className="text-sm text-yellow-300 bg-yellow-500/10 border border-yellow-400/20 rounded-xl px-3 py-2">
              📝 Sentiment: {sentimentResult.label} (
              {(sentimentResult.score * 100).toFixed(0)}%)
            </div>
          )}

          {/* Options */}
          {response.options && (
            <div className="space-y-2">
              {response.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleOption(opt.id)}
                  className="
                    w-full px-4 py-2.5 rounded-xl
                    bg-gradient-to-r from-white/5 to-white/10
                    border border-white/10
                    text-gray-100 text-sm
                    hover:from-indigo-500/20 hover:to-cyan-500/20
                    hover:border-cyan-400/30
                    transition
                  "
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Suggested action */}
          {response.action && (
            <div className="text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-400/20 rounded-xl px-3 py-2">
              💡 Suggested action: {response.action}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 text-xs text-gray-400 flex justify-between">
          <span>Emotion-aware • Private</span>
          <span>Rule-based AI</span>
        </div>
      </div>
    </div>
  );
}
