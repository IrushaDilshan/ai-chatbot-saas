(function() {
  const currentScript = document.currentScript;
  const companyId = currentScript.getAttribute('data-company-id');
  
  if (!companyId) {
    console.error('Widget missing data-company-id attribute');
    return;
  }

  // Create shadow DOM container for style isolation
  const container = document.createElement('div');
  container.id = 'ai-chatbot-widget-container';
  document.body.appendChild(container);

  const shadow = container.attachShadow({ mode: 'open' });

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .widget-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      transition: transform 0.2s;
    }
    .widget-btn:hover {
      transform: scale(1.05);
    }
    .widget-window {
      position: fixed;
      bottom: 100px;
      right: 24px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      z-index: 999999;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transform: translateY(20px);
      transition: opacity 0.3s, transform 0.3s;
    }
    .widget-window.open {
      opacity: 1;
      pointer-events: all;
      transform: translateY(0);
    }
    .widget-header {
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: white;
      padding: 16px;
      font-weight: 600;
      font-size: 16px;
    }
    .widget-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f8fafc;
    }
    .message {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.4;
    }
    .message.bot {
      background: white;
      color: #334155;
      align-self: flex-start;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 2px;
    }
    .message.user {
      background: #6366f1;
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 2px;
    }
    .widget-input {
      padding: 16px;
      border-top: 1px solid #e2e8f0;
      background: white;
      display: flex;
      gap: 8px;
    }
    .widget-input input {
      flex: 1;
      padding: 10px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      outline: none;
      font-size: 14px;
    }
    .widget-input input:focus {
      border-color: #6366f1;
    }
    .widget-input button {
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0 16px;
      cursor: pointer;
      font-weight: 600;
    }
    .widget-input button:hover {
      background: #4f46e5;
    }
    .loading-dot {
      display: inline-block;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: #334155;
      animation: wave 1.3s linear infinite;
    }
    .loading-dot:nth-child(2) { animation-delay: -1.1s; }
    .loading-dot:nth-child(3) { animation-delay: -0.9s; }
    @keyframes wave {
      0%, 60%, 100% { transform: initial; }
      30% { transform: translateY(-4px); }
    }
  `;
  shadow.appendChild(style);

  // Widget Button
  const btn = document.createElement('button');
  btn.className = 'widget-btn';
  btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  shadow.appendChild(btn);

  // Widget Window
  const win = document.createElement('div');
  win.className = 'widget-window';
  
  win.innerHTML = \`
    <div class="widget-header">Support Chat</div>
    <div class="widget-messages" id="messages">
      <div class="message bot">Hello! How can I help you today?</div>
    </div>
    <div class="widget-input">
      <input type="text" id="chat-input" placeholder="Type your message..." />
      <button id="send-btn">Send</button>
    </div>
  \`;
  shadow.appendChild(win);

  let isOpen = false;
  btn.addEventListener('click', () => {
    isOpen = !isOpen;
    if (isOpen) {
      win.classList.add('open');
      btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    } else {
      win.classList.remove('open');
      btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    }
  });

  const messagesDiv = win.querySelector('#messages');
  const input = win.querySelector('#chat-input');
  const sendBtn = win.querySelector('#send-btn');

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = \`message \${sender}\`;
    msg.textContent = text;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function addLoading() {
    const msg = document.createElement('div');
    msg.className = 'message bot loading';
    msg.innerHTML = '<span class="loading-dot"></span> <span class="loading-dot"></span> <span class="loading-dot"></span>';
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return msg;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';

    const loadingMsg = addLoading();

    // Determine backend URL (fallback to same origin or localhost:5000 if not specified, but assume the script is served from backend)
    // Extract backend base URL from script src if possible
    const scriptSrc = currentScript.src;
    const backendUrl = scriptSrc ? new URL(scriptSrc).origin : 'http://localhost:5000';

    try {
      const response = await fetch(\`\${backendUrl}/api/chat\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          message: text
        })
      });

      const data = await response.json();
      loadingMsg.remove();

      if (response.ok && data.reply) {
        addMessage(data.reply, 'bot');
      } else {
        addMessage(data.error || 'Sorry, something went wrong.', 'bot');
      }
    } catch (err) {
      loadingMsg.remove();
      addMessage('Network error. Please try again later.', 'bot');
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
