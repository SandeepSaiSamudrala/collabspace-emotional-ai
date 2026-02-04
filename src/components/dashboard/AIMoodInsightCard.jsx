import { Bot } from "lucide-react";

export default function AIMoodInsightCard() {
  return (
    <div className="bg-[#1A243B]/60 p-6  rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-[#25304A] p-2 rounded-xl">
          <Bot size={22} className="text-blue-300" />
        </div>

        <h2 className="text-xl font-semibold text-gray-200 tracking-wide">
          AI Emotion
        </h2>
      </div>

      {/* Subtitle */}
      <p className="text-gray-300 text-sm mb-4">
        AI analyzed your recent emotional patterns and energy levels.
      </p>

      {/* Main Insight */}
      <div className="bg-[#25304A]/60 p-4 rounded-xl border border-white/10 shadow-inner">
        <p className="text-gray-200 text-[15px] leading-relaxed">
          💙 You seem mentally tired today. Try taking 2–3 minutes to slow down
          and breathe. It’s okay to pause — your emotional balance matters.
        </p>
      </div>

      {/* Action Button */}
      <button className="mt-4 w-full py-2 rounded-xl bg-blue-600/40 text-blue-200 hover:bg-blue-600/60 transition">
        View Guidance
      </button>

    </div>
  );
}
