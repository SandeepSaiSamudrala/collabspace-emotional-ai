
// src/components/layout/Navbar.jsx
import { Search, Bell, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState,useEffect} from "react";
import { auth } from "../../services/firebase";
import { signOut } from "firebase/auth";
import TalkAIModal from "../dashboard/TalkAIModal";
import { subscribeToNotifications } from "../../services/firestoreServices";
export default function Navbar() {
   const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [openProfile, setOpenProfile] = useState(false);
  const [showAI, setShowAI] = useState(false);
 
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
   const latestNotifications = notifications.slice(0, 3);
  const hasUnread = notifications.some(n => n.read === false);

        useEffect(() => {
          const user = auth.currentUser;
          if (!user) return;

          const unsub = subscribeToNotifications(user.uid, (data) => {
            setNotifications(data);
          });

          return () => unsub();
        }, []);

  const handleSearch = (e) => {
    if (e.key !== "Enter") return;

    const q = query.toLowerCase();

    if (q.includes("task")) navigate("/tasks");
    else if (q.includes("chat")) navigate("/chat");
    else if (q.includes("team")) navigate("/team");
    else if (q.includes("calender")) navigate("/calender");
    else if (q.includes("settings")) navigate("/settings");
    else if (q.includes("ai")) navigate("/ai");
    else if (q.includes("notifications")) navigate("/notifications");
  };
  return (
    <div className="w-full  bg-gradient-to-l from-[#1A2338] to-[#111A2C]
]

  shadow-sm flex items-center justify-between px-6 border-b border-white/10">

      {/* Page Title */}
      <h2 className="text-xl font-semibold text-gray-300">
        Dashboard
      </h2>

      {/* Right Actions */}
      <div className="flex items-center gap-8">

        {/* Search */}
        <div className="relative ">
          <Search size={18} className="text-gray-800 absolute left-2 top-2 " />
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
           className="bg-gray-300 pl-8 pr-3 placeholder-gray-500 py-2 text-gray-800 w-72 rounded-xl text-md outline-none hover:bg-white "
          />
        </div>

        {/* Notifications */}
        <motion.button 
         onClick={() => setShowNotif((v) => !v)}
        className="relative hover:bg-white/10 p-2 rounded-md transition">
          <Bell size={22} className="text-gray-300 hover:text-white " />
         {hasUnread && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </motion.button>
                   {/*Showmodel Notifications*/}
          {showNotif && (
            <div className="absolute right-9 top-16 w-80 bg-[#0f1b2a]/95 backdrop-blur-xl border border-blue-300 rounded-2xl shadow-2xl z-50">
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <span className="text-sm font-medium text-lime-200">
                    Notifications 🔔
                  </span>
                  
                  <button
                    onClick={() => setShowNotif(false)}
                    className="text-gray-400 hover:text-white transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Content */}
                <div className="max-h-80 overflow-y-auto">
                  {latestNotifications.length === 0 ? (
                    <div className="p-4 text-sm text-gray-400">
                      No notifications yet
                    </div>
                  ) : (
                    latestNotifications.map((n) => (
                      <div
                        key={n.id}
                        className="px-4 py-3 border-b border-white/5 hover:bg-white/5 transition"
                      >
                        <div className="text-sm text-white">{n.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {n.body}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <button
                  onClick={() => {
                    setShowNotif(false);
                    navigate("/notifications");
                  }}
                  className="w-full py-2 text-xs text-blue-300 hover:text-blue-200 border-t border-white/10"
                >
                  View all notifications
                </button>
              </div>
             
        )}

        {/* AI Button */}
             <button
                 onClick={() => {
                          console.log("AI BUTTON CLICKED");
                          setShowAI(true)
                        }}
                
                  className="flex items-center gap-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-xl"
                >
                  <Sparkles size={18} />
                  <span className="font-medium">AI</span>
            </button>


        {/* Profile */}
              <div className="relative z-[999]">
                <div
                  onClick={() => setOpenProfile(!openProfile)}
                  className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <span className="text-gray-800 font-semibold">Me</span>
                </div>

                {openProfile && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#0f1b2a] border border-white/30 rounded-xl p-3 z-[999]">
                    <p className="text-sm text-blue-300 truncate">
                      {auth.currentUser?.email}
                    </p>

                    <button
                      onClick={() => signOut(auth)}
                      className="mt-3 w-full text-left text-red-400 hover:text-red-300 text-sm"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

      </div>
                  {showAI && <TalkAIModal onClose={() => setShowAI(false)} />}

    </div>
  );
}
