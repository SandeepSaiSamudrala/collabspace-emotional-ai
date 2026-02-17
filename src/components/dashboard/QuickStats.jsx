import { ClipboardList,  Users, Smile,Bell } from "lucide-react";
import { useState, useEffect } from "react";
import useMoodStore from "../../store/MoodStore";
import { auth } from "../../services/firebase";
import {
  subscribeToTasks,
  getAllUsers,
  subscribeToNotifications,
} from "../../services/firestoreServices";

export default function QuickStats() {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { getMoodScore } = useMoodStore();

  /* 
     Load Tasks (REAL-TIME)
*/
  useEffect(() => {
    const unsubscribe = subscribeToTasks((taskList) => {
      setTasks(taskList || []);
    });

    return () => unsubscribe?.();
  }, []);
  /* -----------------------------
     NOTIFICATIONS (REAL)
  ------------------------------*/
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = subscribeToNotifications(
      user.uid,
      (loadedNotifications) => {
        setNotifications(loadedNotifications);
      }
    );

    return () => unsubscribe?.();
  }, [auth.currentUser?.uid]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const notificationValue =
    unreadCount > 0 ? `${unreadCount} New` : "No new";


  /* -----------------------------
     Load Team Members (ONCE)
  ------------------------------*/
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const users = await getAllUsers();
        setMembers(users);
      } catch (err) {
        console.error("Failed to load team members", err);
      }
    };

    loadMembers();
  }, []);

  /* -----------------------------
     Derived Values
  ------------------------------*/
  const activeTaskCount = tasks.filter(
    (t) => t.status !== "completed"
  ).length;

  

  const teamValue =
    members.length > 0 ? `${members.length} Members` : "—";

  const moodScore = getMoodScore();
  const moodValue =
    moodScore > 0 ? `${moodScore}% Positive` : "—";

  const stats = [
    {
      id: 1,
      icon: <ClipboardList size={22} className="text-blue-300" />,
      label: "Tasks",
      value: `${activeTaskCount} Active`,
    },
    {
      id: 2,
      icon: <Bell size={22} className="text-purple-300" />,
      label: "Notifications",
      value:  notificationValue,
    },
    {
      id: 3,
      icon: <Users size={22} className="text-green-300" />,
      label: "Team",
      value: teamValue,
    },
    {
      id: 4,
      icon: <Smile size={22} className="text-yellow-300" />,
      label: "Mood",
      value: moodValue,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-0">
      {stats.map((item) => (
        <div
          key={item.id}
          className="bg-[#1A243B]/60 p-4 rounded-xl border border-white/10 shadow-lg backdrop-blur-md
                     hover:bg-[#25304A] transition flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            {item.icon}
            <span className="text-gray-300 font-medium">
              {item.label}
            </span>
          </div>

          <span className="text-gray-100 text-lg font-semibold">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
