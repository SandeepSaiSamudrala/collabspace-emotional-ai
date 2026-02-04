export default function ChatPreview() {
  const chats = [
    {
      id: 1,
      name: "Sandeep Sai",
      message: "Hey, did you complete the task?",
      time: "5m ago",
      color: "bg-blue-500",
    },
    {
      id: 2,
      name: "Swathi",
      message: "Mood check-in looks great!",
      time: "1h ago",
      color: "bg-pink-500",
    },
    {
      id: 3,
      name: "AI Assistant",
      message: "I noticed your mood decreased slightly. Want suggestions?",
      time: "3h ago",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="bg-[#1A243B]/60 p-6 rounded-2xl mt-4 border border-white/10 backdrop-blur-md shadow-lg">
      
      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-200 mb-4">Recent Chats</h2>

      {/* Chats */}
      <div className="flex flex-col gap-4">
        {chats.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-[#25304A] transition"
          >
            {/* Left side */}
            <div className="flex items-center gap-3">
              
              {/* Avatar */}
              <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center text-white font-bold`}>
                {item.name[0]}
              </div>

              {/* Message */}
              <div>
                <p className="text-gray-200 font-medium text-sm">{item.name}</p>
                <p className="text-gray-400 text-xs truncate w-40">{item.message}</p>
              </div>

            </div>

            {/* Time */}
            <span className="text-gray-400 text-xs">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
