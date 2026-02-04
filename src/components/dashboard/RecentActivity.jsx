import { CheckCircle, MessageCircle, Smile, Bot } from "lucide-react";

export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      icon: <CheckCircle size={20} className="text-green-400" />,
      text: "You completed: Design meeting flow",
      time: "2h ago",
    },
    {
      id: 2,
      icon: <Smile size={20} className="text-yellow-300" />,
      text: "Mood updated to: Happy 😊",
      time: "4h ago",
    },
    {
      id: 3,
      icon: <MessageCircle size={20} className="text-blue-300" />,
      text: "Sunny sent you a new message",
      time: "5h ago",
    },
    {
      id: 4,
      icon: <Bot size={20} className="text-purple-300" />,
      text: "AI Assistant suggested: Take a short break",
      time: "Yesterday",
    },
  ];

  return (
    <div className="bg-[#1A243B]/60 p-6 rounded-2xl border border-white/10 backdrop-blur-md mt-4 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">Recent Activity</h2>

      <div className="flex flex-col gap-3">
        {activities.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-[#1F2C46]/40 hover:bg-[#25304A] transition p-3 rounded-xl"
          >
            <div className="flex items-center gap-3 text-gray-300">
              {item.icon}
              <span className="text-gray-200 text-sm">{item.text}</span>
            </div>
            <span className="text-xs text-gray-400">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
