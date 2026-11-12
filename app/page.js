"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CategorySelector from "./components/CategorySelector";
import LaptopComparison from "./components/LaptopComparison";
import PhoneComparison from "./components/PhoneComparison";

const STORAGE_KEY = "techVerdictChats";
const LEGACY_STORAGE_KEY = "phoneComparisonChats";

const templates = {
  smartphone: [
    {
      icon: "01",
      title: "Flagship Matchup",
      description: "Premium cameras, displays, battery, pricing, and long-term value.",
      prompt: "Compare iPhone 15 and Samsung Galaxy S24",
    },
    {
      icon: "02",
      title: "Performance Pick",
      description: "Chipset, thermals, charging, gaming, and everyday smoothness.",
      prompt: "Compare OnePlus 12 and Nothing Phone 2",
    },
    {
      icon: "03",
      title: "Camera Decision",
      description: "Photo quality, video, portraits, low light, and creator features.",
      prompt: "Compare Pixel 8 and Vivo V29",
    },
  ],
  laptop: [
    {
      icon: "01",
      title: "Creator Workhorse",
      description: "CPU, GPU, display, ports, battery, and professional workflows.",
      prompt: "Compare MacBook Pro 14 and Dell XPS 15",
    },
    {
      icon: "02",
      title: "Gaming Rig",
      description: "GPU power, cooling, high-refresh displays, and upgrade value.",
      prompt: "Compare ASUS ROG Strix and MSI Katana",
    },
    {
      icon: "03",
      title: "Student Value",
      description: "Budget, durability, performance, keyboard, battery, and service.",
      prompt: "Compare HP Pavilion and Lenovo IdeaPad",
    },
  ],
};

