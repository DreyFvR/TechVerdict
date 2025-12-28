"use client";
import { useState, useEffect, useRef } from "react";
import PhoneComparison from "./components/PhoneComparison";

// Format bot response for better readability
function formatBotResponse(text) {
  if (!text) return text;

  let formatted = text
    .replace(/\.\s+([A-Z])/g, '.\n\n$1')
    .replace(/:\s+([A-Z])/g, ':\n$1')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return formatted;
}

export default function Page() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const chatMessagesRef = useRef(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('phoneComparisonChats');
    if (savedChats) {
      setChatHistory(JSON.parse(savedChats));
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('phoneComparisonChats', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    const newMessages = [...messages, { role: "user", text: userMessage }];
    setMessages(newMessages);
    setLoading(true);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      let updatedMessages;

      // Check if response is a comparison or plain text
      if (data.reply && typeof data.reply === 'object') {
        if (data.reply.type === 'query' || data.reply.type === 'text') {
          // Plain text response
          const formattedReply = formatBotResponse(data.reply.message || data.rawText);
          updatedMessages = [...newMessages, { role: "bot", text: formattedReply }];
        } else if (data.reply.comparison) {
          // Comparison response
          updatedMessages = [...newMessages, { role: "bot", isComparison: true, data: data.reply }];
        } else {
          // Fallback to raw text
          const formattedReply = formatBotResponse(data.rawText);
          updatedMessages = [...newMessages, { role: "bot", text: formattedReply }];
        }
      } else {
        // Old format or error
        const formattedReply = formatBotResponse(data.reply || data.rawText);
        updatedMessages = [...newMessages, { role: "bot", text: formattedReply }];
      }

      setMessages(updatedMessages);
      saveCurrentChat(updatedMessages);
    } catch (error) {
      const errorMessages = [...newMessages, { role: "bot", text: "Sorry, something went wrong. Please try again." }];
      setMessages(errorMessages);
      saveCurrentChat(errorMessages);
    }

    setLoading(false);
  };

  const handleTemplateClick = (templateText) => {
    setInput(templateText);
  };

  // Save current chat to history
  const saveCurrentChat = (newMessages) => {
    if (newMessages.length === 0) return;

    const chatTitle = extractChatTitle(newMessages);
    const chatData = {
      id: currentChatId || Date.now().toString(),
      title: chatTitle,
      messages: newMessages,
      timestamp: new Date().toISOString(),
    };

    setChatHistory((prev) => {
      const existingIndex = prev.findIndex(chat => chat.id === chatData.id);
      if (existingIndex >= 0) {
        // Update existing chat
        const updated = [...prev];
        updated[existingIndex] = chatData;
        return updated;
      } else {
        // Add new chat
        return [chatData, ...prev];
      }
    });

    if (!currentChatId) {
      setCurrentChatId(chatData.id);
    }
  };

  // Extract title from chat messages
  const extractChatTitle = (msgs) => {
    const userMsg = msgs.find(m => m.role === 'user');
    if (userMsg && userMsg.text) {
      return userMsg.text.substring(0, 50) + (userMsg.text.length > 50 ? '...' : '');
    }
    return 'New Chat';
  };

  // Start a new chat
  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setInput("");
  };

  // Load a saved chat
  const loadChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
    }
  };

  // Delete a chat
  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      handleNewChat();
    }
  };

  // Filter chats based on search query
  const filteredChats = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">⚡</div>
          <span className="sidebar-title">My Chats</span>
          <div className="menu-icon">☰</div>
        </div>

        <div className="search-container">
          <input
            type="text"
            className="search-box"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="chats-section">
          <div className="section-header">
            <span>Chats</span>
            <div className="icon-btn">⋯</div>
          </div>

          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
                onClick={() => loadChat(chat.id)}
              >
                <div className="chat-icon">💬</div>
                <div className="chat-content">
                  <div className="chat-title">{chat.title}</div>
                  <div className="chat-subtitle">
                    {new Date(chat.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <button
                  className="chat-delete-btn"
                  onClick={(e) => deleteChat(chat.id, e)}
                >
                  🗑️
                </button>
              </div>
            ))
          ) : (
            <div className="no-chats-found">
              {searchQuery ? (
                <>
                  <div className="no-chats-icon">🔍</div>
                  <div className="no-chats-text">No chats found</div>
                  <div className="no-chats-subtext">Try a different search term</div>
                </>
              ) : (
                <>
                  <div className="no-chats-icon">💬</div>
                  <div className="no-chats-text">No chats yet</div>
                  <div className="no-chats-subtext">Start comparing phones!</div>
                </>
              )}
            </div>
          )}
        </div>

        <button className="new-chat-btn" onClick={handleNewChat}>
          + New chat
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="chat-header">
          <div className="chat-header-left">
            <span className="chat-name">Abhi GPT</span>
          </div>
        </header>

        <div className="chat-messages" ref={chatMessagesRef}>
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-logo">📱</div>
              <h1 className="welcome-title">Compare Smartphones Side-by-Side</h1>
              <p className="welcome-subtitle">
                Get detailed comparisons of smartphones with pricing in Indian Rupees (₹),
                real specifications, pros & cons, and expert recommendations tailored for the Indian market.
              </p>

              <div className="prompt-templates">
                <div
                  className="template-card"
                  onClick={() => handleTemplateClick("Compare iPhone 15 and Samsung Galaxy S24")}
                >
                  <div className="template-icon">🍎</div>
                  <div className="template-title">Flagship Comparison</div>
                  <div className="template-description">
                    Compare premium flagship phones like iPhone 15 vs Samsung Galaxy S24
                  </div>
                </div>

                <div
                  className="template-card"
                  onClick={() => handleTemplateClick("Compare OnePlus 12 and Nothing Phone 2")}
                >
                  <div className="template-icon">⚡</div>
                  <div className="template-title">Performance Phones</div>
                  <div className="template-description">
                    Compare performance-focused devices with detailed specs
                  </div>
                </div>

                <div
                  className="template-card"
                  onClick={() => handleTemplateClick("Compare Pixel 8 and Vivo V29")}
                >
                  <div className="template-icon">📸</div>
                  <div className="template-title">Camera Comparison</div>
                  <div className="template-description">
                    Compare camera quality and photography features
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`}>
                  {msg.isComparison ? (
                    <PhoneComparison data={msg.data} />
                  ) : (
                    <div className="message-content">{msg.text}</div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="message bot loading">
                  <div className="message-content">Analyzing phones and comparing...</div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="input-container">

          <div className="input-wrapper">
            <div className="input-box">
              <div className="input-icon">⚡</div>
              <textarea
                className="input-field"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your prompt here..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={loading}
                rows={1}
              />
              <div className="input-actions">
                <button className="action-btn">🎤</button>
                <button
                  className="send-btn"
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                >
                  ➤
                </button>
              </div>
            </div>
            <p className="disclaimer">
              Gemini can make mistakes. Consider checking important information
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
