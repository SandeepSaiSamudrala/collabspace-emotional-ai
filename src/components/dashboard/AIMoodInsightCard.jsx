import { useState, useEffect } from "react";
import { Bot, Smile, MessageSquare } from "lucide-react";
import { auth } from "../../services/firebase";
import useMoodStore from "../../store/MoodStore";
import TalkAIModal from "./TalkAIModal";

// Constants for mood scoring
const MOOD_WEIGHTS = {
  happy: 90,
  neutral: 60,
  tired: 50,
  sad: 40,
  stressed: 35,
  angry: 30,
  okay: 50,
};

// Simplified Mood Check-in Modal (can be moved to its own file)
function MoodCheckInModal({ onClose }) {
  const { logMood } = useMoodStore.getState();

  const handleMoodLog = async (mood) => {
    if (auth.currentUser) {
      await logMood({ userId: auth.currentUser.uid, mood });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-[#0f1b2a] p-6 rounded-2xl border border-white/10 w-[340px]">
        <h3 className="text-lg font-semibold mb-4 text-gray-100">How are you feeling?</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { emoji: "😊", mood: "happy" },
            { emoji: "🙂", mood: "okay" },
            { emoji: "😔", mood: "sad" },
            { emoji: "😣", mood: "stressed" },
            { emoji: "😡", mood: "angry" },
            { emoji: "😴", mood: "tired" },
          ].map((m) => (
            <button
              key={m.mood}
              onClick={() => handleMoodLog(m.mood)}
              className="flex flex-col items-center p-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
            >
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-xs mt-1 text-gray-200 capitalize">{m.mood}</span>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 text-sm text-gray-400 hover:text-gray-200">
          Cancel
        </button>
      </div>
    </div>
  );
}


export default function AIMoodInsightCard() {
  const [showTalkAIModal, setShowTalkAIModal] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { currentMood, fetchMoodHistory, getMoodScore } = useMoodStore();
  const moodScore = getMoodScore();

  useEffect(() => {
    const user = auth.currentUser;
    if (user?.uid) {
      fetchMoodHistory(user.uid).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchMoodHistory]);

  const getQuickSummary = () => {
    if (moodScore > 70) return { text: "Your mood is stable and positive overall. Keep it up! 🤗", color: "text-green-300" };
    if (moodScore > 50) return { text: "Your mood seems balanced with mild fluctuations. A good day to reflect. 🤔", color: "text-yellow-300" };
    return { text: "Your mood shows signs of stress or fatigue. Remember to pause and breathe. 💙", color: "text-blue-300" };
  };

  const summary = getQuickSummary();

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-[#1A243B]/60 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg flex items-center justify-center">
        <p className="text-gray-400">Analyzing mood patterns...</p>
      </div>
    );
  }

  // Empty State: No mood logged yet
  if (!currentMood) {
    return (
      <>
        <div className="bg-[#1A243B]/60 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-[#25304A] p-2 rounded-xl">
              <Smile size={22} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-200 tracking-wide">Daily Insight</h2>
          </div>
          <p className="text-gray-300 text-sm mb-4">Log your mood to unlock your personalized AI emotional insight for today.</p>
          <button
            onClick={() => setShowMoodModal(true)}
            className="mt-4 w-full py-2 rounded-xl bg-blue-600/40 text-blue-200 hover:bg-blue-600/60 transition"
          >
            Log Your Mood
          </button>
        </div>
        {showMoodModal && <MoodCheckInModal onClose={() => setShowMoodModal(false)} />}
      </>
    );
  }

  // Main Insight Card
  return (
    <>
      <div className="bg-[#1A243B]/60 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-[#25304A] p-2 rounded-xl">
            <Bot size={22} className="text-blue-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-200 tracking-wide">
            Today's AI Insight
          </h2>
        </div>

        {/* Subtitle */}
        <p className="text-gray-300 text-sm mb-4">
          Based on your recent emotional patterns, here's a thought for you.
        </p>

        {/* Main Insight */}
        <div className="bg-[#25304A]/60 p-4 rounded-xl border border-white/10 shadow-inner">
          <p className={`text-[15px] leading-relaxed ${summary.color}`}>
            {summary.text}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowTalkAIModal(true)}
          className="mt-4 w-full py-2 rounded-xl bg-blue-600/40 text-blue-200 hover:bg-blue-600/60 transition flex items-center justify-center gap-2"
        >
          <MessageSquare size={16} />
          Talk to AI
        </button>
      </div>

      {showTalkAIModal && <TalkAIModal onClose={() => setShowTalkAIModal(false)} />}
    </>
  );
}
