// ============================================
// CONFIGURATION
// ============================================

// API Base URL - Update this to match your backend
const API_BASE = window.location.origin; // Uses current domain
// Or set explicitly: const API_BASE = 'https://your-backend-url.com';

// ============================================
// EVENT LISTENERS - Add at the top
// ============================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  
  // Modal functionality
  const openModalBtn = document.getElementById('openModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const projectModal = document.getElementById('projectModal');
  
  if (openModalBtn) {
    openModalBtn.addEventListener('click', openModal);
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }
  
  // Close modal when clicking outside of it
  window.addEventListener('click', function(event) {
    if (event.target === projectModal) {
      closeModal();
    }
  });

  // Search functionality
  const searchBtn = document.getElementById('searchBtn');
  const promptInput = document.getElementById('prompt');
  
  if (searchBtn) {
    searchBtn.addEventListener('click', askBot);
  }
  
  if (promptInput) {
    promptInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        askBot();
      }
    });
  }

  // Suggestion functionality
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', submitSuggestion);
  }

  // Suggestion list items
  const suggestionItems = document.querySelectorAll('.suggestions li');
  suggestionItems.forEach(function(li) {
    li.addEventListener('click', function() {
      const promptText = this.getAttribute('data-prompt');
      if (promptInput) {
        promptInput.value = promptText;
        askBot();
      }
    });
  });

  // Initialize timestamp
  updateTimestamp();
  setInterval(updateTimestamp, 1000);
});

// ============================================
// MODAL FUNCTIONS
// ============================================

function openModal() {
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.style.display = 'block';
  }
}

function closeModal() {
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// ============================================
// CHATBOT FUNCTIONS
// ============================================

async function askBot() {
  const promptInput = document.getElementById('prompt');
  const responseBox = document.getElementById('response');
  const prompt = promptInput.value.trim();

  if (!prompt) {
    responseBox.textContent = 'Please enter a question!';
    return;
  }

  responseBox.textContent = 'Thinking...';

  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt }),
    });

    // Check if response is OK
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server did not return JSON response');
    }

    const text = await response.text();
    
    // Check if response is empty
    if (!text || text.trim() === '') {
      throw new Error('Server returned empty response');
    }

    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', text);
      throw new Error('Invalid JSON response from server');
    }

    responseBox.textContent = data.response || data.message || 'No response received.';
    
  } catch (error) {
    console.error('Chat error:', error);
    
    // User-friendly error messages
    if (error.message.includes('404')) {
      responseBox.textContent = '⚠️ Backend not available. Please check if your server is running.';
    } else if (error.message.includes('Failed to fetch')) {
      responseBox.textContent = '⚠️ Cannot connect to server. Please check your internet connection.';
    } else if (error.message.includes('JSON')) {
      responseBox.textContent = '⚠️ Server returned invalid data. Please try again.';
    } else {
      responseBox.textContent = `⚠️ Error: ${error.message}`;
    }
  }
}

// ============================================
// SUGGESTION FUNCTIONS
// ============================================

async function submitSuggestion() {
  const suggestionTextarea = document.getElementById('suggestion');
  const submitBtn = document.getElementById('submit-btn');
  const suggestion = suggestionTextarea.value.trim();

  if (!suggestion) {
    alert('Please enter a suggestion!');
    return;
  }

  // Disable button and show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    const response = await fetch(`${API_BASE}/suggestion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ suggestion: suggestion }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    // Check for empty response
    const text = await response.text();
    if (!text || text.trim() === '') {
      // If empty but status is OK, treat as success
      alert('Thank you for your suggestion!');
      suggestionTextarea.value = '';
      return;
    }

    const data = JSON.parse(text);
    alert(data.message || 'Thank you for your suggestion!');
    suggestionTextarea.value = '';
    
  } catch (error) {
    console.error('Suggestion error:', error);
    
    if (error.message.includes('404')) {
      alert('⚠️ Suggestion endpoint not available. Your feedback has been logged locally.');
      // Optional: Save to localStorage as backup
      saveSuggestionLocally(suggestion);
      suggestionTextarea.value = '';
    } else {
      alert(`⚠️ Error submitting suggestion: ${error.message}`);
    }
  } finally {
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
}

// Backup: Save suggestions locally if server is unavailable
function saveSuggestionLocally(suggestion) {
  try {
    const suggestions = JSON.parse(localStorage.getItem('suggestions') || '[]');
    suggestions.push({
      text: suggestion,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('suggestions', JSON.stringify(suggestions));
    console.log('Suggestion saved locally:', suggestion);
  } catch (e) {
    console.error('Could not save suggestion locally:', e);
  }
}

// ============================================
// TIMESTAMP FUNCTION
// ============================================

function updateTimestamp() {
  const timestampDiv = document.getElementById('timestamp');
  if (timestampDiv) {
    const now = new Date();
    const options = { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false
    };
    timestampDiv.textContent = now.toLocaleString('en-US', options).replace(',', '');
  }
}

// ============================================
// INITIALIZATION LOG
// ============================================

console.log('Backend warming up...');
console.log('API_BASE:', API_BASE);