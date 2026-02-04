// services/aiService.js

export default function getAISuggestions({
  mood,
  energy,
  stress,
  stability,
}) {
  const suggestions = [];

  // Primary mood-based suggestions
  if (mood === "happy") {
    suggestions.push({
      title: "Maintain Momentum 😊",
      message: "You’re emotionally positive today. Reinforce what’s working and avoid overloading yourself.",
      action: "Reflect on what helped your mood",
    });
  }

  if (mood === "sad") {
    suggestions.push({
      title: "Emotional Recovery 🌧️",
      message: "You seem emotionally low today. Slow down and allow space for recovery.",
      action: "Try journaling or talking to someone you trust",
    });
  }
    if (mood === "okay") {
    suggestions.push({
      title: "Gentle Check-in",
      message: "You’re feeling okay — not high, not low. Small positive actions can lift your day.",
      action: "Do one small thing you enjoy",
    });
  }
     if (mood === "angry ") {
    suggestions.push({
      title: "Cooling Down",
      message: "Anger often signals unmet needs or boundaries being crossed.",
      action: "Pause before reacting and take slow breaths",
    });
  }
    
  if (mood === "stressed") {
    suggestions.push({
      title: "Stress Relief",
      message: "Stress levels are elevated. A short pause can prevent burnout.",
      action: "Take 2–3 minutes for deep breathing",
    });
  }

  if (mood === "tired") {
    suggestions.push({
      title: "Energy Reset ",
      message: "Your energy is low today. Rest is not weakness — it’s maintenance.",
      action: "Step away from screens for a few minutes",
    });
  }

  // Secondary signals
  if (energy < 40) {
    suggestions.push({
      title: "Low Energy Detected",
      message: "Energy is below optimal levels. Avoid demanding tasks right now.",
      action: "Do a light task or take a short walk",
    });
  }

  if (stress > 70) {
    suggestions.push({
      title: "High Stress Warning",
      message: "Sustained stress can affect emotional balance.",
      action: "Reduce task load if possible today",
    });
  }

  if (stability < 50) {
    suggestions.push({
      title: "Emotional Fluctuation",
      message: "Your mood has been fluctuating recently.",
      action: "Establish a simple daily routine",
    });
  }

  // Return only top 2 suggestions
  return suggestions.slice(0, 2);
}