function formatBotResponse(text) {
  if (!text) return "I could not read that response. Please try again.";

  return String(text)
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .replace(/\*\*/g, "")
    .replace(/\.\s+([A-Z0-9])/g, ".\n\n$1")
    .replace(/:\s+([A-Z0-9])/g, ":\n$1")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function createChatId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeError(error, status) {
  if (error?.name === "AbortError") return "Request cancelled.";
  if (status === 408) return "That comparison took too long. Try a narrower request.";
  if (status === 429) return "Too many requests right now. Please wait a moment and try again.";
  return "I could not complete that request. Please try again.";
}

function buildBotMessage(data) {
  if (data?.reply && typeof data.reply === "object") {
    if (data.reply.comparison) {
      return { role: "bot", isComparison: true, data: data.reply };
    }

    return {
      role: "bot",
      text: formatBotResponse(data.reply.message || data.rawText || data.error),
    };
  }

  return { role: "bot", text: formatBotResponse(data?.reply || data?.rawText || data?.error) };
}

export default function Page() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("smartphone");
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatMessagesRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    try {
      const savedChats =
        localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (savedChats) setChatHistory(JSON.parse(savedChats));
    } catch {
      setChatHistory([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory.slice(0, 30)));
  }, [chatHistory]);

  useEffect(() => {
    chatMessagesRef.current?.scrollTo({
      top: chatMessagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    return () => requestRef.current?.abort();
  }, []);

  const filteredChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return chatHistory;
    return chatHistory.filter((chat) => chat.title.toLowerCase().includes(query));
  }, [chatHistory, searchQuery]);

  const activeTemplates = templates[category];
  const heading =
    category === "smartphone" ? "Find the phone worth buying" : "Choose the right laptop";

  const saveCurrentChat = (newMessages, id = currentChatId) => {
    if (!newMessages.length) return null;

    const nextId = id || createChatId();
    const userMsg = newMessages.find((message) => message.role === "user");
    const title = userMsg?.text
      ? `${userMsg.text.slice(0, 56)}${userMsg.text.length > 56 ? "..." : ""}`
      : "New comparison";

    const chatData = {
      id: nextId,
      title,
      category,
      messages: newMessages,
      timestamp: new Date().toISOString(),
    };

    setChatHistory((prev) => {
      const withoutCurrent = prev.filter((chat) => chat.id !== nextId);
      return [chatData, ...withoutCurrent].slice(0, 30);
    });

    setCurrentChatId(nextId);
    return nextId;
  };

  const submitRequest = async ({ message, displayMessage = message, geekMode = false }) => {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    const nextMessages = [...messages, { role: "user", text: displayMessage }];
    const chatId = currentChatId || createChatId();

    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setCurrentChatId(chatId);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, category, geekMode }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));
      const updatedMessages = [
        ...nextMessages,
        res.ok ? buildBotMessage(data) : { role: "bot", text: normalizeError(null, res.status) },
      ];

      setMessages(updatedMessages);
      saveCurrentChat(updatedMessages, chatId);
    } catch (error) {
      if (error?.name !== "AbortError") {
        const errorMessages = [...nextMessages, { role: "bot", text: normalizeError(error) }];
        setMessages(errorMessages);
        saveCurrentChat(errorMessages, chatId);
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  };

  const sendMessage = () => submitRequest({ message: input });

  const handleGeekModeRequest = (laptop1, laptop2) => {
    const geekMessage = `Show me detailed geek mode comparison with gaming FPS, rendering benchmarks, and all technical details for ${laptop1.brand} ${laptop1.name} vs ${laptop2.brand} ${laptop2.name}`;

    submitRequest({
      message: geekMessage,
      displayMessage: "Requesting technical deep dive",
      geekMode: true,
    });
  };

  const handleNewChat = () => {
    requestRef.current?.abort();
    setMessages([]);
    setCurrentChatId(null);
    setInput("");
    setLoading(false);
    setSidebarOpen(false);
  };

  const loadChat = (chatId) => {
    const chat = chatHistory.find((item) => item.id === chatId);
    if (!chat) return;
    requestRef.current?.abort();
    setMessages(chat.messages);
    setCurrentChatId(chatId);
    setCategory(chat.category || "smartphone");
    setLoading(false);
    setSidebarOpen(false);
  };

  const deleteChat = (chatId, event) => {
    event.stopPropagation();
    setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) handleNewChat();
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="top-navbar">
        <div className="nav-logo">AbhiGPT</div>
        <div className="nav-actions">
          <button className="nav-icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
          <button className="nav-icon-btn profile-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
        </div>
      </header>

      <div className="content-wrapper">
        {sidebarOpen && <button className="scrim" onClick={() => setSidebarOpen(false)} />}

        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <span className="sidebar-title">PREVIOUS CHATS</span>
            <button className="history-icon-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </button>
          </div>

          <button className="new-chat-btn" onClick={handleNewChat}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>New Chat</span>
          </button>

          <div className="search-container">
            <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="search-box"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="chats-section">
            {/* Hardcoded chats to match image for visual fidelity, fallback to real state if any exist */}
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  className={`chat-item ${currentChatId === chat.id ? "active" : ""}`}
                  onClick={() => loadChat(chat.id)}
                >
                  <span className="chat-content">
                    <span className="chat-title">{chat.title}</span>
                    <span className="chat-subtitle">
                      {new Date(chat.timestamp).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </span>
                </button>
              ))
            ) : (
              <>
                <button className="chat-item active">
                  <span className="chat-content">
                    <span className="chat-title">iPhone 15 Pro vs S24 Ultra</span>
                    <span className="chat-subtitle">2 hours ago</span>
                  </span>
                </button>
                <button className="chat-item">
                  <span className="chat-content">
                    <span className="chat-title">MacBook Pro vs Dell XPS</span>
                    <span className="chat-subtitle">Yesterday</span>
                  </span>
                </button>
                <button className="chat-item">
                  <span className="chat-content">
                    <span className="chat-title">RTX 4090 Performance...</span>
                    <span className="chat-subtitle">3 days ago</span>
                  </span>
                </button>
              </>
            )}
          </div>
        </aside>

        <main className="main-content">
          <div className="chat-messages" ref={chatMessagesRef}>
            {!messages.length ? (
              <section className="welcome-screen">
                <div className="welcome-kicker">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="kicker-icon">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                  AI-POWERED INSIGHTS
                </div>
                <h1 className="welcome-title">Technical Mastery<br/>Simplified.</h1>
                <p className="welcome-subtitle">
                  Ask our expert AI anything about hardware specifications,<br/>performance benchmarks, and value comparisons.
                </p>

                <div className="category-selector-wrapper">
                  <div className="category-selector">
                    <button
                      className={`category-btn ${category === 'smartphone' ? 'active' : ''}`}
                      onClick={() => setCategory('smartphone')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                        <line x1="12" y1="18" x2="12.01" y2="18"></line>
                      </svg>
                      Smartphones
                    </button>
                    <button
                      className={`category-btn ${category === 'laptop' ? 'active' : ''}`}
                      onClick={() => setCategory('laptop')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="2" y1="21" x2="22" y2="21"></line>
                      </svg>
                      Laptops
                    </button>
                  </div>
                </div>

                <div className="center-input-wrapper">
                  <div className="center-input-box">
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                    <input
                      className="center-input-field"
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder={`Which ${category === "smartphone" ? "smartphones" : "laptops"} should I compare?`}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          sendMessage();
                        }
                      }}
                      disabled={loading}
                    />
                    <button className="center-send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
                      {loading ? "..." : "Compare"}
                    </button>
                  </div>
                </div>
              </section>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div key={`${msg.role}-${index}`} className={`message ${msg.role}`}>
                    <div className="message-avatar">
                      {msg.role === "user" ? (
                        <span className="user-icon">U</span>
                      ) : (
                        <span className="ai-icon">TV</span>
                      )}
                    </div>
                    <div className="message-container">
                      {msg.isComparison ? (
                        msg.data.phone1 ? (
                          <PhoneComparison data={msg.data} />
                        ) : (
                          <LaptopComparison
                            data={msg.data}
                            onRequestGeekMode={handleGeekModeRequest}
                          />
                        )
                      ) : (
                        <div className="message-content">{msg.text}</div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="message bot loading">
                    <div className="message-avatar">AI</div>
                    <div className="message-container">
                      <div className="message-content">
                        <span className="loader-dot" />
                        Comparing real-world trade-offs...
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {messages.length > 0 && (
            <div className="input-container">
              <div className="input-wrapper">
                <div className="input-box">
                  <textarea
                    className="input-field"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={`Ask for a ${category === "smartphone" ? "phone" : "laptop"} comparison...`}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={loading}
                    rows={1}
                  />
                  <button className="send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
                    {loading ? "..." : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
