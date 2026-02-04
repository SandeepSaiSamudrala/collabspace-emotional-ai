import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth } from "../../services/firebase";
import useMoodStore from "../../store/MoodStore";
export default function QuickActions() {
  const navigate = useNavigate();
  const [showMoodModal, setShowMoodModal] = useState(false);
  const actions = [
    {
      name: "New Task",
      emoji: "📝",
      onClick: () => navigate("/tasks"),
    },
    {
      name: "Mood Check-in",
      emoji: "😊",
      onClick: () => setShowMoodModal(true)
    },
    {
      name: "Chat",
      emoji: "💬",
      onClick: () => navigate("/chat"),
    },
    {
      name: "AI Emotional Assistant",
      emoji: "✨",
      onClick: () =>navigate("/ai")
    },
  ];

  return (
    <div className="flex justify-center gap-4 mt-6 flex-wrap">
      {actions.map((action) => (
        <button
          key={action.name}
          onClick={action.onClick}
          className="
            flex items-center gap-2
            bg-white/5
            backdrop-blur-xl
            px-5 py-3
            rounded-xl
            border border-white/10
            shadow-[0_0_15px_rgba(0,0,0,0.3)]
            text-gray-200
            hover:bg-white/10
            transition-all
            hover:scale-[1.03]
            active:scale-[0.98]
          "
        >
          <span className="text-xl">{action.emoji}</span>
          <span className="font-medium">{action.name}</span>
        </button>
      ))}
         {showMoodModal && (
  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
    <div className="bg-[#0f1b2a] p-6 rounded-2xl border border-white/10 w-[340px]">
      <h3 className="text-lg font-semibold mb-4">
        How are you feeling?
      </h3>

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
            onClick={async () => {
              if (!auth.currentUser) return;

              await useMoodStore.getState().logMood({
                userId: auth.currentUser.uid,
                mood: m.mood,
              });

              setShowMoodModal(false);
            }}
            className="flex flex-col items-center p-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            <span className="text-3xl">{m.emoji}</span>
            <span className="text-xs mt-1 text-gray-200 capitalize">
              {m.mood}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowMoodModal(false)}
        className="mt-4 text-sm text-gray-400 hover:text-gray-200"
      >
        Cancel
      </button>
    </div>
  </div>
)}
    </div>
    
  );
}
