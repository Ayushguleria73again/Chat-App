"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  _id: string;
  user: string;
  text: string;
  createdAt: string;
}

interface ChatProps {
  initialMessages: Message[];
}

export default function Chat({ initialMessages }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [inputText, setInputText] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on initial load and when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, joined]);

  useEffect(() => {
    if (joined && !socketRef.current) {
      // Connect to socket only when joined
      socketRef.current = io();

      socketRef.current.emit("join", username);

      socketRef.current.on("message", (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
      });

      socketRef.current.on("user-joined", (user: string) => {
        // Optional: Could add a system message here
        console.log(`${user} joined the chat`);
      });

      socketRef.current.on("user-left", (user: string) => {
         console.log(`${user} left the chat`);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [joined, username]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setJoined(true);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && socketRef.current) {
      socketRef.current.emit("message", {
        user: username,
        text: inputText,
      });
      setInputText("");
    }
  };

  if (!joined) {
    return (
      <div className="join-container">
        <div className="join-card">
          <h2>Welcome to Global Chat</h2>
          <form onSubmit={handleJoin}>
            <input
              type="text"
              placeholder="Enter your username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <button type="submit">Join Chat</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Global Room</h1>
        <div className="username-tag">{username}</div>
      </header>

      <div className="message-list" ref={scrollRef}>
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message-item ${msg.user === username ? "own" : "other"}`}
          >
            <div className="message-bubble">{msg.text}</div>
            <div className="message-info">
              <span className="user-name">{msg.user}</span>
              <span className="timestamp">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="message-input-area">
        <form className="message-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" disabled={!inputText.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
