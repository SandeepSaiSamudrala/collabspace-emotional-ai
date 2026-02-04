import { create } from "zustand";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Mood types we support
 * happy | neutral | sad | stressed | tired | angry
 */

const useMoodStore = create((set, get) => ({
  // --------------------
  // STATE
  // --------------------
  currentMood: null,        // latest mood object
  moodHistory: [], 
  savedTips: [],          // list of mood logs
  loading: false,
  error: null,

  // --------------------
  // ACTIONS
  // --------------------

  saveTip: (tip) =>
    set((state) => {
      if (state.savedTips.some((t) => t.message === tip.message)) {
        return state; // prevent duplicates
      }
      return {
        savedTips: [...state.savedTips, tip],
      };
    }),
    getLastSavedTip: () => {
  const tips = get().savedTips;
  return tips[tips.length - 1] || null;
},

  /**
   * Log a new mood
   */
  logMood: async ({ userId, mood, energy = null, note = "" }) => {
    try {
      set({ loading: true, error: null });

      const moodData = {
        userId,
        mood,                 // string
        energy,               // number (optional)
        note,                 // user note
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "moods"), moodData);

      const newMood = {
        id: docRef.id,
        ...moodData,
        createdAt: new Date(), // local fallback
      };

      set((state) => ({
        currentMood: newMood,
        moodHistory: [newMood, ...state.moodHistory],
        loading: false,
      }));
    } catch (err) {
      console.error("logMood error:", err);
      set({ error: err.message, loading: false });
    }
  },

  /**
   * Fetch mood history for user
   */
  fetchMoodHistory: async (userId, limitCount = 30) => {
    try {
      set({ loading: true, error: null });

      const q = query(
        collection(db, "moods"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const moods = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || null,
      }));

      set({
        moodHistory: moods.slice(0, limitCount),
        currentMood: moods[0] || null,
        loading: false,
      });
    } catch (err) {
      console.error("fetchMoodHistory error:", err);
      set({ error: err.message, loading: false });
    }
  },

  /**
   * Clear mood state (on logout)
   */
  clearMood: () => {
    set({
      currentMood: null,
      moodHistory: [],
      loading: false,
      error: null,
    });
  },

  // --------------------
  // DERIVED / HELPERS
  // --------------------

  /**
   * Get mood distribution (for charts)
   */
  getMoodStats: () => {
    const history = get().moodHistory;
    const stats = {};

    history.forEach((m) => {
      stats[m.mood] = (stats[m.mood] || 0) + 1;
    });

    return stats;
  },

  /**
   * Simple mood score (for AI & dashboard)
   */
  getMoodScore: () => {
    const weights = {
      happy: 90,
      neutral: 60,
      tired: 50,
      sad: 40,
      stressed: 35,
      angry: 30,
      okay:50
    };


    const history = get().moodHistory.slice(0, 7);
    if (history.length === 0) return 0;

    const total = history.reduce(
      (sum, m) => sum + (weights[m.mood] || 50),
      0
    );

    return Math.round(total / history.length);
  },
}));

export default useMoodStore;
