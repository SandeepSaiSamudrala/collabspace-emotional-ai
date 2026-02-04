import { Smile } from "lucide-react";
import { useState } from "react";
import useMoodStore from "../../store/MoodStore";
import { auth } from "../../services/firebase";

/* -----------------------------------
   Internal Modal (same file, clean)
------------------------------------ */
function MoodCheckInModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-[#0f1b2a] p-6 rounded-2xl border border-white/10 w-[340px]">
        <h3 className="text-lg font-semibold mb-4 text-gray-100">
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

                onClose();
              }}
              className="flex flex-col items-center p-3 rounded-xl
                         bg-white/10 hover:bg-white/20 transition"
            >
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-xs mt-1 text-gray-200 capitalize">
                {m.mood}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-400 hover:text-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* -----------------------------------
   Mood Snapshot Card
------------------------------------ */
export default function MoodSnapshot() {
  const { currentMood } = useMoodStore();
  const [showMoodModal, setShowMoodModal] = useState(false);

  const moodEmojiMap = {
    happy: "😊",
    okay: "🙂",
    sad: "😔",
    stressed: "😣",
    angry: "😡",
    tired: "😴",
  };

  /* ---------- NO MOOD YET ---------- */
  if (!currentMood) {
    return (
      <div className="bg-[#1A243B]/60 border border-white/10 rounded-2xl p-5">
        <h4 className="text-sm text-gray-300 mb-2">Mood Snapshot</h4>
        <p className="text-gray-400 text-sm">
          No mood check-in yet today.
        </p>

        <button
          onClick={() => setShowMoodModal(true)}
          className="mt-3 px-4 py-2 rounded-xl
                     bg-blue-600/30 hover:bg-blue-600/50
                     text-blue-200 text-sm transition"
        >
          Check in now
        </button>

        {showMoodModal && (
          <MoodCheckInModal onClose={() => setShowMoodModal(false)} />
        )}
      </div>
    );
  }

  /* ---------- SNAPSHOT DATA ---------- */
  const emoji = moodEmojiMap[currentMood.mood] || "🙂";

  const time = currentMood.createdAt
    ? new Date(currentMood.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  /* ---------- UI ---------- */
  return (
    <div
      className="bg-gradient-to-br from-green-600/20 to-emerald-600/10
                 border border-white/10 rounded-2xl p-5 backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 mb-2">
        <Smile size={18} className="text-green-300" />
        <h4 className="text-sm text-gray-200">Mood Snapshot</h4>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-3xl">{emoji}</span>

        <div>
          <p className="text-gray-100 font-medium capitalize">
            {currentMood.mood}
          </p>
          <p className="text-xs text-gray-400">
            Last updated {time && `at ${time}`}
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowMoodModal(true)}
        className="mt-4 px-4 py-2 rounded-xl
                   bg-green-600/30 hover:bg-green-600/50
                   text-green-200 text-sm transition"
      >
        Check in again
      </button>

      {showMoodModal && (
        <MoodCheckInModal onClose={() => setShowMoodModal(false)} />
      )}
    </div>
  );
}
