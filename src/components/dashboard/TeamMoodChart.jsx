export default function TeamMoodChart() {
  // SAMPLE TEAM MOOD DATA — later connect Firebase + AI
  const data = {
    positive: 45,
    neutral: 25,
    sad: 15,
    stressed: 15,
  };

  const total =
    data.positive + data.neutral + data.sad + data.stressed;

  const segments = [
    {
      label: "Positive",
      value: data.positive,
      color: "#4ade80", // green
      emoji: "😊",
    },
    {
      label: "Neutral",
      value: data.neutral,
      color: "#facc15", // yellow
      emoji: "🙂",
    },
    {
      label: "Sad",
      value: data.sad,
      color: "#60a5fa", // blue
      emoji: "😔",
    },
    {
      label: "Stressed",
      value: data.stressed,
      color: "#f87171", // red
      emoji: "😣",
    },
  ];

  // DOMINANT MOOD
  const dominant = segments.reduce((a, b) =>
    a.value > b.value ? a : b
  );

  // CIRCUMFERENCE
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-[320px] backdrop-blur-md">
      <h3 className="text-xl text-white font-semibold mb-4">
        Team Mood Overview
      </h3>

      <div className="relative flex items-center justify-center">
        {/* SVG Circle Chart */}
        <svg width="160" height="160" className="rotate-[-90deg]">
          {segments.map((seg, index) => {
            const segmentLength = (seg.value / total) * circumference;
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
          <div className="text-4xl">{dominant.emoji}</div>
          <p className="text-sm opacity-80">{dominant.label}</p>
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
            <span>{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
