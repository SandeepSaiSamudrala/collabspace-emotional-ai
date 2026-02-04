import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { getAllUsers } from "../services/firestoreServices.js";
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

export default function TeamMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const navigate = useNavigate();

  const handleMessageClick = (member) => {
    navigate('/chat', { state: { selectedMember: member } });
  };

  // Load real users from Firebase
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const users = await getAllUsers();
        setMembers(users);
      } catch (error) {
        console.error("Error loading members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full h-full bg-[#0f1524] text-gray-200 flex items-center justify-center">
        <p className="text-xl">Loading members...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#0f1524] text-gray-200 flex flex-col">
      {/* Header + Search */}
      <div className="p-6 pb-6">
        <h1 className="text-2xl font-semibold mb-4">
          Team Members ({members.length})
        </h1>

        <input
          type="text"
          placeholder="Search team members..."
          className="w-full p-3 rounded-xl bg-[#1a243b] border border-white/10 text-gray-200 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Scrollable Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {search ? "No members found" : "No team members yet"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((m) => (
              <div
                key={m.id}
                className="bg-[#1a243b] border border-white/10 rounded-xl p-5 hover:bg-[#24304c] transition"
              >
                {/* Avatar */}
                <div className="w-16 h-16 bg-blue-600/40 rounded-full mb-4 flex items-center justify-center text-2xl font-bold uppercase">
                  {m.name ? m.name[0] : "?"}
                </div>

                <h2 className="text-lg font-semibold">{m.name || "Unknown"}</h2>
                <p className="text-sm text-gray-400">{m.role || "Member"}</p>

                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xl">{m.mood || "😊"}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-lg ${
                      m.status === "online"
                        ? "bg-green-700/30 text-green-300"
                        : m.status === "busy"
                        ? "bg-yellow-700/30 text-yellow-300"
                        : "bg-gray-600/30 text-gray-300"
                    }`}
                  >
                    {m.status || "offline"}
                  </span>
                </div>

                <button
                  onClick={() => handleMessageClick(m)}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600/40 hover:bg-blue-600/60 transition py-2 rounded-lg text-sm"
                >
                  <MessageCircle size={16} />
                  Message
                </button>

                <button
                  onClick={() => setSelectedMember(m)}
                  className="mt-2 w-full flex items-center justify-center gap-2 bg-purple-600/40 hover:bg-purple-600/60 transition py-2 rounded-lg text-sm"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clean Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50 p-4">
          <div className="bg-[#1a243b] rounded-xl w-full max-w-md border border-white/10">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Profile</h2>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600/40 rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                  {selectedMember.name ? selectedMember.name[0] : "?"}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedMember.name || "Unknown"}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {selectedMember.role || "Member"}
                  </p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Email</p>
                <p className="text-sm">{selectedMember.email || "Not provided"}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Joined</p>
                <p className="text-sm">
                  {selectedMember.createdAt
                    ? new Date(
                        selectedMember.createdAt?.toDate?.() ||
                          selectedMember.createdAt
                      ).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Mood</p>
                  <span className="text-3xl">{selectedMember.mood || "😊"}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <span
                    className={`inline-block text-xs px-3 py-1 rounded-lg ${
                      selectedMember.status === "online"
                        ? "bg-green-700/30 text-green-300"
                        : selectedMember.status === "busy"
                        ? "bg-yellow-700/30 text-yellow-300"
                        : "bg-gray-600/30 text-gray-300"
                    }`}
                  >
                    {selectedMember.status || "offline"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-white/10">
              <button
                onClick={() => handleMessageClick(selectedMember)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600/40 hover:bg-blue-600/60 transition py-3 rounded-lg"
              >
                <MessageCircle size={18} />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}