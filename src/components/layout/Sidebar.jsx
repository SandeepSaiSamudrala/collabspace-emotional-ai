 import { Home, ClipboardList, MessageCircle, Brain, Calendar, Users, Settings, Bell } from "lucide-react";
import Logo from "../../assets/logo/projectLogo.png";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="h-screen w-60 bg-gradient-to-t from-[#1A2338] to-[#111A2C]
 text-[#C7D1E0] p-2 flex flex-col border-r border-white/10">

      
      <div className="mb-10 flex items-center -ml-3 ">

        <motion.img
  src="/src/assets/logo/projectLogo.png"
  alt="CollabSpace"
  animate={{ rotate: [0, 360] }}
  transition={{
    repeat: Infinity,
    duration: 10,
    ease: "linear",
  }}
  className="w-20 h-15 drop-shadow-xl"
/>

         <div>
          <h1 className="text-xl font-semibold text-white">CollabSpace</h1>
          <p className="text-xs text-white/60 -mt-1">Emotional AI</p>
        </div>
      </div>

      
      <div className="flex flex-col gap-3">
  
        {/* Dashboard */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-xl transition-all duration-150 hover:scale-[1.02]
             ${isActive ? "bg-[#2D3A57] text-white shadow-sm" : "hover:bg-[#2D3A57] hover:border hover:border-white/20"}`
          }
        >
          <Home size={20} />
          <span>Dashboard</span>
        </NavLink>

        {/* Chat */}
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-xl transition-all duration-150 hover:scale-[1.02]
             ${isActive ? "bg-[#2D3A57] text-white shadow-sm" : "hover:bg-[#2D3A57] hover:border hover:border-white/20"}`
          }
        >
          <MessageCircle size={20} />
          <span>Chat</span>
        </NavLink>

        {/* Team Members */}
        <NavLink
          to="/team"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-xl transition-all duration-150 hover:scale-[1.02]
             ${isActive ? "bg-[#2D3A57] text-white shadow-sm" : "hover:bg-[#2D3A57] hover:border hover:border-white/20"}`
          }
        >
          <Users size={20} />
          <span>Team Members</span>
        </NavLink>

        {/* Tasks */}
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-xl transition-all duration-150 hover:scale-[1.02]
             ${isActive ? "bg-[#2D3A57] text-white shadow-sm" : "hover:bg-[#2D3A57] hover:border hover:border-white/20"}`
          }
        >
          <ClipboardList size={20} />
          <span>Tasks</span>
        </NavLink>

        {/* AI Assistant */}
        <NavLink
          to="/ai"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-xl transition-all duration-150 hover:scale-[1.02]
             ${isActive ? "bg-[#2D3A57] text-white shadow-sm" : "hover:bg-[#2D3A57] hover:border hover:border-white/20"}`
          }
        >
          <Brain size={20} />
          <span>AI Emotional Assistant</span>
        </NavLink>

        {/* Calendar */}
        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-xl transition-all duration-150 hover:scale-[1.02]
             ${isActive ? "bg-[#2D3A57] text-white shadow-sm" : "hover:bg-[#2D3A57] hover:border hover:border-white/20"}`
          }
        >
          <Calendar size={20} />
          <span>Calender</span>
        </NavLink>

        {/* Notifications */}
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-xl transition-all duration-150 hover:scale-[1.02]
             ${isActive ? "bg-[#2D3A57] text-white shadow-sm" : "hover:bg-[#2D3A57] hover:border hover:border-white/20"}`
          }
        >
          <Bell size={20} />
          <span>Notifications</span>
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-xl transition-all duration-150 hover:scale-[1.02]
             ${isActive ? "bg-[#2D3A57] text-white shadow-sm" : "hover:bg-[#2D3A57] hover:border hover:border-white/20"}`
          }
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>


       
      </div>
    </div>
  );
}
