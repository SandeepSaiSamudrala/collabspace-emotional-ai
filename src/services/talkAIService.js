// services/talkAIService.js

export default function getTalkAIResponse({
  mood,
  stress,
  energy,
  stability,
  step = "start",
  userChoice = null,
}) {
  /* -----------------------------
     STEP 1: ENTRY RESPONSE
  ------------------------------*/
  if (step === "start") {
    // High stress overrides everything
    if (stress>= 70) {
      return {
        message:
          "I’m sensing elevated stress levels right now. Let’s slow things down together.",
        options: [
          { id: "breathe", label: "Calm my mind" },
          { id: "analyze", label: "Understand the cause" },
          { id: "advice", label: "Give me quick advice" },
        ],
      };
    }

    if (mood === "sad") {
      return {
        message:
          "It looks like you’re feeling emotionally low. You don’t have to go through it alone.",
        options: [
          { id: "support", label: "I need encouragement" },
          { id: "reflect", label: "Let me reflect quietly" },
        ],
      };
    }

    if (mood === "tired" || energy < 40) {
      return {
        message:
          "Your energy seems low. Pushing too hard right now may not help.",
        options: [
          { id: "rest", label: "Recover my energy" },
          { id: "light", label: "Do something light" },
        ],
      };
    }

    if (mood === "happy") {
      return {
        message:
          "You’re in a positive emotional state today. That’s great to see.",
        options: [
          { id: "maintain", label: "Maintain this mood" },
          { id: "reflect", label: "Understand what helped" },
        ],
      };
    }

    // Default neutral state
    return {
      message: "How would you like support right now?",
      options: [
        { id: "checkin", label: "Understand my emotions" },
        { id: "advice", label: "Get guidance" },
      ],
    };
  }

  /* -----------------------------
     STEP 2: USER RESPONSE HANDLING
  ------------------------------*/
  if (step === "respond") {
    switch (userChoice) {
      case "breathe":
        return {
          message:
            "Let’s do a short grounding exercise. Inhale for 4 seconds, hold for 2, exhale for 6. Repeat 3 times.",
          action: "Start breathing exercise",
        };

      case "analyze":
        return {
          message:
            "Stress often comes from overload. Which area feels heavier right now?",
          options: [
            { id: "work", label: "Work or tasks" },
            { id: "emotional", label: "Emotional / personal" },
          ],
        };

      case "work":
        return {
          message:
            "Try reducing your task list to just one priority. Completion matters more than volume.",
          action: "Focus on one task only",
        };

      case "emotional":
        return {
          message:
            "Emotional stress needs space, not force. A short pause can help you reset.",
          action: "Take a short emotional break",
        };

      case "support":
        return {
          message:
            "This phase does not define you. Emotional lows pass, especially when you’re gentle with yourself.",
          action: "Do one comforting activity",
        };

      case "reflect":
        return {
          message:
            "Reflection helps build awareness. Ask yourself: what affected my mood most today?",
          action: "Journal for 5 minutes",
        };

      case "rest":
        return {
          message:
            "Rest is productive when energy is low. Even a short break can restore balance.",
          action: "Step away from screens",
        };

      case "light":
        return {
          message:
            "Choose a light, low-effort activity to avoid draining yourself further.",
          action: "Stretch or take a short walk",
        };

      case "maintain":
        return {
          message:
            "To maintain a good mood, avoid over-committing. Protect your energy.",
          action: "Keep your schedule light",
        };

      case "advice":
        return {
          message:
            "You don’t need to solve everything today. Progress comes from consistency, not pressure.",
          action: "Lower expectations for today",
        };

      case "checkin":
        return {
          message:
            "Your emotional state is valid. Awareness itself is a strong first step.",
          action: "Acknowledge how you feel",
        };

      default:
        return {
          message:
            "I’m here with you. Take things one step at a time.",
        };
    }
  }

  /* -----------------------------
     FALLBACK
  ------------------------------*/
  return {
    message: "I’m here whenever you need support.",
  };
}
