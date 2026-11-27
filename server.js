const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "tasks.json");

app.use(cors());
app.use(express.json());

// ---------- Simple JSON-file storage ----------
function readTasks() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return []; }
}
function writeTasks(tasks) {
  fs.writeFileSync(DB_FILE, JSON.stringify(tasks, null, 2));
}

// ---------- REST API ----------
// Get all tasks
app.get("/api/tasks", (req, res) => {
  res.json(readTasks());
});

// Add a task
app.post("/api/tasks", (req, res) => {
  const text = (req.body.text || "").trim();
  if (!text) return res.status(400).json({ error: "Task text is required" });
  const task = { id: Date.now(), text, done: false };
  const tasks = readTasks();
  tasks.unshift(task);
  writeTasks(tasks);
  res.status(201).json(task);
});

// Update a task (mark done / undone)
app.patch("/api/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const task = tasks.find(t => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found" });
  if (typeof req.body.done === "boolean") task.done = req.body.done;
  if (typeof req.body.text === "string" && req.body.text.trim()) task.text = req.body.text.trim();
  writeTasks(tasks);
  res.json(task);
});

// Delete a task
app.delete("/api/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const next = tasks.filter(t => t.id !== Number(req.params.id));
  if (next.length === tasks.length) return res.status(404).json({ error: "Task not found" });
  writeTasks(next);
  res.status(204).end();
});

// ---------- Serve the frontend ----------
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.listen(PORT, () => console.log(`Focus Desk running at http://localhost:${PORT}`));
