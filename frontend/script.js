// ---------- API BASE (local vs production) ----------
// In prod we call Render directly; in dev we hit your local server.
const isLocal =
  location.hostname === "localhost" ||
  location.hostname.startsWith("127.") ||
  location.hostname.startsWith("10.") ||
  location.hostname.startsWith("192.168.");

const API_BASE = isLocal
  ? "http://localhost:3000"
  : "https://justmicho-backend.onrender.com";

window.API_BASE = API_BASE; // for console debugging
console.log("API_BASE", API_BASE);

// ---------- RETRY FETCH UTILITY ----------
async function fetchWithRetry(url, options, maxRetries = 3) {
  let lastErr;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      lastErr = err;
      const wait = Math.min(1000 * 2 ** attempt, 10000);
      console.log(
        `Attempt ${attempt + 1} failed: ${
          err?.message || err
        }. Retrying in ${wait}ms...`
      );
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr || new Error(`Failed after ${maxRetries} attempts`);
}

// ---------- CHAT TOGGLE (if used somewhere else in your UI) ----------
function toggleChat() {
  const widget = document.getElementById("chat-widget");
  if (!widget) return;
  widget.style.display = widget.style.display === "none" ? "block" : "none";
}

// ---------- PREFILL CHAT ----------
function setPrompt(text) {
  const inputEl = document.getElementById("prompt");
  if (!inputEl) return;
  inputEl.value = text;
  askBot();
}

// ---------- CLOCK DISPLAY ----------
function updateTime() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const ts = document.getElementById("timestamp");
  if (ts) ts.innerText = `${mm}/${dd}/${yyyy} ${hh}:${min}:${ss}`;
}

// ---------- CHATBOT FUNCTION ----------
async function askBot() {
  const inputEl = document.getElementById("prompt");
  const responseEl = document.getElementById("response");
  if (!inputEl || !responseEl) return;

  const input = inputEl.value;
  responseEl.innerText = "Thinking...";

  try {
    const response = await fetchWithRetry(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are an AI chatbot that knows Dhimitri Dinella very well. 
If anyone asks something unrelated to Dhimitri, politely say you only answer questions about him. 
If they ask how this chatbot works, describe the technical setup.

Dhimitri is a Computer Science graduate from the University of Illinois at Chicago (UIC), class of December 2024 (GPA 3.7, Dean's List 2023–2024). 
He studied Software Engineering, Network Security, Database Design, and Data Structures.

His most recent role was Technical Project Manager at Digital Design Corp:
- Led cross-functional work between product, R&D, finance, and engineering teams.
- Automated Product Introduction and RMA processes (saving 20–30 minutes per task).
- Built Trac automation scripts in Python (requests, BeautifulSoup, openpyxl).
- Managed hardware + SaaS project milestones and reporting.
- Documented workflows and standardized wiki templates for future teams.

Before that, he interned at iCodice LLC as a Project Manager:
- Delivered 5+ web interfaces on time.
- Solved major crash bugs across two dev cycles.
- Maintained strong communication with clients (95% satisfaction).

Projects:
- Hospital Management Database (SQL/ER for 200+ patients)
- Chicago Lobbyist Database App (Python + SQLite + Matplotlib)
- Blackjack (JS/HTML/CSS, in progress)
- Pig Game (JS/HTML/CSS)
- Guess My Number (JS/HTML/CSS)

Technical skills: JavaScript, Python, SQL, Java, HTML/CSS, C, C++; tools like Git, Jira, IntelliJ, Arduino, VS Code.

If asked how this chatbot works:
"This chatbot uses HTML/CSS/JS frontend (Netlify) + Node.js backend (Render) + OpenAI API via your backend.
It's part of Dhimitri's personal portfolio website (justmicho.com). The site includes:
- Dynamic AI assistant widget
- Supabase-powered suggestion box
- Responsive layout and live clock
- JavaScript game demos (Guess My Number, Pig Game, Blackjack)
- GitHub + PDF resume integration."`,
          },
          { role: "user", content: input },
        ],
      }),
    });

    // Defensive parsing for clearer errors
    const ct = (response.headers.get("content-type") || "").toLowerCase();
    if (!ct.includes("application/json")) {
      const text = await response.text();
      throw new Error(
        `Expected JSON, got ${response.status} ${
          response.statusText
        } (${ct}). Body: ${text.slice(0, 300)}`
      );
    }
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Backend error ${response.status}: ${
          (data && (data.error || data.message)) ||
          JSON.stringify(data).slice(0, 200)
        }`
      );
    }

    if (data?.choices?.length) {
      responseEl.innerHTML = `
        ${data.choices[0].message.content}
        <br>
        <a href="https://justmicho.com/Dhimitri_Dinella.pdf" class="resume-link" target="_blank" rel="noopener noreferrer">
          👉 Resume 👈
        </a>`;
    } else {
      responseEl.innerText = "Error: No response. Check backend logs.";
    }
  } catch (err) {
    responseEl.innerText = "Error: " + (err?.message || String(err));
    console.error("Chat error:", err);
  }
}

// ---------- PROJECT MODAL ----------
function openModal() {
  const modal = document.getElementById("projectModal");
  if (modal) modal.style.display = "block";
}
function closeModal() {
  const modal = document.getElementById("projectModal");
  if (modal) modal.style.display = "none";
}

// ---------- BINDINGS (no inline handlers) ----------
document.addEventListener("DOMContentLoaded", () => {
  // Warm up backend
  fetch(`${API_BASE}/ping`, { method: "GET" })
    .then((r) => {
      if (!r.ok) throw new Error(`/ping returned ${r.status}`);
      console.log("Backend ready!");
    })
    .catch(() => console.log("Backend warming up..."));

  // Clock
  updateTime();
  setInterval(updateTime, 1000);

  // Buttons (no inline)
  const askBtn = document.querySelector("[data-action='ask-bot']");
  if (askBtn) askBtn.addEventListener("click", askBot);

  const openModalBtn = document.querySelector("[data-action='open-modal']");
  if (openModalBtn) openModalBtn.addEventListener("click", openModal);

  const closeModalBtn = document.querySelector("[data-action='close-modal']");
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);

  // Suggestion chips
  document.querySelectorAll(".suggestions [data-prompt]").forEach((li) => {
    li.addEventListener("click", () => {
      const text = li.getAttribute("data-prompt");
      setPrompt(text || "");
    });
  });

  // Enter to submit in the search input
  const promptInput = document.getElementById("prompt");
  if (promptInput) {
    promptInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        askBot();
      }
    });
  }

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("projectModal");
    if (!modal) return;
    if (event.target === modal) closeModal();
  });
});
