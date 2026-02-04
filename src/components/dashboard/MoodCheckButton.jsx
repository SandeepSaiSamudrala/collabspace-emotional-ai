import { useState, useEffect } from "react";
import useMoodStore from "../../store/MoodStore";

import { auth } from "../../services/firebase";

import { createNotification } from "../../services/firestoreServices";
export default function MoodCheckButton() {
  const [open, setOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const { logMood } = useMoodStore();

  const moods = [
    { emoji: "😊", label: "Happy" },
    { emoji: "🙂", label: "Okay" },
    { emoji: "😔", label: "Sad" },
    { emoji: "😣", label: "Stressed" },
    { emoji: "😡", label: "Angry" },
    { emoji: "😴", label: "Tired" },
  ];

  const handleSelect = async (mood) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        // Save to Firebase
        await logMood({
  userId: user.uid,
  mood: mood.label.toLowerCase(), // happy | sad | stressed etc
  energy: null,
  note: "Dashboard quick check-in",
});

        setSelectedMood(mood);
        setOpen(false);
        // ✅ ADD NOTIFICATION
      await createNotification({
        userId: user.uid,
        type: 'mood',
        title: 'Mood updated',
        body: `Your mood has been set to ${mood.label} ${mood.emoji}`,
        actor: 'You',
        icon: 'deploy'
      });
      
        console.log("Mood updated successfully:", mood);
        //later send to AI analysis
      }
    } catch (error) {
      console.error("Error updating mood:", error);
      alert("Failed to update mood");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mt-6 w-64">
      {/* Main Button */}
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="
          px-5 py-3 
          bg-white/10 
          backdrop-blur-xl 
          text-gray-200 
          rounded-xl 
          border border-white/10
          hover:bg-white/20 
          transition 
          flex items-center gap-2
          disabled:opacity-50
        "
      >
        <span className="text-xl">
          {selectedMood ? selectedMood.emoji : "✨"}
        </span>
        <span>
          {loading 
            ? "Updating..." 
            : selectedMood 
            ? selectedMood.label 
            : "How are you feeling?"}
        </span>
      </button>

      {/* Emoji Picker Popup */}
      {open && (
        <div
          className="
            absolute mt-3 p-4 
            bg-white/10 
            backdrop-blur-xl 
            rounded-2xl 
            border border-white/20 
            shadow-xl 
            grid grid-cols-3 gap-3 
            z-20
          "
        >
          {moods.map((m) => (
            <button
              key={m.label}
              onClick={() => handleSelect(m)}
              disabled={loading}
              className="
                flex flex-col items-center 
                text-gray-200 hover:scale-110 
                transition transform
                disabled:opacity-50
                p-2
              "
            >
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-xs mt-1 opacity-80">{m.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}