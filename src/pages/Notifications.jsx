import { useMemo, useState, useEffect } from "react";
import {
  Bell,
  Search,
  X,
  Check,
  Trash2,
  Mail,
  MessageCircle,
  FileText,
} from "lucide-react";
import { auth } from "../services/firebase";
import {
  subscribeToNotifications,
  markNotificationRead,
  toggleNotificationRead,
  deleteNotification,
  markAllNotificationsRead,
  deleteReadNotifications,
} from "../services/firestoreServices";

function iconFor(n) {
  switch (n.icon) {
    case "msg":
      return <MessageCircle size={18} className="text-sky-300" />;
    case "task":
      return <FileText size={18} className="text-amber-300" />;
    case "deploy":
      return <Check size={18} className="text-green-300" />;
    case "sys":
      return <Mail size={18} className="text-gray-300" />;
    default:
      return <Bell size={18} className="text-gray-300" />;
  }
}

function isToday(d) {
  const t = new Date();
  return (
    d.getDate() === t.getDate() &&
    d.getMonth() === t.getMonth() &&
    d.getFullYear() === t.getFullYear()
  );
}

function isYesterday(d) {
  const t = new Date();
  t.setDate(t.getDate() - 1);
  return (
    d.getDate() === t.getDate() &&
    d.getMonth() === t.getMonth() &&
    d.getFullYear() === t.getFullYear()
  );
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  // Load notifications from Firebase
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToNotifications(currentUser.uid, (loadedNotifications) => {
      setNotifications(loadedNotifications);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Derived counts
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Filtered + grouped notifications
  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = notifications.filter((n) => {
      if (filter !== "all" && n.type !== filter) return false;
      if (!q) return true;
      return (
        n.title?.toLowerCase().includes(q) ||
        n.body?.toLowerCase().includes(q) ||
        (n.actor && n.actor.toLowerCase().includes(q))
      );
    });

    const today = [];
    const yesterday = [];
    const earlier = [];

    filtered
      .slice()
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      })
      .forEach((n) => {
        const d = n.createdAt?.toDate ? n.createdAt.toDate() : new Date(n.createdAt);
        if (isToday(d)) today.push(n);
        else if (isYesterday(d)) yesterday.push(n);
        else earlier.push(n);
      });

    return { today, yesterday, earlier };
  }, [notifications, filter, query]);

  // Actions
  const markAsRead = async (id) => {
    try {
      await markNotificationRead(id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const toggleRead = async (id) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;
    
    try {
      await toggleNotificationRead(id, notification.read);
    } catch (error) {
      console.error('Error toggling read:', error);
    }
  };

  const remove = async (id) => {
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllRead = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    try {
      await markAllNotificationsRead(currentUser.uid);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const clearRead = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    try {
      await deleteReadNotifications(currentUser.uid);
    } catch (error) {
      console.error('Error clearing read notifications:', error);
    }
  };

  const formatTime = (timestamp) => {
    const d = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return d.toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  };

  // UI component for section
  const Section = ({ title, items }) => {
    if (!items.length) return null;
    return (
      <div>
        <h3 className="text-sm text-gray-400 uppercase tracking-wide mb-3">{title}</h3>
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition ${
                n.read ? "bg-white/2 hover:bg-white/3" : "bg-white/4 shadow-sm"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                {iconFor(n)}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRead(n.id)}
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          n.read ? "border-white/10 text-gray-300" : "border-yellow-500 text-yellow-200"
                        }`}
                        title={n.read ? "Mark unread" : "Mark read"}
                      >
                        {n.read ? "Read" : "Unread"}
                      </button>

                      <p className="font-medium text-sm truncate">{n.title}</p>
                    </div>

                    <p className="text-xs text-gray-300 mt-1 truncate">{n.body}</p>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                      <span>{n.actor}</span>
                      <span className="opacity-50">•</span>
                      <span>{formatTime(n.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="p-2 rounded-md hover:bg-white/5"
                      title="Mark read"
                    >
                      <Check size={16} className="text-green-300" />
                    </button>

                    <button
                      onClick={() => remove(n.id)}
                      className="p-2 rounded-md hover:bg-white/5"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0f1524] text-gray-200">
        <p className="text-xl">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 bg-[#0f1524] text-gray-200 flex flex-col">
      {/* header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#1a243b] flex items-center justify-center">
            <Bell size={20} className="text-sky-300" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Notifications</h1>
            <p className="text-sm text-gray-400">
              Recent activity — <span className="font-medium">{unreadCount}</span> unread
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={markAllRead}
            className="px-3 py-2 rounded-lg bg-blue-600/40 hover:bg-blue-600/60 text-sm"
          >
            Mark all read
          </button>

          <button onClick={clearRead} className="px-3 py-2 rounded-lg bg-white/3 hover:bg-white/4 text-sm">
            Clear read
          </button>
        </div>
      </div>

      {/* controls */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center bg-[#1a243b] border border-white/10 px-3 rounded-xl w-full">
          <Search size={16} className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notifications, actors, titles..."
            className="bg-transparent flex-1 p-2 outline-none text-gray-200"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-2 rounded-md hover:bg-white/5">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-2 rounded-lg text-sm ${
              filter === "all" ? "bg-white/5" : "bg-white/3 hover:bg-white/4"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("mention")}
            className={`px-3 py-2 rounded-lg text-sm ${
              filter === "mention" ? "bg-white/5" : "bg-white/3 hover:bg-white/4"
            }`}
          >
            Mentions
          </button>
          <button
            onClick={() => setFilter("task")}
            className={`px-3 py-2 rounded-lg text-sm ${
              filter === "task" ? "bg-white/5" : "bg-white/3 hover:bg-white/4"
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setFilter("system")}
            className={`px-3 py-2 rounded-lg text-sm ${
              filter === "system" ? "bg-white/5" : "bg-white/3 hover:bg-white/4"
            }`}
          >
            System
          </button>
          <button
            onClick={() => setFilter("update")}
            className={`px-3 py-2 rounded-lg text-sm ${
              filter === "update" ? "bg-white/5" : "bg-white/3 hover:bg-white/4"
            }`}
          >
            Updates
          </button>
        </div>
      </div>

      {/* content area */}
      <div className="flex-1 overflow-y-auto pr-3">
        {/* grouped sections */}
        <Section title="Today" items={grouped.today} />
        <Section title="Yesterday" items={grouped.yesterday} />
        <Section title="Earlier" items={grouped.earlier} />

        {/* empty state */}
        {grouped.today.length + grouped.yesterday.length + grouped.earlier.length === 0 && (
          <div className="mt-16 text-center text-gray-400">
            <p className="mb-2">No notifications found.</p>
            <p className="text-sm">Try clearing filters or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}

{/*import { useMemo, useState } from "react";
import {
  Bell,
  Search,
  X,
  Check,
  Trash2,
  Mail,
  MessageCircle,
  FileText,
} from "lucide-react";

function sampleISO(daysOffset = 0, hours = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

const initialNotifications = [
  {
    id: "n1",
    type: "mention", // mention | task | system | update
    title: "You were mentioned in #design",
    body: "Sam: Can you review the new onboarding screens?",
    actor: "Sam",
    icon: "msg",
    createdAt: sampleISO(0, -1),
    read: false,
  },
  {
    id: "n2",
    type: "task",
    title: "Task assigned: Build chat layout",
    body: "Assigned by Priya — due in 3 days",
    actor: "Priya",
    icon: "task",
    createdAt: sampleISO(0, -3),
    read: false,
  },
  {
    id: "n3",
    type: "update",
    title: "Mood widgets deployed",
    body: "Release v1.2 deployed to production",
    actor: "CI",
    icon: "deploy",
    createdAt: sampleISO(-1, 2),
    read: true,
  },
  {
    id: "n4",
    type: "system",
    title: "Password policy updated",
    body: "Admins updated security settings",
    actor: "System",
    icon: "sys",
    createdAt: sampleISO(-2, 0),
    read: true,
  },
  {
    id: "n5",
    type: "mention",
    title: "You were mentioned in comment",
    body: "Aman: Please update the API docs.",
    actor: "Aman",
    icon: "msg",
    createdAt: sampleISO(-3, 1),
    read: false,
  },
  {
    id: "n6",
    type: "task",
    title: "New task: Design login UI",
    body: "Assigned to you by John",
    actor: "John",
    icon: "task",
    createdAt: sampleISO(-7, 0),
    read: false,
  },
];

function iconFor(n) {
  switch (n.icon) {
    case "msg":
      return <MessageCircle size={18} className="text-sky-300" />;
    case "task":
      return <FileText size={18} className="text-amber-300" />;
    case "deploy":
      return <Check size={18} className="text-green-300" />;
    case "sys":
      return <Mail size={18} className="text-gray-300" />;
    default:
      return <Bell size={18} className="text-gray-300" />;
  }
}

function isToday(d) {
  const t = new Date();
  return (
    d.getDate() === t.getDate() &&
    d.getMonth() === t.getMonth() &&
    d.getFullYear() === t.getFullYear()
  );
}
function isYesterday(d) {
  const t = new Date();
  t.setDate(t.getDate() - 1);
  return (
    d.getDate() === t.getDate() &&
    d.getMonth() === t.getMonth() &&
    d.getFullYear() === t.getFullYear()
  );
}

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("all"); // all, mention, task, system, update
  const [query, setQuery] = useState("");

  // Derived counts
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Filtered + grouped notifications
  const grouped = useMemo(() => {
    // filter by search + type
    const q = query.trim().toLowerCase();
    const filtered = notifications.filter((n) => {
      if (filter !== "all" && n.type !== filter) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        (n.actor && n.actor.toLowerCase().includes(q))
      );
    });

    const today = [];
    const yesterday = [];
    const earlier = [];

    filtered
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((n) => {
        const d = new Date(n.createdAt);
        if (isToday(d)) today.push(n);
        else if (isYesterday(d)) yesterday.push(n);
        else earlier.push(n);
      });

    return { today, yesterday, earlier };
  }, [notifications, filter, query]);

  // Actions
  const markAsRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const toggleRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));

  const remove = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const clearRead = () => setNotifications((prev) => prev.filter((n) => !n.read));

  // small helpers
  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  };

  // UI small component for section
  const Section = ({ title, items }) => {
    if (!items.length) return null;
    return (
      <div>
        <h3 className="text-sm text-gray-400 uppercase tracking-wide mb-3">{title}</h3>
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition ${
                n.read ? "bg-white/2 hover:bg-white/3" : "bg-white/4 shadow-sm"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                {iconFor(n)}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRead(n.id)}
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          n.read ? "border-white/10 text-gray-300" : "border-yellow-500 text-yellow-200"
                        }`}
                        title={n.read ? "Mark unread" : "Mark read"}
                      >
                        {n.read ? "Read" : "Unread"}
                      </button>

                      <p className="font-medium text-sm truncate">{n.title}</p>
                    </div>

                    <p className="text-xs text-gray-300 mt-1 truncate">{n.body}</p>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                      <span>{n.actor}</span>
                      <span className="opacity-50">•</span>
                      <span>{formatTime(n.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="p-2 rounded-md hover:bg-white/5"
                      title="Mark read"
                    >
                      <Check size={16} className="text-green-300" />
                    </button>

                    <button
                      onClick={() => remove(n.id)}
                      className="p-2 rounded-md hover:bg-white/5"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full p-6 bg-[#0f1524] text-gray-200 flex flex-col">
      {/* header *
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#1a243b] flex items-center justify-center">
            <Bell size={20} className="text-sky-300" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Notifications</h1>
            <p className="text-sm text-gray-400">
              Recent activity — <span className="font-medium">{unreadCount}</span> unread
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={markAllRead}
            className="px-3 py-2 rounded-lg bg-blue-600/40 hover:bg-blue-600/60 text-sm"
          >
            Mark all read
          </button>

          <button onClick={clearRead} className="px-3 py-2 rounded-lg bg-white/3 hover:bg-white/4 text-sm">
            Clear read
          </button>
        </div>
      </div>

      {/* controls *
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center bg-[#1a243b] border border-white/10 px-3 rounded-xl w-full">
          <Search size={16} className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notifications, actors, titles..."
            className="bg-transparent flex-1 p-2 outline-none text-gray-200"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-2 rounded-md hover:bg-white/5">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-2 rounded-lg text-sm ${
              filter === "all" ? "bg-white/5" : "bg-white/3 hover:bg-white/4"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("mention")}
            className={`px-3 py-2 rounded-lg text-sm ${
              filter === "mention" ? "bg-white/5" : "bg-white/3 hover:bg-white/4"
            }`}
          >
            Mentions
          </button>
          <button
            onClick={() => setFilter("task")}
            className={`px-3 py-2 rounded-lg text-sm ${
              filter === "task" ? "bg-white/5" : "bg-white/3 hover:bg-white/4"
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setFilter("system")}
            className={`px-3 py-2 rounded-lg text-sm ${
              filter === "system" ? "bg-white/5" : "bg-white/3 hover:bg-white/4"
            }`}
          >
            System
          </button>
          <button
            onClick={() => setFilter("update")}
            className={`px-3 py-2 rounded-lg text-sm ${
              filter === "update" ? "bg-white/5" : "bg-white/3 hover:bg-white/4"
            }`}
          >
            Updates
          </button>
        </div>
      </div>

      {/* content area *
      <div className="flex-1 overflow-y-auto pr-3">
        {/* grouped sections *
        <Section title="Today" items={grouped.today} />
        <Section title="Yesterday" items={grouped.yesterday} />
        <Section title="Earlier" items={grouped.earlier} />

        {/* empty state *
        {grouped.today.length + grouped.yesterday.length + grouped.earlier.length === 0 && (
          <div className="mt-16 text-center text-gray-400">
            <p className="mb-2">No notifications found.</p>
            <p className="text-sm">Try clearing filters or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}*/}
