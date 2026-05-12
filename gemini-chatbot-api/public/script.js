document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userMessage = userInput.value.trim();
    if (!userMessage) {
      return;
    }

    addMessageToChatBox('user', userMessage);
    userInput.value = '';

    const botMessageElement = addMessageToChatBox('bot', 'Thinking...');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      if (!response.ok) {
        botMessageElement.textContent = 'Failed to get response from server.';
        return;
      }

      const data = await response.json();

      if (data && data.result) {
        botMessageElement.innerHTML = formatAIResponse(data.result);
      } else {
        botMessageElement.textContent = 'Sorry, no response received.';
      }
    } catch (error) {
      console.error('Error fetching chat response:', error);
      botMessageElement.textContent = 'Failed to get response from server.';
    }
  });

  function addMessageToChatBox(role, content) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', `${role}-message`);
    messageElement.textContent = content; // Set as plain text initially
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageElement;
  }

  function formatAIResponse(text) {
    const lines = text.split('\n');
    let html = '';
    let inList = false;

    for (const line of lines) {
      // Process bold formatting
      let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      // Check for list items
      if (processedLine.trim().startsWith('* ') || processedLine.trim().startsWith('- ')) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += '<li>' + processedLine.trim().substring(2) + '</li>';
      } else {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        // Wrap non-list, non-empty lines in <p> tags to preserve paragraphs
        if (processedLine.trim().length > 0) {
          html += '<p>' + processedLine + '</p>';
        }
      }
    }

    // Close any open list at the end
    if (inList) {
      html += '</ul>';
    }

    return html;
  }
});
