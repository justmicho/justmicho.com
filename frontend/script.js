// Toggle the visibility of the floating chat widget
function toggleChat() {
  const widget = document.getElementById("chat-widget");
  widget.style.display = widget.style.display === "none" ? "block" : "none";
}

// Prefill prompt input with a suggestion and automatically submit it
function setPrompt(text) {
  document.getElementById("prompt").value = text;
  askBot();
}

// Display current date and time, updating every second
function updateTime() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const formatted = `${mm}/${dd}/${yyyy} ${hh}:${min}:${ss}`;
  document.getElementById("timestamp").innerText = formatted;
}
setInterval(updateTime, 1000);
updateTime();

// Send prompt to backend and display AI-generated answer
async function askBot() {
  const input = document.getElementById("prompt").value;
  const responseEl = document.getElementById("response");
  responseEl.innerText =
    "Thinking...\n Sorry for the wait, I'm the only AI bot that is free.\n I will get back to you as soon as possible.";

  try {
    const response = await fetch("https://justmicho-com.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are an AI chatbot that knows Dhimitri Dinella very well.
          
          Dhimitri is a Computer Science graduate from the University of Illinois at Chicago (UIC), class of December 2024. He earned a 3.7 GPA and was on the Dean’s List in 2023–2024. His coursework includes Software Engineering, Network Security, Database Design, and Data Structures.
          
          He interned as a Project Manager at iCodice LLC, where he:
          - Led cross-functional teams to deliver 5+ user-friendly web interfaces on time
          - Analyzed and resolved website crash issues across two dev cycles
          - Maintained strong communication with clients and stakeholders, achieving 95% satisfaction
          
          Previously, he was an Assistant Property Manager at Berkshire Communities, managing over 115 units. He:
          - Improved on-time rent payments to 98% with automation
          - Reduced service response time by 30% with a new scheduling system
          
          Dhimitri's key projects include:
          - Hospital Management Database: Optimized SQL/ER model for 200+ patients
          - Blackjack Game (in progress): A browser-based card game styled like a real casino table. Built using HTML, CSS, and JavaScript with interactive UI, card animations, and player/dealer logic under development.
          - Chicago Lobbyist Database App: Python + SQLite app with 50,000+ records and data visualizations using Matplotlib
          - **Pig Game**: A two-player dice game where players race to 100 points, built using HTML, CSS, and vanilla JavaScript
          - **Guess My Number**: An interactive browser game where players try to guess a random number between 1–20, featuring real-time feedback and scoring logic in JavaScript, HTML and CSS
          
          He is proficient in JavaScript, Python, SQL, Java, HTML/CSS, C, and C++, and tools like Git, GitHub, Jira, IntelliJ, Arduino, and Visual Studio. Dhimitri is currently seeking roles in technical project management, automation, or software development.
          
          If anyone asks how this chatbot works, explain:
          "This chatbot was built using HTML, CSS, and JavaScript for the frontend. It connects to a Node.js + Express backend hosted on Render and uses OpenRouter to access a GPT-like model. It’s integrated into Dhimitri’s personal site via a floating widget he designed.

          The website also features:
          - A custom project showcase modal built with vanilla JavaScript and CSS
          - A live clock display using the JavaScript Date API
          - A suggestion box feature powered by Supabase (PostgreSQL backend as a service)
          - Responsive layout and design using media queries
          - Custom favicon and meta settings for branding
          - A set of interactive JavaScript games (Guess My Number, Pig Game, Blackjack) styled with CSS and hosted as individual project pages
          - GitHub integration and version control
          - Deployment using Netlify for the frontend and Render for the backend

          This full-stack setup enables both static content and dynamic interaction through the AI assistant and live user suggestion system."
`,
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

// Open the modal for project selection
function openModal() {
  document.getElementById("projectModal").style.display = "block";
}

// Close the modal
function closeModal() {
  document.getElementById("projectModal").style.display = "none";
}

// Close modal if clicked outside the modal content
window.onclick = function (event) {
  const modal = document.getElementById("projectModal");
  if (event.target === modal) {
    closeModal();
  }
};

// Submit a suggestion to Supabase and temporarily disable the button
async function submitSuggestion() {
  const input = document.getElementById("suggestion");
  const message = input.value.trim();
  const submitBtn = document.getElementById("submit-btn");

  if (!message) {
    alert("Please enter a suggestion.");
    return;
  }

  const res = await fetch(
    "https://wimeyvutwkbeyuwiunvu.supabase.co/rest/v1/suggestions",
    {
      method: "POST",
      headers: {
        apikey:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbWV5dnV0d2tiZXl1d2l1bnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MTIzOTQsImV4cCI6MjA2MzE4ODM5NH0.f61wLU6TqQny2JWLodONiZ4nbRnv7Z4v_orPC8iP4NY",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbWV5dnV0d2tiZXl1d2l1bnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MTIzOTQsImV4cCI6MjA2MzE4ODM5NH0.f61wLU6TqQny2JWLodONiZ4nbRnv7Z4v_orPC8iP4NY",
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ message }),
    }
  );

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
}

// http://localhost:3000/chat -->
// https://justmicho-com.onrender.com/chat
// https://justmicho.com/Dhimitri_Dinella.pdf
