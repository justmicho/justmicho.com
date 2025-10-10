// ---------- AUTO BACKEND SWITCH ----------
const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://justmicho-backend.onrender.com";

// ---------- RETRY FETCH UTILITY ----------
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.log(`Attempt ${attempt + 1} failed:`, error.message);
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw new Error(`Failed after ${maxRetries} attempts. Backend might be cold-starting.`);
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// ---------- CHAT TOGGLE ----------
function toggleChat() {
  const widget = document.getElementById("chat-widget");
  widget.style.display = widget.style.display === "none" ? "block" : "none";
}

// ---------- PREFILL CHAT ----------
function setPrompt(text) {
  document.getElementById("prompt").value = text;
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
  document.getElementById("timestamp").innerText = `${mm}/${dd}/${yyyy} ${hh}:${min}:${ss}`;
}
setInterval(updateTime, 1000);
updateTime();

// ---------- CHATBOT FUNCTION ----------
async function askBot() {
  const input = document.getElementById("prompt").value;
  const responseEl = document.getElementById("response");
  responseEl.innerText = "Thinking...";

  try {
    const response = await fetchWithRetry(`${BACKEND_URL}/chat`, {
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
"This chatbot uses HTML/CSS/JS frontend (Netlify) + Node.js backend (Render) + OpenRouter API. 
It's part of Dhimitri's personal portfolio website (justmicho.com). The site includes:
- Dynamic AI assistant widget
- Supabase-powered suggestion box
- Responsive layout and live clock
- JavaScript game demos (Guess My Number, Pig Game, Blackjack)
- GitHub + PDF resume integration."`
          },
          { role: "user", content: input },
        ],
      }),
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      responseEl.innerHTML = `
        ${data.choices[0].message.content}
        <br>
        <a href="https://justmicho.com/Dhimitri_Dinella.pdf" 
           class="resume-link" target="_blank">
          👉 Resume 👈
        </a>
      `;
    } else {
      responseEl.innerText = "Error: No response. Check backend logs.";
    }
  } catch (err) {
    responseEl.innerText = "Error: " + err.message + "\n\n(The backend may be waking up. Try again in a moment.)";
    console.error("Chat error:", err);
  }
}

// ---------- PROJECT MODAL ----------
function openModal() {
  document.getElementById("projectModal").style.display = "block";
}

function closeModal() {
  document.getElementById("projectModal").style.display = "none";
}

window.onclick = function (event) {
  const modal = document.getElementById("projectModal");
  if (event.target === modal) {
    closeModal();
  }
};

// ---------- SUGGESTION SUBMISSION ----------
async function submitSuggestion() {
  const input = document.getElementById("suggestion");
  const message = input.value.trim();
  const submitBtn = document.getElementById("submit-btn");

  if (!message) {
    alert("Please enter a suggestion.");
    return;
  }

  // Show loading state
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Submitting...";
  submitBtn.disabled = true;

  try {
    const res = await fetchWithRetry(`${BACKEND_URL}/submit-suggestion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (res.ok) {
      input.value = "";
      submitBtn.textContent = "Submitted!";
      submitBtn.style.opacity = "0.6";

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
      }, 5000);
    } else {
      const errorText = await res.text();
      console.error("Something went wrong:", errorText);
      alert("Something went wrong. Please try again.");
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  } catch (err) {
    console.error("Error submitting suggestion:", err);
    alert("Network error. The backend may be waking up. Please try again in a moment.");
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// ---------- WARM UP BACKEND ON PAGE LOAD ----------
// Ping backend when page loads to wake it up
window.addEventListener('DOMContentLoaded', () => {
  if (window.location.hostname !== "localhost") {
    console.log("Warming up backend...");
    fetch(`${BACKEND_URL}/`)
      .then(() => console.log("Backend ready!"))
      .catch(() => console.log("Backend warming up..."));
  }
});

// http://localhost:3000/chat -->
// https://justmicho-com.onrender.com/chat
// https://justmicho.com/Dhimitri_Dinella.pdf
// http://localhost:3000/submit-suggestion
// https://justmicho-com.onrender.com/submit-suggestion
