import { useState, useEffect } from "react";
import useMoodStore from "../../store/MoodStore";
import { auth } from "../../services/firebase";

export default function MyMoodChart() {
  const { fetchMoodHistory, moodHistory, loading, error } = useMoodStore();
  const [chartData, setChartData] = useState({
    positive: 0,
    neutral: 0,
    sad: 0,
    stressed: 0,
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      fetchMoodHistory(user.uid);
    }
  }, [fetchMoodHistory]);

  useEffect(() => {
    if (moodHistory.length > 0) {
      const stats = {};
      moodHistory.forEach((m) => {
        stats[m.mood] = (stats[m.mood] || 0) + 1;
      });

      const aggregatedData = {
        positive: (stats.happy || 0),
        neutral: (stats.okay || 0) + (stats.tired || 0),
        sad: (stats.sad || 0),
        stressed: (stats.stressed || 0) + (stats.angry || 0),
      };
      setChartData(aggregatedData);
    } else {
        setChartData({
            positive: 0,
            neutral: 0,
            sad: 0,
            stressed: 0,
        });
    }
  }, [moodHistory]);

  if (loading) {
    return <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-[320px] backdrop-blur-md text-white">Loading mood data...</div>;
  }

  if (error) {
    return <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-[320px] backdrop-blur-md text-red-400">Error: {error}</div>;
  }

  const total =
    chartData.positive + chartData.neutral + chartData.sad + chartData.stressed;

  const segments = [
    {
      label: "Positive",
      value: chartData.positive,
      color: "#4ade80", // green
      emoji: "😊",
    },
    {
      label: "Neutral",
      value: chartData.neutral,
      color: "#facc15", // yellow
      emoji: "🙂",
    },
    {
      label: "Sad",
      value: chartData.sad,
      color: "#60a5fa", // blue
      emoji: "😔",
    },
    {
      label: "Stressed",
      value: chartData.stressed,
      color: "#f87171", // red
      emoji: "😣",
    },
  ];

  // DOMINANT MOOD
  const dominant = segments.reduce((a, b) =>
    a.value > b.value ? a : b
  );
  
  // Handle case where total is 0 to avoid division by zero
  const getPercentage = (value, total) => (total === 0 ? 0 : Math.round((value / total) * 100));


  // CIRCUMFERENCE
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-[320px] backdrop-blur-md">
      <h3 className="text-xl text-white font-semibold mb-4">
        My Mood Overview
      </h3>

      <div className="relative flex items-center justify-center">
        {/* SVG Circle Chart */}
        <svg width="160" height="160" className="rotate-[-90deg]">
          {segments.map((seg, index) => {
            const segmentLength = total === 0 ? 0 : (seg.value / total) * circumference;
            const strokeDasharray = `${segmentLength} ${circumference}`;
            const strokeDashoffset = offset;
            offset -= segmentLength;

            return (
              <circle
                key={index}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            );
          })}
        </svg>

        {/* CENTER MOOD DISPLAY */}
        <div className="absolute flex flex-col items-center text-white">
          <div className="text-4xl">
            {total === 0 ? "✨" : dominant.emoji}
          </div>
          <p className="text-sm opacity-80">
            {total === 0 ? "No data" : dominant.label}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-gray-300">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: s.color }}
              ></span>
              {s.label}
            </div>
            <span>{getPercentage(s.value, total)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
