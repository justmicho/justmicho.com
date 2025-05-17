function toggleChat() {
  const widget = document.getElementById("chat-widget");
  widget.style.display = widget.style.display === "none" ? "block" : "none";
}

function setPrompt(text) {
  document.getElementById("prompt").value = text;
  askBot();
}

function updateTime() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const formatted = `${mm}/${dd}/${yyyy} ${hh}:${min}:${ss}`;
  document.getElementById("timestamp").innerText = formatted;
}
setInterval(updateTime, 1000);
updateTime();

async function askBot() {
  const input = document.getElementById("prompt").value;
  const responseEl = document.getElementById("response");
  responseEl.innerText = "Searching...";

  try {
    const response = await fetch("https://justmicho-com.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are an AI chatbot that knows Dhimitri Dinella very well.

Dhimitri is a U.S. Citizen and a Computer Science graduate from the University of Illinois at Chicago (UIC), class of December 2024. He earned a 3.7 GPA and was on the Dean’s List in 2023–2024. His coursework includes Software Engineering, Network Security, Database Design, and Data Structures.

He interned as a Project Manager at iCodice LLC, where he:
- Led cross-functional teams to deliver 5+ user-friendly web interfaces on time
- Analyzed and resolved website crash issues across two dev cycles
- Maintained strong communication with clients and stakeholders, achieving 95% satisfaction

Previously, he was an Assistant Property Manager at Berkshire Communities, managing over 115 units. He:
- Improved on-time rent payments to 98% with automation
- Reduced service response time by 30% with a new scheduling system

Dhimitri's key projects include:
- Hospital Management Database: Optimized SQL/ER model for 200+ patients
- Blackjack Game: JavaFX game with animated cards and smart AI logic
- Chicago Lobbyist Database App: Python + SQLite app with 50,000+ records and data visualizations using Matplotlib

He is proficient in JavaScript, Python, SQL, Java, HTML/CSS, C, and C++, and tools like Git, GitHub, Jira, IntelliJ, Arduino, and Visual Studio. Dhimitri is currently seeking roles in technical project management, automation, or software development.

If anyone asks how this chatbot works, explain:
\"This chatbot was built using HTML, CSS, and JavaScript for the frontend. It connects to a Node.js + Express backend hosted on Render and uses OpenRouter to access a GPT-like model. It’s integrated into Dhimitri’s personal site via a floating widget he designed.\"`
          },
          { role: "user", content: input }
        ]
      })
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      responseEl.innerHTML = `
        ${data.choices[0].message.content}
        <br>
        <a href="https://justmicho.com/Dhimitri_Dinella.pdf" class="resume-link" target="_blank">
          <span role="img" aria-label="point-right">👉</span>
          <span>Resume</span>
          <span role="img" aria-label="point-left">👈</span>
        </a>
      `;
    } else {
      responseEl.innerText = "Error: No response. Check backend logs.";
    }
  } catch (err) {
    responseEl.innerText = "Error: " + err.message;
  }
}

// http://localhost:3000/chat -->
// https://justmicho-com.onrender.com/chat 
// https://justmicho.com/Dhimitri_Dinella.pdf