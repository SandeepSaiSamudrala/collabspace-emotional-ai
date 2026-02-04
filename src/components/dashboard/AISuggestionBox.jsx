// FloatingAICard.jsx
import { Bot, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import useMoodStore from "../../store/MoodStore";
import  getAISuggestions  from "../../services/aiService";
import TalkAIModal from "./TalkAIModal";
export default function FloatingAICard() {
  const [open, setOpen] = useState(true);
  const [fade, setFade] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const { saveTip } = useMoodStore();
  useEffect(() => {
  const openAI = () => {
    console.log("OPEN AI EVENT RECEIVED");
    setShowAI(true);
  };

  window.addEventListener("open-ai", openAI);
  return () => window.removeEventListener("open-ai", openAI);
}, []);
  const { currentMood, getMoodScore, moodHistory } = useMoodStore();

  // Handle early exit
  if (!currentMood || !open) return null;

  const moodScore = getMoodScore();
  const energy = currentMood.energy ?? moodScore + 10;
  const stress = Math.max(0, 100 - moodScore);
  const stability = moodHistory.length >= 7 ? 80 : 60;

  const suggestions = getAISuggestions({
    mood: currentMood.mood,
    energy,
    stress,
    stability,
  });

  // Dynamic styling per mood
  const moodStyles = {
    happy: { from: "from-yellow-400", to: "to-pink-400", emoji: "😄" },
    sad: { from: "from-blue-400", to: "to-indigo-500", emoji: "😢" },
    stressed: { from: "from-red-400", to: "to-orange-500", emoji: "😫" },
    tired: { from: "from-gray-400", to: "to-gray-600", emoji: "😴" },
    okay: { from: "from-green-400", to: "to-cyan-500", emoji: "🙂" },
    angry: { from: "from-red-500", to: "to-purple-500", emoji: "😡" },
  };

  const style = moodStyles[currentMood.mood] || moodStyles.okay;

  // Handle fade close
  const handleClose = () => {
    setFade(true);
    setTimeout(() => setOpen(false), 300);
  };

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50 w-80
        bg-[#0f1b2a]/90 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl
        transition-all duration-300
        ${fade ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}
        before:absolute before:inset-0 before:rounded-2xl before:blur-xl
        before:bg-gradient-to-br before:${style.from} before:${style.to} before:-z-10 before:opacity-20
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg bg-gradient-to-br ${style.from} ${style.to}`}
          >
            <Bot size={18} className="text-white" />
          </div>
          <span className="font-medium text-white flex items-center gap-1">
            {style.emoji} AI Emotional Insight
          </span>
        </div>

        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {suggestions.length === 0 ? (
          <div className="p-3 text-sm text-gray-300">
            No suggestions yet. Log your mood regularly to get insights.
          </div>
        ) : (
          suggestions.map((s, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-white/5 border border-white/8"
            >
              <div className="text-sm font-medium text-white">{s.title}</div>
              <div className="text-xs text-gray-300 mt-1">{s.message}</div>
              <div className="text-xs text-blue-300 mt-2">{s.action}</div>
            </div>
          ))
        )}
      </div>

      {/* Action buttons */}
      <div className="p-4 flex gap-2">
        <button
          onClick={() => setShowAI(true)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition"
        >
          Ask AI
        </button>
        <button
           onClick={() => saveTip(suggestions[0])}
          className="flex-1 bg-white/10 hover:bg-white/20 text-gray-200 py-2 rounded-xl transition"
        >
          Save Tip
        </button>
      </div>
      {showAI && <TalkAIModal onClose={() => setShowAI(false)} />}
    </div>
  );
}
