import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { 
  getUserProfile, 
  updateUserProfile,
  changeUserPassword, 
  saveNotificationPreferences,
  getNotificationPreferences
} from '../services/firestoreServices';
import { logoutUser } from '../services/auth.js';
import { toast } from 'react-toastify';
import {
  User,
  Shield,
  Bell,
  Palette,
  Cpu,
  Plug,
  HelpCircle,
  Lock,
  Users,
  Database,
  Globe,
  Check,
  Smartphone,
  X,
  Mail,
  Key,
  MessageCircle,
  Trash2,
  AlertCircle,
  LogOut
} from "lucide-react";

export default function Settings() {
  const [active, setActive] = useState("profile");
  const navigate = useNavigate();

  // Loading and user data
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [notifPrefs, setNotifPrefs] = useState({});

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    bio: '',
    role: '',
    location: '',
    website: '',
    linkedin: '',
    github: ''
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const profile = await getUserProfile(user.uid);
          setUserData(profile);
          
          setProfileForm({
            name: profile?.name || '',
            email: profile?.email || '',
            bio: profile?.bio || '',
            role: profile?.role || '',
            location: profile?.location || '',
            website: profile?.website || '',
            linkedin: profile?.linkedin || '',
            github: profile?.github || ''
          });

          const prefs = await getNotificationPreferences(user.uid);
          setNotifPrefs(prefs);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Save profile
  const handleSaveProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateUserProfile(user.uid, profileForm);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      await changeUserPassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect');
      } else {
        toast.error('Failed to change password');
      }
    }
  };

  // Save notification preferences
  const handleSaveNotifications = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await saveNotificationPreferences(user.uid, notifPrefs);
      toast.success('Notification preferences saved!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  // Toggle notification preference
  const toggleNotifPref = (key) => {
    setNotifPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout');
    }
  };

  const menu = [
    { key: "profile", label: "Profile", icon: <User size={18} /> },
    { key: "security", label: "Security", icon: <Shield size={18} /> },
    { key: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { key: "ai", label: "Emotional AI", icon: <Cpu size={18} /> },
    { key: "appearance", label: "Appearance", icon: <Palette size={18} /> },
    { key: "privacy", label: "Privacy", icon: <Lock size={18} /> },
    { key: "team", label: "Team Settings", icon: <Users size={18} /> },
    { key: "integrations", label: "Integrations", icon: <Plug size={18} /> },
    { key: "data", label: "Data & Storage", icon: <Database size={18} /> },
    { key: "support", label: "Support", icon: <HelpCircle size={18} /> },
  ];

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#0f1524] text-gray-200">
        <p className="text-xl">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex bg-[#0f1524] text-gray-200">
      {/* LEFT SIDEBAR */}
      <div className="w-64 border-r border-white/10 p-6 bg-[#141b2e]">
        <h2 className="text-xl font-semibold mb-6">Settings</h2>

        <div className="flex flex-col gap-1">
          {menu.map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition
              ${active === item.key ? "bg-blue-600/40" : "hover:bg-white/5"}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 p-10 overflow-y-auto">
        
        {/* PROFILE */}
        {active === "profile" && (
          <>
            <h1 className="text-2xl font-bold mb-2">Profile Settings</h1>
            <p className="text-gray-400 mb-6 text-sm">Manage your personal information and preferences</p>

            {/* Profile Photo */}
            <div className="bg-[#141b2e] border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="font-semibold mb-4">Profile Photo</h3>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                  {profileForm.name ? profileForm.name[0] : 'U'}
                </div>
                <div>
                  <button className="px-4 py-2 bg-blue-600/40 hover:bg-blue-600/60 rounded-lg text-sm mr-2">
                    Upload New
                  </button>
                  <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg text-sm">
                    Remove
                  </button>
                  <p className="text-xs text-gray-500 mt-2">JPG or PNG. Max size 2MB</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-[#141b2e] border border-white/10 rounded-xl p-6 mb-6 space-y-4">
              <h3 className="font-semibold mb-4">Basic Information</h3>
              
              <div>
                <label className="text-sm text-gray-400">Full Name</label>
                <input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  className="w-full p-3 rounded-lg bg-[#1c2942] border border-white/10 outline-none mt-1 focus:border-blue-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="w-full p-3 rounded-lg bg-[#1c2942] border border-white/10 outline-none mt-1 focus:border-blue-500"
                  placeholder="your@email.com"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="text-sm text-gray-400">Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                  className="w-full p-3 rounded-lg bg-[#1c2942] border border-white/10 outline-none mt-1 resize-none focus:border-blue-500"
                  rows={3}
                  placeholder="Tell your team about yourself..."
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Role / Position</label>
                <input
                  value={profileForm.role}
                  onChange={(e) => setProfileForm({...profileForm, role: e.target.value})}
                  className="w-full p-3 rounded-lg bg-[#1c2942] border border-white/10 outline-none mt-1 focus:border-blue-500"
                  placeholder="e.g., Frontend Developer"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Location</label>
                <input
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                  className="w-full p-3 rounded-lg bg-[#1c2942] border border-white/10 outline-none mt-1 focus:border-blue-500"
                  placeholder="e.g., Hyderabad, India"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-[#141b2e] border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold mb-4">Social Links</h3>
              
              <div>
                <label className="text-sm text-gray-400 flex items-center gap-2">
                  <Globe size={16} /> Website
                </label>
                <input
                  value={profileForm.website}
                  onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                  className="w-full p-3 rounded-lg bg-[#1c2942] border border-white/10 outline-none mt-1"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">LinkedIn</label>
                <input
                  value={profileForm.linkedin}
                  onChange={(e) => setProfileForm({...profileForm, linkedin: e.target.value})}
                  className="w-full p-3 rounded-lg bg-[#1c2942] border border-white/10 outline-none mt-1"
                  placeholder="linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">GitHub</label>
                <input
                  value={profileForm.github}
                  onChange={(e) => setProfileForm({...profileForm, github: e.target.value})}
                  className="w-full p-3 rounded-lg bg-[#1c2942] border border-white/10 outline-none mt-1"
                  placeholder="github.com/yourusername"
                />
              </div>

              <button 
                onClick={handleSaveProfile}
                className="w-full px-5 py-3 bg-blue-600/40 hover:bg-blue-600/60 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Save All Changes
              </button>
            </div>
          </>
        )}

        {/* SECURITY */}
        {active === "security" && (
          <>
            <h1 className="text-2xl font-bold mb-2">Security</h1>
            <p className="text-gray-400 mb-6 text-sm">Keep your account secure</p>

            {/* Password */}
            <div className="bg-[#141b2e] border border-white/10 rounded-xl p-6 mb-6 space-y-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Key size={18} /> Change Password
              </h3>
              
              <div>
                <label className="text-sm text-gray-400">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full p-3 rounded-lg bg-[#1c2942] border border-white/10 outline-none mt-1"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full p-3 rounded-lg bg-[#1c2942] border border-white/10 outline-none mt-1"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
              </div>

              <div>
                <label className="text-sm text-gray-400">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full p-3 rounded-lg bg-[#1c2942] border border-white/10 outline-none mt-1"
                  placeholder="••••••••"
                />
              </div>

              <button 
                onClick={handleChangePassword}
                className="px-5 py-2 bg-blue-600/40 hover:bg-blue-600/60 rounded-lg"
              >
                Update Password
              </button>
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-[#141b2e] border border-white/10 rounded-xl p-6 mb-6">
              <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4">
                <p className="text-yellow-300 font-medium">🚧 Feature Coming Soon!</p>
                <p className="text-sm text-gray-400 mt-1">
                  Two-factor authentication will be available in a future update.
                </p>
              </div>
            </div>

            {/* Logout Section */}
            <div className="bg-[#141b2e] border border-red-500/20 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2 text-red-400">
                    <LogOut size={18} /> Logout
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">Sign out from your account</p>
                </div>
              </div>
  
              <button 
                onClick={handleLogout}
                className="px-5 py-2 bg-red-600/40 hover:bg-red-600/60 rounded-lg transition-colors"
              >
                Logout from this device
              </button>
            </div>
          </>
        )}

        {/* NOTIFICATIONS */}
        {active === "notifications" && (
          <>
            <h1 className="text-2xl font-bold mb-2">Notifications</h1>
            <p className="text-gray-400 mb-6 text-sm">Manage how you receive notifications</p>

            {/* Email Notifications */}
            <div className="bg-[#141b2e] border border-white/10 rounded-xl p-6 mb-6 space-y-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Mail size={18} /> Email Notifications
              </h3>
              
              {[
                { key: 'taskAssignments', title: 'Task Assignments', desc: 'Get notified when tasks are assigned to you' },
                { key: 'teamMentions', title: 'Team Mentions', desc: 'When someone mentions you in a comment' },
                { key: 'moodReminders', title: 'Mood Check-in Reminders', desc: 'Daily reminders to log your mood' },
                { key: 'weeklyReports', title: 'Weekly Reports', desc: 'Receive weekly team mood and productivity reports' },
                { key: 'aiInsights', title: 'AI Insights', desc: 'Get AI-powered insights about team wellness' },
              ].map((item) => (
                <label key={item.key} className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 mt-1" 
                    checked={notifPrefs[item.key] || false}
                    onChange={() => toggleNotifPref(item.key)}
                  />
                </label>
              ))}
            </div>

            {/* Push Notifications */}
            <div className="bg-[#141b2e] border border-white/10 rounded-xl p-6 mb-6 space-y-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Bell size={18} /> Push Notifications
              </h3>
              
              {[
                { key: 'newMessages', title: 'New Messages', desc: 'Real-time chat notifications' },
                { key: 'urgentTasks', title: 'Urgent Tasks', desc: 'High priority task alerts' },
                { key: 'teamMoodChanges', title: 'Team Mood Changes', desc: 'When team mood drops significantly' },
              ].map((item) => (
                <label key={item.key} className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 mt-1" 
                    checked={notifPrefs[item.key] || false}
                    onChange={() => toggleNotifPref(item.key)}
                  />
                </label>
              ))}
            </div>

            <button 
              onClick={handleSaveNotifications}
              className="w-full px-5 py-3 bg-blue-600/40 hover:bg-blue-600/60 rounded-lg font-medium"
            >
              Save Preferences
            </button>
          </>
        )}

        {/* OTHER SECTIONS - Coming Soon */}
        {['ai', 'appearance', 'privacy', 'team', 'integrations', 'data', 'support'].includes(active) && (
          <>
            <h1 className="text-2xl font-bold mb-2">
              {menu.find(m => m.key === active)?.label}
            </h1>
            <p className="text-gray-400 mb-6 text-sm">
              {active === 'ai' && 'Configure AI-powered emotional intelligence features'}
              {active === 'appearance' && 'Customize how CollabSpace looks'}
              {active === 'privacy' && 'Control your data and visibility'}
              {active === 'team' && 'Manage your team settings'}
              {active === 'integrations' && 'Connect with your favorite tools'}
              {active === 'data' && 'Manage your data and storage'}
              {active === 'support' && 'Get help when you need it'}
            </p>

            <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-xl p-6">
              <p className="text-yellow-300 font-medium mb-2">🚧 Feature Coming Soon!</p>
              <p className="text-sm text-gray-400">
                This feature is currently in development and will be available in a future update.
                We're working hard to bring you the best experience!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}