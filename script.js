// Point directly to Render backend
const API = "https://voice-backend-im8x.onrender.com";

// Shortcuts
const qs = (s) => document.querySelector(s);
const logsEl = qs("#logs");
const statusEl = qs("#status");

// ------------------- API Helpers -------------------
async function getStatus() {
  try {
    const r = await fetch(`${API}/status`);
    const data = await r.json();
    statusEl.textContent = `Status: ${
      data.running ? "running" : "stopped"
    } | main: ${data.main}`;
  } catch (e) {
    statusEl.textContent = "Status: API not reachable";
  }
}

async function refreshLogs() {
  try {
    const r = await fetch(`${API}/logs?n=500`);
    const data = await r.json();
    logsEl.innerHTML = "";
    data.lines.forEach((line) => {
      const div = document.createElement("div");
      div.className = "log-line";
      div.textContent = line;
      logsEl.appendChild(div);
    });
    logsEl.scrollTop = logsEl.scrollHeight;
  } catch (e) {
    // ignore if logs not available
  }
}

async function post(path) {
  const r = await fetch(`${API}${path}`, { method: "POST" });
  if (!r.ok) throw new Error("Request failed");
}

async function sendRaw(text) {
  const r = await fetch(`${API}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!r.ok) throw new Error("Send failed");
}

// ------------------- Button Actions -------------------
qs("#btnStart").addEventListener("click", async () => {
  await post("/start");
  await getStatus();
  await refreshLogs();
});

qs("#btnStop").addEventListener("click", async () => {
  await post("/stop");
  await getStatus();
  await refreshLogs();
});

qs("#btnQuit").addEventListener("click", async () => {
  await post("/quit");
  await getStatus();
  await refreshLogs();
});

qs("#btnSend").addEventListener("click", async () => {
  const v = qs("#manualInput").value;
  if (v.trim().length === 0) return;
  await sendRaw(v);
  qs("#manualInput").value = "";
  await refreshLogs();
});

// ------------------- Auto Refresh -------------------
setInterval(() => {
  getStatus();
  refreshLogs();
}, 1500);

getStatus();
refreshLogs();
