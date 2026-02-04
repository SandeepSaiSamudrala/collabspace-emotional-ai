// src/services/taskLoadService.js

export default function analyzeTaskLoad(tasks = []) {
  const now = new Date();

  // Active tasks (not completed)
  const activeTasks = tasks.filter(
    (t) => t.status !== "completed"
  );


  let level = "normal"; // normal | high | overload
  let message = null;

  if (activeTasks.length >= 2 ) {
    level = "high";
    message =
      "Your task load is getting heavy. Consider focusing on fewer priorities today.";
  }

  if (activeTasks.length >= 12) {
    level = "overload";
    message =
      "You have a very high number of active tasks. It may help to pause and reprioritize.";
  }

  return {
    activeCount: activeTasks.length,
    level,
    message,
  };
}
