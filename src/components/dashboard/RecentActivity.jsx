import { useState, useEffect } from "react";
import { CheckCircle, MessageCircle, Smile, Bot, Calendar, Info } from "lucide-react";
import { auth } from "../../services/firebase";
import { subscribeToNotifications } from "../../services/firestoreServices";

// Helper function to format time (reusing from ChatPreview)
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

// Mapping for Lucide React icons
const IconMap = {
  CheckCircle: CheckCircle,
  MessageCircle: MessageCircle,
  Smile: Smile,
  Bot: Bot,
  Calendar: Calendar,
  Info: Info,
};

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Subscribe to notifications for the current user
    // Limiting to a reasonable number for recent activity display
    const unsubscribe = subscribeToNotifications(user.uid, (notifications) => {
      // Map notification data to activity format
      const formattedActivities = notifications
        .slice(0, 5) // Display top 5 recent notifications as activities
        .map((notif) => {
          let iconComponent = IconMap.Info; // Default icon
          let iconColor = "text-purple-300";
          let activityText = notif.body;

          // Determine icon and color based on notification type or title
          if (notif.type === 'mood') {
            iconComponent = IconMap.Smile;
            iconColor = "text-yellow-300";
          } else if (notif.type === 'task') {
            iconComponent = IconMap.CheckCircle;
            iconColor = "text-green-400";
            activityText = `${notif.title}: ${notif.body}`;
          } else if (notif.type === 'message' || notif.type === 'mention') {
            iconComponent = IconMap.MessageCircle;
            iconColor = "text-blue-300";
            activityText = `${notif.actor} sent you a message: ${notif.body}`;
          } else if (notif.type === 'ai_suggestion') {
            iconComponent = IconMap.Bot;
            iconColor = "text-purple-300";
          } else if (notif.type === 'event') {
            iconComponent = IconMap.Calendar;
            iconColor = "text-orange-400";
            activityText = `${notif.title}: ${notif.body}`;
          }

          return {
            id: notif.id,
            icon: iconComponent,
            text: activityText,
            time: notif.createdAt, // Use raw timestamp for formatting
            read: notif.read,
            iconColor: iconColor, // Add iconColor to the item object
          };
        })
        .sort((a, b) => b.time.toDate().getTime() - a.time.toDate().getTime()); // Sort by newest first

      setActivities(formattedActivities);
      setLoading(false);
    });

    return () => unsubscribe(); // Unsubscribe on component unmount
  }, []);

  if (loading) {
    return (
      <div className="bg-[#1A243B]/60 p-6 rounded-2xl border border-white/10 backdrop-blur-md mt-4 shadow-lg text-gray-400">
        Loading recent activity...
      </div>
    );
  }

  return (
    <div className="bg-[#1A243B]/60 p-6 rounded-2xl border border-white/10 backdrop-blur-md mt-4 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">Recent Activity</h2>

      <div className="flex flex-col gap-3">
        {activities.length === 0 ? (
          <p className="text-gray-400 text-sm">No recent activity.</p>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-[#1F2C46]/40 hover:bg-[#25304A] transition p-3 rounded-xl"
            >
              <div className="flex items-center gap-3">
                {item.icon && <item.icon size={20} className={item.iconColor} />}
                <span className="text-gray-200 text-sm">{item.text}</span>
              </div>
              <span className="text-xs text-gray-400">{formatTimeAgo(item.time)}</span>
            </div>
          ))
        )}

      </div>
    </div>
  );
}
