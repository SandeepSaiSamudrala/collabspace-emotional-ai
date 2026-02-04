import { useState, useEffect } from "react";
import { Plus, X, Trash2, Pencil } from "lucide-react";
import { auth } from "../services/firebase";
import { createNotification } from '../services/firestoreServices';
import analyzeTaskLoad  from "../services/taskLoadService";

import { 
  createTask, 
  subscribeToTasks, 
  updateTask, 
  deleteTask 
} from "../services/firestoreServices";

export default function Tasks() {
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [editInfo, setEditInfo] = useState({ isEditing: false, taskId: null });
  // Analyze task load (read-only)
  const taskLoad = analyzeTaskLoad(allTasks);
  const loadStyles = {
  high: "border-yellow-400/20",
  overload: "border-red-400/20",
  normal: "border-white/10",
};

console.log("TASK LOAD DEBUG:", taskLoad, allTasks);

  const [form, setForm] = useState({
    name: "",
    tag: "",
    priority: "Low",
    status: "todo",
  });

  const columns = [
    { key: "todo", title: "To Do", color: "bg-blue-500" },
    { key: "inprogress", title: "In Progress", color: "bg-yellow-500" },
    { key: "completed", title: "Completed", color: "bg-green-500" },
  ];

  // Load tasks from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToTasks((tasks) => {
      setAllTasks(tasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Group tasks by status
  const groupedTasks = {
    todo: allTasks.filter(t => t.status === 'todo'),
    inprogress: allTasks.filter(t => t.status === 'inprogress'),
    completed: allTasks.filter(t => t.status === 'completed'),
  };

  // Add or update task
  const handleAddTask = async () => {
    if (!form.name.trim()) return;

    try {
      if (editInfo.isEditing) {
        // Update existing task
        await updateTask(editInfo.taskId, {
          name: form.name,
          tag: form.tag,
          priority: form.priority,
          status: form.status,
        });
      } else {
        // Create new task
        if (!auth.currentUser) {
  alert("User not authenticated");
  return;
}

await createTask({
  name: form.name,
  tag: form.tag,
  priority: form.priority,
  status: form.status,
  userId: auth.currentUser.uid, // ✅ REQUIRED
});
// ✅ ADD NOTIFICATION - Notify yourself about new task
      await createNotification({
        userId: auth.currentUser?.uid,
        type: 'task',
        title: 'New task created',
        body: `Task "${form.name}" has been added to ${form.status === 'todo' ? 'To Do' : form.status === 'inprogress' ? 'In Progress' : 'Completed'}`,
        actor: 'You',
        icon: 'task'
      });
    

      }

      setForm({ name: "", tag: "", priority: "Low", status: "todo" });
      setEditInfo({ isEditing: false, taskId: null });
      setShowModal(false);
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Failed to save task");
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    if (!confirm("Delete this task?")) return;

    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task");
    }
  };

  // Start editing
  const startEdit = (task) => {
    setForm({
      name: task.name,
      tag: task.tag,
      priority: task.priority,
      status: task.status,
    });

    setEditInfo({ isEditing: true, taskId: task.id });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0f1524] text-gray-200">
        <p className="text-xl">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 bg-[#0f1524] text-gray-200">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-sm text-gray-400 mt-1">
            {allTasks.length} total tasks
          </p>
        </div>

                            {taskLoad.message && (
                <div
                  className={`
                    mb-6 rounded-2xl p-4
                    bg-gradient-to-br from-[#1a2a3a]/80 to-[#0f1b2a]/80
                    border ${loadStyles[taskLoad.level]}
                    shadow-[0_0_0_1px_rgba(255,255,255,0.03)]
                  `}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
                      {taskLoad.level === "overload" && "🫂"}
                      {taskLoad.level === "high" && "🌤️"}
                      {taskLoad.level === "normal" && "🙂"}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-rose-200/90">
                        Task Load Insight
                      </h4>
                      <p className="text-xs text-sky-200/80">
                        A gentle check on your workload
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  <p className="text-emerald-200/90 mt-3 text-sm leading-relaxed">
                    {taskLoad.message}
                  </p>

                  {/* Meta */}
                  <div className="mt-3 text-xs text-gary-400 flex gap-3">
                    <span>📋 Active: {taskLoad.activeCount}</span>
                    {taskLoad.dueSoonCount > 0 && (
                      <span>⏰ Due soon: {taskLoad.dueSoonCount}</span>
                    )}
                  </div>
                </div>
              )}


        <button
          onClick={() => {
            setEditInfo({ isEditing: false, taskId: null });
            setForm({ name: "", tag: "", priority: "Low", status: "todo" });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600/40 hover:bg-blue-600/60 px-4 py-2 rounded-lg transition"
        >
          <Plus size={18} /> Add Task
        </button>
      </div>

      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search tasks..."
        className="w-full p-3 mb-6 rounded-lg bg-[#1a243b] border border-white/10 outline-none"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* COLUMNS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {columns.map((col) => {
          const filteredTasks = groupedTasks[col.key].filter((t) =>
            t.name.toLowerCase().includes(search.toLowerCase())
          );

          return (
            <div
              key={col.key}
              className="bg-[#1a243b] p-5 rounded-xl border border-white/10"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${col.color}`}></span>
                  {col.title}
                  <span className="text-sm text-gray-400">
                    ({filteredTasks.length})
                  </span>
                </h2>

                <button
                  onClick={() => {
                    setEditInfo({ isEditing: false, taskId: null });
                    setForm((f) => ({ ...f, status: col.key }));
                    setShowModal(true);
                  }}
                  className="p-1 rounded-lg hover:bg-white/10 transition"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Tasks */}
              <div className="flex flex-col gap-3">
                {filteredTasks.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    {search ? "No tasks found" : "No tasks yet"}
                  </p>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-[#212d45] p-4 rounded-lg border border-white/5 hover:bg-[#2b3a54] transition"
                    >
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{task.name}</h3>

                        {/* Edit / Delete */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(task)}
                            className="text-yellow-300 hover:text-yellow-400"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 mt-1">
                        {task.tag || "No tag"}
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-md ${
                            task.priority === "High"
                              ? "bg-red-700/30 text-red-300"
                              : task.priority === "Medium"
                              ? "bg-yellow-700/30 text-yellow-300"
                              : "bg-blue-700/30 text-blue-300"
                          }`}
                        >
                          {task.priority}
                        </span>

                        <div className="w-6 h-6 bg-gray-500 rounded-full"></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a243b] w-full max-w-md p-6 rounded-xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editInfo.isEditing ? "Edit Task" : "Add Task"}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X size={22} />
              </button>
            </div>

            {/* Inputs */}
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Task name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="p-3 rounded-lg bg-[#212d45] border border-white/10 outline-none"
                autoFocus
              />

              <input
                type="text"
                placeholder="Tag (e.g., Frontend, Design)"
                value={form.tag}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tag: e.target.value }))
                }
                className="p-3 rounded-lg bg-[#212d45] border border-white/10 outline-none"
              />

              <select
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priority: e.target.value }))
                }
                className="p-3 rounded-lg bg-[#212d45] border border-white/10 outline-none"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                className="p-3 rounded-lg bg-[#212d45] border border-white/10 outline-none"
              >
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <button
                onClick={handleAddTask}
                disabled={!form.name.trim()}
                className="w-full bg-blue-600/40 hover:bg-blue-600/60 py-3 rounded-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {editInfo.isEditing ? "Save Changes" : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

