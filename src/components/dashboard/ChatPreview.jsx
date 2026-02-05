import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { getRecentMessages } from "../../services/firestoreServices";
import { auth } from "../../services/firebase"; 
import { useChatStore } from "../../store/chatStore"; // Import useChatStore

// Helper function to format time
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "";
  const now = new Date();
  const messageDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp); 
  const seconds = Math.floor((now - messageDate) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// Array of vibrant colors for avatars
const avatarColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-indigo-500",
  "bg-pink-500",
  "bg-teal-500",
];

// Helper function to get a consistent color based on a string
const getColorForString = (str) => {
  if (!str) return avatarColors[0]; // Default color
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};

export default function ChatPreview() {
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate
  const { setSelectedUser, setChatType } = useChatStore(); // Get chat store actions

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = getRecentMessages((messages) => {
      const latestMessagesMap = new Map();
      messages.forEach(msg => {
          const participantId = msg.userId;
          // Only show messages that are not from the current user (to prevent self-chat previews)
          if (participantId !== user.uid) { 
            if (!latestMessagesMap.has(participantId) || msg.timestamp > latestMessagesMap.get(participantId).timestamp) {
                latestMessagesMap.set(participantId, msg);
            }
          }
      });
      
      const uniqueChats = Array.from(latestMessagesMap.values()).sort((a, b) => b.timestamp - a.timestamp);


      setRecentChats(uniqueChats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChatClick = (chatItem) => {
    setChatType("private");
    // Ensure the chatItem has the necessary fields that Chat.jsx expects for selectedUser
    setSelectedUser({
      userId: chatItem.userId,
      userName: chatItem.userName,
      // Add other fields if Chat.jsx's selectedUser expects them (e.g., id)
      id: chatItem.userId // Assuming userId can also serve as id for this context
    });
    navigate("/chat");
  };

  if (loading) {
    return (
      <div className="bg-[#1A243B]/60 p-6 rounded-2xl mt-4 border border-white/10 backdrop-blur-md shadow-lg text-gray-400">
        Loading recent chats...
      </div>
    );
  }

  return (
    <div className="bg-[#1A243B]/60 p-6 rounded-2xl mt-4 border border-white/10 backdrop-blur-md shadow-lg">
      
      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-200 mb-4">Recent Chats</h2>

      {/* Chats */}
      <div className="flex flex-col gap-4">
        {recentChats.length === 0 ? (
          <p className="text-gray-400 text-sm">No recent chats.</p>
        ) : (
          recentChats.map((item) => (
            <div
              key={item.id}
              onClick={() => handleChatClick(item)} // Make the div clickable
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#25304A] transition cursor-pointer" // Add cursor-pointer
            >
              {/* Left side */}
              <div className="flex items-center gap-3">
                
                {/* Avatar - using dynamic color */}
                <div className={`w-10 h-10 ${getColorForString(item.userName)} rounded-full flex items-center justify-center text-white font-bold`}>
                  {item.userName ? item.userName[0].toUpperCase() : "?"}
                </div>

                {/* Message */}
                <div>
                  <p className="text-gray-200 font-medium text-sm">{item.userName || "Unknown User"}</p>
                  <p className="text-gray-400 text-xs truncate w-40">{item.text}</p>
                </div>

              </div>

              {/* Time */}
              <span className="text-gray-400 text-xs">{formatTimeAgo(item.timestamp)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
