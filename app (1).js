// ---------- API ----------
const API = "/api/tasks";

async function api(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!res.ok) throw new Error("Request failed: " + res.status);
  return res.status === 204 ? null : res.json();
}

// ---------- State ----------
let tasks = [];
let filter = "all";
let activeId = null;
let total = 25 * 60, left = total, timerId = null;

const today = new Date().toDateString();
let stats;
try { stats = JSON.parse(localStorage.getItem("fd-stats")) || { day: today, done: 0 }; }
catch { stats = { day: today, done: 0 }; }
if (stats.day !== today) stats = { day: today, done: 0 };

// ---------- Elements ----------
const $ = (id) => document.getElementById(id);
const list = $("list"), empty = $("empty"), clock = $("clock"), ring = $("ring");
const startBtn = $("start"), current = $("current");

// ---------- Tasks ----------
async function load() {
  try {
    tasks = await api(API);
    empty.textContent = "Nothing here. Add a task above to get started.";
  } catch {
    tasks = [];
    empty.textContent = "Could not reach the server. Make sure the backend is running.";
  }
  render();
}

function render() {
  list.innerHTML = "";
  const shown = tasks.filter(t =>
    filter === "all" || (filter === "done" ? t.done : !t.done));
  empty.hidden = shown.length > 0;

  shown.forEach(t => {
    const li = document.createElement("li");
    if (t.done) li.classList.add("done");
    if (t.id === activeId) li.classList.add("active");

    const cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = t.done;
    cb.setAttribute("aria-label", "Mark done: " + t.text);
    cb.onchange = async () => {
      await api(`${API}/${t.id}`, { method: "PATCH", body: JSON.stringify({ done: cb.checked }) });
      if (cb.checked && t.id === activeId) setActive(null);
      load();
    };

    const span = document.createElement("span");
    span.className = "t"; span.textContent = t.text;

    const focus = document.createElement("button");
    focus.textContent = t.id === activeId ? "Selected" : "Focus";
    focus.onclick = () => setActive(t.id);
    focus.disabled = t.done;

    const del = document.createElement("button");
    del.className = "del"; del.textContent = "Delete";
    del.onclick = async () => {
      await api(`${API}/${t.id}`, { method: "DELETE" });
      if (activeId === t.id) setActive(null);
      load();
    };

    li.append(cb, span, focus, del);
    list.appendChild(li);
  });
}

function setActive(id) {
  activeId = id;
  const t = tasks.find(x => x.id === id);
  current.textContent = t ? "Working on: " + t.text : "No task selected";
  render();
}

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = $("input").value.trim();
  if (!text) return;
  await api(API, { method: "POST", body: JSON.stringify({ text }) });
  $("input").value = "";
  load();
});

document.querySelectorAll(".f").forEach(b => b.onclick = () => {
  filter = b.dataset.f;
  document.querySelectorAll(".f").forEach(x => x.classList.toggle("on", x === b));
  render();
});

// ---------- Timer ----------
function draw() {
  const m = String(Math.floor(left / 60)).padStart(2, "0");
  const s = String(left % 60).padStart(2, "0");
  clock.textContent = `${m}:${s}`;
  ring.style.setProperty("--p", ((total - left) / total) * 100);
  document.title = timerId ? `${m}:${s} – Focus Desk` : "Focus Desk – tasks and a focus timer";
}

function stop() { clearInterval(timerId); timerId = null; startBtn.textContent = "Start"; }

function tick() {
  left--;
  if (left <= 0) {
    left = 0; stop(); draw();
    if (total === 25 * 60) {
      stats.done++;
      try { localStorage.setItem("fd-stats", JSON.stringify(stats)); } catch {}
      $("done").textContent = stats.done;
    }
    alert("Session finished!");
    return;
  }
  draw();
}

startBtn.onclick = () => {
  if (timerId) { stop(); draw(); return; }
  if (left === 0) left = total;
  timerId = setInterval(tick, 1000);
  startBtn.textContent = "Pause";
};

$("reset").onclick = () => { stop(); left = total; draw(); };

document.querySelectorAll(".mode").forEach(b => b.onclick = () => {
  stop();
  total = left = Number(b.dataset.min) * 60;
  document.querySelectorAll(".mode").forEach(x => x.classList.toggle("on", x === b));
  draw();
});

// ---------- Init ----------
$("done").textContent = stats.done;
draw();
load();
