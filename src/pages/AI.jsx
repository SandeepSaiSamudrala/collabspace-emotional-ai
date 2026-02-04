// src/pages/EmotionalAI.jsx
import React, { useState, useMemo,useEffect } from "react";
import { auth } from "../services/firebase";
import useMoodStore from "../store/MoodStore";
import getAISuggestions from "../services/aiService";
import TalkAIModal from "../components/dashboard/TalkAIModal";

import {
  Bot,
  BarChart2,
  Heart,
  Clock,
  Zap,
  ChevronUp,
  SunMoon,
  Activity,
} from "lucide-react";

/**
 * EmotionalAI page - Hybrid (A+B+C) one-page scrolling layout
 * - Paste this file and import into your routes or render directly for now.
 * - UI only. No external chart libraries used.
 */

// ---------- REAL TREND + KPIs (Phase 1) ----------
const MOOD_WEIGHTS = {
  happy: 90,
  neutral: 60,
  tired: 50,
  sad: 40,
  stressed: 35,
  angry: 30,
  okay:50
};


function TrendChart({ data = [] }) {

  // simple SVG smooth path generator
  const w = 680;
  const h = 140;
  const padding = 20;
  const max = 100;
  const step = (w - padding * 2) / (data.length - 1);

  const points = data.map((v, i) => {
    const x = padding + i * step;
    const y = padding + (1 - v / max) * (h - padding * 2);
    return `${x},${y}`;
  });

  // simple bezier path builder
  const pathD = useMemo(() => {
    if (data.length === 0) return "";
    const coords = data.map((v, i) => {
      const x = padding + i * step;
      const y = padding + (1 - v / max) * (h - padding * 2);
      return { x, y };
    });

    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const cpx = (coords[i].x + coords[i + 1].x) / 2;
      d += ` Q ${cpx} ${coords[i].y} ${coords[i + 1].x} ${coords[i + 1].y}`;
    }
    return d;
  }, [data, h, padding, step, max]);

  // area path
  const areaD = useMemo(() => {
    if (!pathD) return "";
    const startX = padding;
    const endX = padding + (data.length - 1) * step;
    return `${pathD} L ${endX} ${h - padding} L ${startX} ${h - padding} Z`;
  }, [pathD, data.length, step, padding, h]);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      {/* shadowed area */}
      <defs>
        <linearGradient id="gradArea" x1="0" x2="1">
          <stop offset="0%" stopColor="#6EE7F5" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#C084FC" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="gradLine" x1="0" x2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feBlend in="SourceGraphic" in2="blur" mode="normal" />
        </filter>
      </defs>

      <path d={areaD} fill="url(#gradArea)" />

      <path
        d={pathD}
        stroke="url(#gradLine)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="filter"
      />

      {/* dots */}
      {data.map((v, i) => {
        const x = padding + i * step;
        const y = padding + (1 - v / max) * (h - padding * 2);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="4.5"
            fill="#0EA5E9"
            stroke="#ffffffa0"
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}

function KPI({ title, value, hint, icon: Icon, accent = "from-cyan-400 to-indigo-400" }) {
  return (
    <div className="bg-[#162133]/60 border border-white/8 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${accent} bg-opacity-10`}>
          <Icon className="text-white/90" size={20} />
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-300">{title}</div>
          <div className="text-2xl font-semibold text-white mt-1">{value}</div>
          {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
        </div>
      </div>
    </div>
  );
}

export default function AI() {


  const [selectedTab, setSelectedTab] = useState("overview");
  const [trendRange, setTrendRange] = useState("7d");
  const [showMoodModal, setShowMoodModal] = useState(false);
const [showAI, setShowAI] = useState(false);
  const {
  currentMood,
  moodHistory,
  fetchMoodHistory,
  getMoodScore,
} = useMoodStore();

// take last 7 mood entries (old → new)
const last7 = moodHistory.slice(0, 7).reverse();

// trend values (0–100)
const trendData = last7.map(
  (m) => MOOD_WEIGHTS[m.mood?.toLowerCase()] ?? 50
);


// average mood
const avgMood = trendData.length
  ? Math.round(trendData.reduce((a, b) => a + b, 0) / trendData.length)
  : 0;

// best & lowest day
const getScore = (m) => MOOD_WEIGHTS[m.mood] ?? 50;

const bestDay = last7.reduce(
  (best, cur) =>
    !best || getScore(cur) > getScore(best) ? cur : best,
  null
);

const lowDay = last7.reduce(
  (low, cur) =>
    !low || getScore(cur) < getScore(low) ? cur : low,
  null
);

const getWeekday = (date) => {
  if (!date) return "--";
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
  }).toUpperCase();
};


const user = auth.currentUser;

useEffect(() => {
  if (user?.uid) {
    fetchMoodHistory(user.uid);
  }
}, [user?.uid]);

  const moodScore = getMoodScore();

const energy =
  currentMood?.energy ?? Math.min(100, moodScore + 10);

const stress = Math.max(0, 100 - moodScore);


const stability =
  moodHistory.length >= 7 ? 78 : 60;
  const aiSuggestions = currentMood
  ? getAISuggestions({
      mood: currentMood.mood,
      energy,
      stress,
      stability,
    })
  : [];
const quickSummary =
  moodScore > 70
    ? "Your mood is stable and positive overall.🤗"
    : moodScore > 50
    ? "Your mood is balanced with mild fluctuations."
    : "Your mood shows signs of stress. Slow down if possible.";
const recentTriggers =
  stress > 60
    ? ["High workload", "Lack of breaks"]
    : energy < 40
    ? ["Poor rest", "Screen fatigue"]
    : ["Routine fluctuations"];

            const stabilityText =
          stability > 75
            ? "Your mood has been relatively steady recently."
            : "Your mood has shown fluctuations. Consistency may help.";
        const stressText =
          stress > 70
            ? "High stress detected. Consider reducing load today."
            : "Stress levels are manageable today.";
        const energyText =
          energy < 40
            ? "Energy is low. Rest is recommended."
            : "Energy levels are sufficient for light tasks.";

  return (
    <div className="w-full min-h-screen p-6 bg-cover bg-center bg-no-repeat bg-[url('/src/assets/images/emotionalAi.png')] text-gray-100">
      {/* HERO */}
      <section className="rounded-2xl p-6 mb-6 bg-gradient-to-r from-[#0f2130] via-[#0b1626] to-[#07101a] border border-white/20 shadow-lg">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#3EE7E7] to-[#C084FC] p-3 rounded-2xl shadow-[0_8px_30px_rgba(110,231,245,0.06)]">
              <Bot size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Emotional AI Insights</h1>
              <p className="text-sm text-gray-300 mt-1">
                Understand your emotional patterns & well-being — personalized, private, and human-first.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-300">Range</div>
            <div className="flex items-center gap-2 bg-white/6 p-1 rounded-lg">
              <button
                onClick={() => setTrendRange("7d")}
                className={`px-3 py-1 rounded-md text-sm ${trendRange === "7d" ? "bg-white/10" : "text-gray-300"}`}
              >
                7d
              </button>
              <button
                onClick={() => setTrendRange("30d")}
                className={`px-3 py-1 rounded-md text-sm ${trendRange === "30d" ? "bg-white/10" : "text-gray-300"}`}
              >
                30d
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ABOVE-THE-FOLD: AI SUMMARY + Quick KPIs */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* AI Summary Card */}
        <div className="lg:col-span-2 bg-[#122034]/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#60a5fa] to-[#c084fc]">
              <Heart size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Today’s Emotional Summary</h3>
                <div className="text-xs text-gray-400">Updated just now</div>
              </div>

              <p className="text-gray-200 mt-3">
                {currentMood
                 ? `Your current emotional state is "${currentMood.mood}". The system is adapting gently.`
                    : "No mood data yet. Log your mood to unlock insights."}

              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <KPI title="Mood Score" value={`${moodScore}/100`} hint="Overall wellbeing" icon={Activity} />
                <KPI title="Stability" value={`${stability}%`} hint="Mood swings" icon={SunMoon} accent="from-yellow-400 to-cyan-400" />
              </div>
            </div>
          </div>

          {/* CTA row */}
          <div className="mt-5 flex items-center gap-3">
            <button onClick={() => setShowAI(true)} className="bg-blue-500/30 text-blue-200 px-4 py-2 rounded-xl hover:bg-blue-500/50 transition">
              Talk to AI
            </button>
            <button  onClick={() => setShowMoodModal(true)} className="bg-white/6 px-4 py-2 rounded-xl text-gray-200 hover:bg-white/10">Log Mood</button>
            <button onClick={() => setSelectedTab("insights")} className="bg-white/6 px-4 py-2 rounded-xl text-gray-200 hover:bg-white/10">Get Well-being Tips</button>
          </div>
        </div>

        {/* Small KPI column */}
        <aside className="flex flex-col gap-4">
          <div className="bg-[#122034]/60 border border-white/8 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-gradient-to-br from-[#60a5fa] to-[#c084fc]">
                <BarChart2 className="text-white" size={18} />
              </div>
              <div>
                <div className="text-sm text-gray-300">Stress</div>
                <div className="text-lg font-semibold">{stress}%</div>
              </div>
            </div>
          </div>

          <div className="bg-[#122034]/60 border border-white/8 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-gradient-to-br from-[#34d399] to-[#60a5fa]">
                <Zap className="text-white" size={18} />
              </div>
              <div>
                <div className="text-sm text-gray-300">Energy</div>
                <div className="text-lg font-semibold">{energy}%</div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* TABS / NAV */}
      <nav className="flex items-center gap-3 mb-6">
        {[
          { id: "overview", label: "Overview" },
          { id: "trends", label: "Mood Trends" },
          { id: "insights", label: "AI Insights" },
          { id: "actions", label: "Actions" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm ${
              selectedTab === t.id ? "bg-white/6 text-white" : "text-gray-300 hover:bg-white/4"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* MAIN SECTIONS */}
      <main className="space-y-6">
        {/* Overview section */}
        {selectedTab === "overview" && (
          <section id="overview" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#0f1b2a]/60 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Weekly Mood Trend</h3>
                <div className="text-sm text-gray-400">Score scale 0–100</div>
              </div>

              <div className="mt-4">
                <TrendChart data={trendData} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <KPI
                      title="Avg Mood"
                      value={avgMood}
                      hint="Last 7 days"
                      icon={Activity}
                    />

                    <KPI
                      title="Best Day"
                      value={bestDay?.mood ?? "--"}
                      hint={getWeekday(bestDay?.createdAt)}
                      icon={Clock}
                      accent="from-purple-400 to-pink-400"
                    />

                    <KPI
                      title="Low Point"
                      value={lowDay?.mood ?? "--"}
                      hint={getWeekday(lowDay?.createdAt)}
                      icon={Heart}
                      accent="from-red-400 to-yellow-400"
                    />

                        </div>
                      </div>

            {/* Side insights */}
            <aside className="flex flex-col gap-4">
              <div className="bg-[#0f1b2a]/60 border border-white/8 rounded-2xl p-4">
                <h4 className="text-sm text-gray-300">Quick Summary</h4>
                <p className="text-gray-200 mt-2 text-sm">
                 {quickSummary}</p>
              </div>

              <div className="bg-[#0f1b2a]/60 border border-white/8 rounded-2xl p-4">
                <h4 className="text-sm text-gray-300">Recent Triggers</h4>
                <ul className="text-gray-200 text-sm mt-2 space-y-2">
                  <li>{recentTriggers}</li>
                  <li>☕ Skipped lunch (Thu) — energy dip</li>
                </ul>
              </div>
            </aside>
          </section>
        )}

        {/* Trends section */}
        {selectedTab === "trends" && (
          <section id="trends" className="bg-[#0f1b2a]/60 border border-white/8 rounded-2xl p-6">
            <h3 className="text-lg font-semibold">Mood Trends & Patterns</h3>
            <p className="text-gray-300 mt-2">Detailed view of mood fluctuations over time and correlation with activity.</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-[#122034]/60 rounded-xl border border-white/8">
                <h4 className="text-sm text-gray-300">Mood vs Sleep</h4>
                <p className="text-gray-200 mt-2 text-sm">Correlation indicates better sleep → higher mood next day.</p>
              </div>

              <div className="p-4 bg-[#122034]/60 rounded-xl border border-white/8">
                <h4 className="text-sm text-gray-300">Activity vs Mood</h4>
                <p className="text-gray-200 mt-2 text-sm">Light exercise days show a +6 average mood lift.</p>
              </div>
            </div>
          </section>
        )}

        {/* Insights section */}
        {selectedTab === "insights" && (
          <section id="insights" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0f1b2a]/60 border border-white/8 rounded-2xl p-6">
              <h4 className="text-sm text-gray-300">Emotional Stability</h4>
              <div className="mt-3">
                <div className="text-2xl font-semibold">{stability}%</div>
                <p className="text-gray-400 text-sm mt-1">{stabilityText}</p>
              </div>
            </div>

            <div className="bg-[#0f1b2a]/60 border border-white/8 rounded-2xl p-6">
              <h4 className="text-sm text-gray-300">Stress Radar</h4>
                <div className="mt-3 text-gray-200">{stressText}</div>
            </div>

            <div className="bg-[#0f1b2a]/60 border border-white/8 rounded-2xl p-6">
              <h4 className="text-sm text-gray-300">Energy Forecast</h4>
              <div className="mt-3 text-gray-200">Energy likely to recover in the evening. Light break recommended.{energyText}</div>
            </div>
            
    {/* ✅ AI Suggestions (full width) */}
    {aiSuggestions.length > 0 && (
      <div className="md:col-span-3 bg-[#0f1b2a]/60 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-amber-100/90">
          🤖 AI Emotional Guidance
        </h3>

        <div className="space-y-4">
          {aiSuggestions.map((s, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-white/5 border border-white/8"
            >
              <div className="font-medium text-white">{s.title}</div>
              <div className="text-sm text-gray-300 text-amber-200/80 mt-1">
                {s.message}
              </div>
              <div className="text-xs text-blue-300 mt-2">
                Suggested action: {s.action}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
    {!currentMood && (
  <div className="md:col-span-3 bg-[#0f1b2a]/60 border border-white/10 rounded-2xl p-6">
    <h3 className="text-lg font-semibold mb-2">
     🤖 AI Emotional Guidance
    </h3>
    <p className="text-gray-400 text-sm">
      Log your first mood check-in to unlock personalized AI insights.
    </p>
    <button className="mt-3 bg-blue-500/30 text-blue-200 px-4 py-2 rounded-xl">
      Log Mood
    </button>
  </div>
)}

          </section>
        )}

        {/* Actions section */}
        {selectedTab === "actions" && (
          <section id="actions" className="bg-[#0f1b2a]/60 border border-white/8 rounded-2xl p-6">
            <h3 className="text-lg font-semibold">Well-being Actions</h3>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button  onClick={() => setShowAI(true)} className="flex-1 bg-blue-500/30 text-blue-200 px-4 py-3 rounded-xl">Talk to AI</button>
              <button className="flex-1 bg-white/6 px-4 py-3 rounded-xl">Guided Breathing</button>
              <button onClick={() => setShowMoodModal(true)} className="flex-1 bg-white/6 px-4 py-3 rounded-xl">Log Mood</button>
            </div>
          </section>
        )}
      </main>

      {/* floating scroll to top */}
      <button
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed right-6 bottom-6 bg-gradient-to-br from-[#60a5fa] to-[#c084fc] p-3 rounded-full shadow-xl"
      >
        <ChevronUp className="text-white" />
      </button>
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

{showAI && <TalkAIModal onClose={() => setShowAI(false)} />}
    </div>
  );
}
