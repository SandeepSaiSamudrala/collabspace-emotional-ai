import { useState, useEffect, useRef } from "react";
import { Search, Send, MoreVertical, Users } from "lucide-react";
import { auth } from "../services/firebase";
import { createNotification } from '../services/firestoreServices';

import {
  getUserProfile,
  sendMessage,
  subscribeToMessages,
  sendPrivateMessage,
  subscribeToPrivateMessages,
} from "../services/firestoreServices";
import { useChatStore } from "../store/chatStore";

export default function Chat() {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  const unsubscribePrivateRef = useRef(null);

  const {
    messages,
    setMessages,
    loading,
    setLoading,
    privateMessages,
    setPrivateMessages,
    selectedUser,
    setSelectedUser,
    chatType,
    setChatType,
  } = useChatStore();

  const [currentUser, setCurrentUser] = useState(null);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isPrivateChat = chatType === "private";

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, privateMessages]);

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const userData = await getUserProfile(user.uid);
        setCurrentUser(userData);
      }
    };
    loadUser();
  }, []);

  // TEAM chat subscription
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToMessages((newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setMessages, setLoading]);

  // PRIVATE chat subscription
  useEffect(() => {
    if (!selectedUser) return;

    if (unsubscribePrivateRef.current) unsubscribePrivateRef.current();

    const currentUID = auth.currentUser?.uid;
    const unsub = subscribeToPrivateMessages(
  currentUID, 
  selectedUser.userId || selectedUser.id, 
  setPrivateMessages
);

    unsubscribePrivateRef.current = unsub;
    return () => unsub();
  }, [selectedUser, setPrivateMessages]);

  // Send message (team or private)
  const handleSend = async () => {
    if (!inputText.trim() || !currentUser) return;
    setSending(true);

    try {
     if (isPrivateChat && selectedUser) {
  await sendPrivateMessage(
    auth.currentUser.uid,
    currentUser.name || "Unknown",
    selectedUser.userId || selectedUser.id,      // ← Fixed
    selectedUser.userName || selectedUser.name,  // ← Fixed
    inputText.trim()
  );
} else {
        await sendMessage(auth.currentUser.uid, currentUser.name || "Unknown", inputText.trim());
      }
      setInputText("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter messages for search
  const filteredTeamMessages = messages.filter(
    (msg) =>
      msg.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Unique users from team chat (for DM list)
  const getUniqueUsers = () => {
    const usersMap = new Map();
    messages.forEach((msg) => {
      if (!usersMap.has(msg.userId) && msg.userId !== auth.currentUser?.uid) {
        usersMap.set(msg.userId, {
          userId: msg.userId,
          userName: msg.userName,
          lastMessage: msg.text,
          timestamp: msg.timestamp,
        });
      }
    });
    return Array.from(usersMap.values());
  };
  const uniqueUsers = getUniqueUsers();


// Add this useEffect to listen for NEW private messages
useEffect(() => {
  if (!selectedUser || privateMessages.length === 0) return;

  // Get the last message
  const lastMessage = privateMessages[privateMessages.length - 1];
  
  // If it's not from you and you haven't been notified
  if (lastMessage.fromUserId !== auth.currentUser?.uid && !lastMessage.notified) {
    // Create notification
    createNotification({
      userId: auth.currentUser?.uid,
      type: 'mention',
      title: 'New message',
      body: `${lastMessage.fromUserName}: ${lastMessage.text.slice(0, 50)}${lastMessage.text.length > 50 ? '...' : ''}`,
      actor: lastMessage.fromUserName,
      icon: 'msg'
    }).catch(console.error);
  }
}, [privateMessages, selectedUser]);

// Also for team chat - add this useEffect
useEffect(() => {
  if (messages.length === 0) return;

  // Get the last message
  const lastMessage = messages[messages.length - 1];
  
  // If it's not from you
  if (lastMessage.userId !== auth.currentUser?.uid) {
    // Create notification for new team message
    createNotification({
      userId: auth.currentUser?.uid,
      type: 'mention',
      title: 'New team message',
      body: `${lastMessage.userName}: ${lastMessage.text.slice(0, 50)}${lastMessage.text.length > 50 ? '...' : ''}`,
      actor: lastMessage.userName,
      icon: 'msg'
    }).catch(console.error);
  }
}, [messages]);
  return (
    <div className="flex bg-[#1A2438] h-full w-full text-gray-200">
      {/* LEFT SIDEBAR */}
      <div className="w-72 bg-[#0f1524] m-1 border-r rounded-xl border-white/10 p-4 flex flex-col">
        {/* Search */}
        <div className="mb-4">
          <div className="relative rounded-lg focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:bg-[#1e2a44] bg-[#1A2438]">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search team messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-transparent outline-none text-sm text-gray-200 rounded-lg placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* TEAM CHAT BUTTON */}
        <div
          onClick={() => {
            setChatType("team");
            setSelectedUser(null);
          }}
          className={`p-3 rounded-lg cursor-pointer mb-4 flex items-center gap-3 transition ${
            chatType === "team" ? "bg-blue-600/30" : "bg-white/5 hover:bg-white/10"
          }`}
        >
          <Users className="text-blue-400" size={20} />
          <span className="font-semibold">Team Chat</span>
        </div>

        {/* DIRECT MESSAGES */}
        <h3 className="text-xs text-gray-400 font-semibold mb-2 mt-2">
          DIRECT MESSAGES ({uniqueUsers.length})
        </h3>
        <div className="flex-1 overflow-y-auto space-y-2">
          {uniqueUsers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No users yet</p>
          ) : (
            uniqueUsers.map((user) => (
              <div
                key={user.userId}
                onClick={() => {
                  setSelectedUser(user);
                  setChatType("private");
                }}
                className={`p-3 rounded-lg cursor-pointer transition flex items-center gap-3 ${
                  selectedUser?.userId === user.userId && chatType === "private"
                    ? "bg-blue-600/30"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold uppercase">
                  {user.userName ? user.userName[0] : "?"}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm">{user.userName}</h3>
                    <span className="text-xs text-gray-400">
                      {user.timestamp?.toDate
                        ? new Date(user.timestamp.toDate()).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{user.lastMessage}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT CHAT WINDOW */}
      <div className="flex-1 m-1 -ml-0.5 rounded-xl flex flex-col bg-[#0f1524]">
        {/* HEADER */}
        <div className="h-16 border-b border-white/10 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-semibold uppercase">
              {isPrivateChat ? selectedUser?.userName?.[0] : currentUser?.name?.[0] || "T"}
            </div>
            <div>
              <h2 className="font-semibold text-gray-100">
                {isPrivateChat ? selectedUser?.userName : "Team chat"}
              </h2>
              <p className="text-xs text-green-400">
                {isPrivateChat ? privateMessages.length + " messages" : messages.length + " messages"}
              </p>
            </div>
          </div>
          <MoreVertical size={20} className="text-gray-400 cursor-pointer" />
        </div>
          {/* MESSAGES */}
<div className="flex-1 overflow-y-auto p-6 space-y-4">
  {loading ? (
    <div className="text-center text-gray-400 py-12">
      <p>Loading messages...</p>
    </div>
  ) : (isPrivateChat ? privateMessages : filteredTeamMessages).length === 0 ? (
    <div className="text-center text-gray-400 py-12">
      <p className="text-lg mb-2">No messages yet</p>
      <p className="text-sm">Start the conversation!</p>
    </div>
  ) : (
    (isPrivateChat ? privateMessages : filteredTeamMessages).map((msg) => {
      // ✅ FIX: Different logic for private vs team chat
     
      const isCurrentUser = isPrivateChat
        ? msg.fromUserId === auth.currentUser?.uid  // For private: check fromUserId
        : msg.userId === auth.currentUser?.uid;     // For team: check userId

      // ✅ FIX: Different field names for private vs team chat
      const senderName = isPrivateChat 
        ? msg.fromUserName   // For private: use fromUserName
        : msg.userName;      // For team: use userName

      return (
        <div key={msg.id} className={`flex gap-3 ${isCurrentUser ? "justify-end" : "items-start"}`}>
          {!isCurrentUser && (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold uppercase flex-shrink-0">
              {senderName ? senderName[0] : "?"}
            </div>
          )}
          <div className={`max-w-sm ${isCurrentUser ? "text-right" : ""}`}>
            {!isCurrentUser && (
              <p className="text-xs text-gray-400 mb-1 font-semibold">
                {senderName || "Unknown"}
              </p>
            )}
            <div className={`p-3 rounded-xl shadow-sm ${isCurrentUser ? "bg-blue-600" : "bg-white/10"}`}>
              <p className="break-words">{msg.text}</p>
            </div>
            <span className="text-xs text-gray-400 mt-1 inline-block">
              {msg.timestamp?.toDate
                ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Sending..."}
            </span>
          </div>
        </div>
      );
    })
  )}
  <div ref={messagesEndRef} />
</div>
        {/* MESSAGES 
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {(isPrivateChat ? privateMessages : filteredTeamMessages).map((msg) => {
            const isCurrentUser = msg.userId === auth.currentUser?.uid;
            return (
              <div key={msg.id} className={`flex gap-3 ${isCurrentUser ? "justify-end" : "items-start"}`}>
                {!isCurrentUser && (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold uppercase flex-shrink-0">
                    {msg.userName ? msg.userName[0] : "?"}
                  </div>
                )}
                <div className={`max-w-sm ${isCurrentUser ? "text-right" : ""}`}>
                  {!isCurrentUser && <p className="text-xs text-gray-400 mb-1 font-semibold">{msg.userName}</p>}
                  <div className={`p-3 rounded-xl shadow-sm ${isCurrentUser ? "bg-blue-600" : "bg-white/10"}`}>
                    <p className="break-words">{msg.text}</p>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 inline-block">
                    {msg.timestamp?.toDate
                      ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Sending..."}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="border-t border-white/10 px-6 py-4 flex items-center gap-3 bg-[#0f1524]">
          <div className="flex-1 bg-[#1A2438] px-4 py-3 rounded-xl outline-none text-gray-200 flex items-center transition focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:bg-[#1e2a44]">
            <input
              type="text"
              placeholder={isPrivateChat ? `Message ${selectedUser?.userName}...` : "Type a message..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending || (!isPrivateChat && !currentUser)}
              className="w-full bg-transparent outline-none"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending || !inputText.trim()}
            className="bg-blue-600 p-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
