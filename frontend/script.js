// ---------- AUTO BACKEND SWITCH ----------
const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://justmicho-backend.onrender.com";

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
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are an AI chatbot that knows Dhimitri Dinella very well. 
If anyone asks something unrelated to Dhimitri, politely say you only answer questions about him. 
If they ask how this chatbot works, describe the technical setup.

Dhimitri is a Computer Science graduate from the University of Illinois at Chicago (UIC), class of December 2024 (GPA 3.7, Dean’s List 2023–2024). 
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
“This chatbot uses HTML/CSS/JS frontend (Netlify) + Node.js backend (Render) + OpenRouter API. 
It’s part of Dhimitri’s personal portfolio website (justmicho.com). The site includes:
- Dynamic AI assistant widget
- Supabase-powered suggestion box
- Responsive layout and live clock
- JavaScript game demos (Guess My Number, Pig Game, Blackjack)
- GitHub + PDF resume integration.”`
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
    responseEl.innerText = "Error: " + err.message;
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

  try {
    const res = await fetch(`${BACKEND_URL}/submit-suggestion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (res.ok) {
      input.value = "";
      submitBtn.textContent = "Submitted!";
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.6";

      setTimeout(() => {
        submitBtn.textContent = "Submit";
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
      }, 5000);
    } else {
      const errorText = await res.text();
      console.error("Something went wrong:", errorText);
      alert("Something went wrong. Please try again.");
    }
  } catch (err) {
    console.error("Error submitting suggestion:", err);
    alert("Network error. Please try again.");
  }
}


// http://localhost:3000/chat -->
// https://justmicho-com.onrender.com/chat
// https://justmicho.com/Dhimitri_Dinella.pdf
// http://localhost:3000/submit-suggestion
// https://justmicho-com.onrender.com/submit-suggestion
