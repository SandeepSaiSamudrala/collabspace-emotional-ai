import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ for navigation
import { subscribeToTasks } from "../../services/firestoreServices";
export default function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToTasks(setTasks);
    return () => unsubscribe();
  }, []);

  const columns = [
    {
      title: "To Do",
      color: "border-red-400",
      status: "todo",
      tasks: tasks.filter(t => t.status === "todo"),
    },
    {
      title: "In Progress",
      color: "border-yellow-400",
      status: "inprogress",
      tasks: tasks.filter(t => t.status === "inprogress"),
    },
    {
      title: "Done",
      color: "border-green-400",
      status: "completed",
      tasks: tasks.filter(t => t.status === "completed"),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
      {columns.map((col) => (
        <div
          key={col.title}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
        >
          <h2 className={`text-lg font-semibold text-gray-200 pb-3 border-b ${col.color}`}>
            {col.title} ({col.tasks.length})
          </h2>

          <div className="mt-4 space-y-3">
            {col.tasks.slice(0, 3).map((task, i) => (
              <div
                key={i}
                className="p-3 bg-white/10 rounded-lg border border-white/10 hover:bg-white/20 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-100">{task.name}</span>
                  <span className={`w-3 h-3 rounded-full ${
                    task.priority === "High"
                      ? "bg-red-500"
                      : task.priority === "Medium"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}></span>
                </div>
                <div className="mt-1 text-xs text-gray-300 italic">{task.tag || "No tag"}</div>
              </div>
            ))}
            {col.tasks.length > 3 && (
              <div className="text-xs text-gray-400 mt-1">+{col.tasks.length - 3} more</div>
            )}
          </div>

          {/* ✅ View All Button */}
          <button
            onClick={() => navigate("/tasks")}
            className="mt-4 w-full py-2 text-sm text-gray-100 bg-blue-600/30 hover:bg-blue-600/50 rounded-lg transition"
          >
            View All
          </button>
        </div>
      ))}
    </div>
  );
}

{/*export default function TaskBoard() {
  const columns = [
    {
      title: "To Do",
      color: "border-red-400",
      tasks: [
        { text: "Design new meeting flow", tag: "UI/UX", priority: "bg-red-500" },
        { text: "Prepare mood API schema", tag: "Backend", priority: "bg-red-500" },
      ],
    },
    {
      title: "In Progress",
      color: "border-yellow-400",
      tasks: [
        { text: "Build chat window layout", tag: "Frontend", priority: "bg-yellow-500" },
      ],
    },
    {
      title: "Done",
      color: "border-green-400",
      tasks: [
        { text: "Sidebar + Navbar UI", tag: "UI", priority: "bg-green-500" },
        { text: "Welcome card design", tag: "UI", priority: "bg-green-500" },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">

      {columns.map((col) => (
        <div
          key={col.title}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
        >
          
          <h2 className={`text-lg font-semibold text-gray-200 pb-3 border-b ${col.color}`}>
            {col.title}
          </h2>

        //task
          <div className="mt-4 space-y-3">
            {col.tasks.map((task, i) => (
              <div
                key={i}
                className="p-3 bg-white/10 rounded-lg border border-white/10 hover:bg-white/20 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-100">{task.text}</span>
                  <span className={`w-3 h-3 rounded-full ${task.priority}`}></span>
                </div>
                <div className="mt-1 text-xs text-gray-300 italic">{task.tag}</div>
              </div>
            ))}
          </div>

        </div>
      ))}

    </div>
  );
}*/}
