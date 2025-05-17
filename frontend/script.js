function toggleChat() {
    const widget = document.getElementById("chat-widget");
    widget.style.display = widget.style.display === "none" ? "block" : "none";
  }
  
  async function askBot() {
    const input = document.getElementById("prompt").value;
    const responseEl = document.getElementById("response");
    responseEl.innerText = "Thinking...";
  
    try {
      const response = await fetch("https://justmicho-com.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are an assistant who knows Dhimitri Dinella.
  
  Dhimitri is a Computer Science graduate from UIC (University of Illinois at Chicago), class of December 2024. He interned at iCodice as a Project Management Intern, working on performance testing, frontend dev, and QA.
  
  Projects he’s built include:
  - Seabed Secrets: an underwater mapping tool with AI + sonar/LIDAR
  - A full hospital management database (SQL/ERD)
  - A pet adoption platform with chat and application tracking
  
  He's skilled in Python, SQL, Java, HTML/CSS, React, and project coordination. He's currently looking for technical project manager, automation, or software dev roles.`
            },
            { role: "user", content: input }
          ]
        })
      });
  
      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        responseEl.innerText = data.choices[0].message.content;
      } else {
        responseEl.innerText = "Error: No response. Check backend logs.";
      }
    } catch (err) {
      responseEl.innerText = "Error: " + err.message;
    }
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
  
  setInterval(updateTime, 1000); // Update every second
  updateTime(); // Initialize immediately
  
// http://localhost:3000/chat -->
// https://justmicho-com.onrender.com/chat 