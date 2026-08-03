import React, { useState, useRef, useEffect } from "react";
import { Send, Search, MoreHorizontal, Phone, Video, Smile, Paperclip, ArrowLeft } from "lucide-react";

const T = {
  bg: "#f8faf9",
  card: "#ffffff",
  border: "rgba(0,0,0,0.06)",
  text: "#1e2922",
  textSec: "#47554b",
  textMut: "#8fa295",
  primary: "#1b6336",
  primaryLight: "rgba(27,99,54,0.06)",
  accent: "#10b981",
  shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
  shadowLg: "0 10px 15px -3px rgba(0, 0, 0, 0.06)",
  radius: "16px",
  radiusSm: "10px",
};

const initials = (name) => {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase()).join("");
};

const Avatar = ({ name, size = 40, online = false }) => {
  const colors = ["#1b6336", "#134a27", "#10b981", "#065f46", "#0f766e", "#0d9488"];
  const idx = name ? name.length % colors.length : 0;
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: colors[idx], color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 600, fontSize: size * 0.36,
      }}>
        {initials(name)}
      </div>
      {online && (
        <div style={{
          position: "absolute", bottom: 1, right: 1,
          width: size * 0.22, height: size * 0.22,
          borderRadius: "50%", background: "#22c55e",
          border: `2px solid ${T.card}`,
        }} />
      )}
    </div>
  );
};

// ─── DUMMY DATA ───────────────────────────────────────────────────────────
const DUMMY_CONVERSATIONS = [
  {
    id: "c1",
    name: "Fatima Chowdhury",
    university: "BUET",
    lastMessage: "Thanks for the notes! Really helped with my exam 😊",
    time: "2m",
    unread: 2,
    online: true,
    messages: [
      { id: 1, from: "them", text: "Hey! Did you finish the assignment for discrete math?", time: "10:30 AM" },
      { id: 2, from: "me", text: "Yeah, just submitted it. It was quite tough honestly", time: "10:32 AM" },
      { id: 3, from: "them", text: "Could you share your notes? I'm really struggling with graph theory", time: "10:33 AM" },
      { id: 4, from: "me", text: "Sure! I'll send over what I have. Give me a sec", time: "10:35 AM" },
      { id: 5, from: "them", text: "Thanks for the notes! Really helped with my exam 😊", time: "10:40 AM" },
    ],
  },
  {
    id: "c2",
    name: "Rafiul Islam",
    university: "DU",
    lastMessage: "Are you looking for a roommate in Mirpur?",
    time: "1h",
    unread: 0,
    online: true,
    messages: [
      { id: 1, from: "them", text: "I saw your post about looking for housing near campus", time: "Yesterday" },
      { id: 2, from: "me", text: "Yes! Still searching. The rent is really high solo", time: "Yesterday" },
      { id: 3, from: "them", text: "Are you looking for a roommate in Mirpur?", time: "Yesterday" },
    ],
  },
  {
    id: "c3",
    name: "Nusrat Jahan",
    university: "NSU",
    lastMessage: "The study group meets at 4pm in the library",
    time: "3h",
    unread: 1,
    online: false,
    messages: [
      { id: 1, from: "me", text: "Hey, is the study group still on for today?", time: "2:00 PM" },
      { id: 2, from: "them", text: "Yes! We're doing chapters 5-7", time: "2:15 PM" },
      { id: 3, from: "me", text: "Perfect, should I bring anything?", time: "2:16 PM" },
      { id: 4, from: "them", text: "The study group meets at 4pm in the library", time: "2:20 PM" },
    ],
  },
  {
    id: "c4",
    name: "Tanvir Ahmed",
    university: "BRAC",
    lastMessage: "Can you help me understand the transport subsidy process?",
    time: "Yesterday",
    unread: 0,
    online: false,
    messages: [
      { id: 1, from: "them", text: "Hi! I saw you offered help with transport subsidies", time: "Yesterday" },
      { id: 2, from: "them", text: "Can you help me understand the transport subsidy process?", time: "Yesterday" },
      { id: 3, from: "me", text: "Of course! It's actually simpler than it looks. Let me explain...", time: "Yesterday" },
    ],
  },
  {
    id: "c5",
    name: "Sadia Rahman",
    university: "IUT",
    lastMessage: "Thank you so much for the emergency fund info 🙏",
    time: "2d",
    unread: 0,
    online: false,
    messages: [
      { id: 1, from: "them", text: "I'm in a tough spot financially this month", time: "2 days ago" },
      { id: 2, from: "me", text: "I know about a student emergency fund you can apply to", time: "2 days ago" },
      { id: 3, from: "them", text: "Really? How do I apply?", time: "2 days ago" },
      { id: 4, from: "me", text: "Go to your university's welfare office with your student ID and a brief letter. They usually process it within 3 days", time: "2 days ago" },
      { id: 5, from: "them", text: "Thank you so much for the emergency fund info 🙏", time: "2 days ago" },
    ],
  },
];

export default function ChatPage({ user }) {
  const [selectedConv, setSelectedConv] = useState(DUMMY_CONVERSATIONS[0]);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showList, setShowList] = useState(true);
  const bottomRef = useRef(null);

  // Init messages from dummy data
  useEffect(() => {
    const init = {};
    DUMMY_CONVERSATIONS.forEach(c => { init[c.id] = c.messages; });
    setMessages(init);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv, messages]);

  const currentMessages = messages[selectedConv?.id] || [];

  const handleSend = () => {
    if (!input.trim() || !selectedConv) return;
    const newMsg = { id: Date.now(), from: "me", text: input.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => ({
      ...prev,
      [selectedConv.id]: [...(prev[selectedConv.id] || []), newMsg],
    }));
    setInput("");
    // Simulate reply after 1.2s
    setTimeout(() => {
      const replies = [
        "Got it, thanks!",
        "That's really helpful 😊",
        "I appreciate your help!",
        "Makes sense, let me try that",
        "Okay, will do! Thanks a lot",
      ];
      const replyMsg = {
        id: Date.now() + 1,
        from: "them",
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => ({
        ...prev,
        [selectedConv.id]: [...(prev[selectedConv.id] || []), replyMsg],
      }));
    }, 1200);
  };

  const filteredConvs = DUMMY_CONVERSATIONS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.university.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isMobile = false; // You can hook this to window.innerWidth if needed

  return (
    <div style={{
      background: T.card, borderRadius: T.radius, border: `1px solid ${T.border}`,
      boxShadow: T.shadow, overflow: "hidden",
      display: "grid", gridTemplateColumns: "300px 1fr",
      height: "calc(100vh - 140px)", minHeight: "480px",
    }}>

      {/* ── Conversation List ─────────────────────────────────────────── */}
      <div style={{ borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", background: T.bg }}>
        {/* Header */}
        <div style={{ padding: "16px", borderBottom: `1px solid ${T.border}` }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: 700, color: T.text }}>Messages</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: T.card, padding: "7px 12px", borderRadius: "50px", border: `1px solid ${T.border}` }}>
            <Search size={14} color={T.textMut} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", color: T.text, flex: 1 }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredConvs.map(conv => {
            const isActive = selectedConv?.id === conv.id;
            const convMessages = messages[conv.id] || conv.messages;
            const lastMsg = convMessages[convMessages.length - 1];
            return (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                style={{
                  display: "flex", gap: "10px", padding: "12px 16px",
                  cursor: "pointer", transition: "background 0.15s",
                  background: isActive ? T.primaryLight : "transparent",
                  borderLeft: isActive ? `3px solid ${T.primary}` : "3px solid transparent",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(0,0,0,0.02)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <Avatar name={conv.name} size={44} online={conv.online} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                    <span style={{ fontSize: "14px", fontWeight: isActive ? 600 : 500, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {conv.name}
                    </span>
                    <span style={{ fontSize: "11px", color: T.textMut, flexShrink: 0 }}>{conv.time}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12.5px", color: T.textMut, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {lastMsg?.text || conv.lastMessage}
                    </span>
                    {conv.unread > 0 && (
                      <span style={{
                        width: "18px", height: "18px", borderRadius: "50%", background: T.primary,
                        color: "#fff", fontSize: "10px", fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: "4px",
                      }}>{conv.unread}</span>
                    )}
                  </div>
                  <div style={{ fontSize: "11px", color: T.textMut, marginTop: "2px" }}>{conv.university}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Chat Window ──────────────────────────────────────────────── */}
      {selectedConv ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Chat Header */}
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar name={selectedConv.name} size={40} online={selectedConv.online} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: "15px", color: T.text }}>{selectedConv.name}</div>
              <div style={{ fontSize: "12px", color: selectedConv.online ? T.accent : T.textMut }}>
                {selectedConv.online ? "● Online" : "○ Offline"} · {selectedConv.university}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ padding: "8px", border: "none", background: T.bg, borderRadius: T.radiusSm, color: T.textSec, cursor: "pointer", display: "flex" }}>
                <Phone size={16} />
              </button>
              <button style={{ padding: "8px", border: "none", background: T.bg, borderRadius: T.radiusSm, color: T.textSec, cursor: "pointer", display: "flex" }}>
                <Video size={16} />
              </button>
              <button style={{ padding: "8px", border: "none", background: T.bg, borderRadius: T.radiusSm, color: T.textSec, cursor: "pointer", display: "flex" }}>
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {currentMessages.map((msg, i) => {
              const isMe = msg.from === "me";
              return (
                <div key={msg.id || i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", gap: "8px", alignItems: "flex-end" }}>
                  {!isMe && <Avatar name={selectedConv.name} size={28} />}
                  <div style={{ maxWidth: "68%" }}>
                    <div style={{
                      padding: "10px 14px", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: isMe ? T.primary : T.bg,
                      color: isMe ? "#fff" : T.text,
                      fontSize: "13.5px", lineHeight: 1.5,
                      border: isMe ? "none" : `1px solid ${T.border}`,
                    }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize: "11px", color: T.textMut, marginTop: "4px", textAlign: isMe ? "right" : "left" }}>
                      {msg.time}
                    </div>
                  </div>
                  {isMe && <Avatar name={user?.name || "Me"} size={28} />}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}`, display: "flex", gap: "10px", alignItems: "center" }}>
            <button style={{ padding: "8px", border: "none", background: "transparent", color: T.textMut, cursor: "pointer", display: "flex", borderRadius: T.radiusSm }}>
              <Paperclip size={18} />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) handleSend(); }}
              placeholder={`Message ${selectedConv.name.split(" ")[0]}...`}
              style={{
                flex: 1, padding: "10px 16px", borderRadius: "24px",
                border: `1px solid ${T.border}`, outline: "none",
                fontSize: "13.5px", background: T.bg, color: T.text,
              }}
            />
            <button style={{ padding: "8px", border: "none", background: "transparent", color: T.textMut, cursor: "pointer", display: "flex", borderRadius: T.radiusSm }}>
              <Smile size={18} />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                padding: "10px 16px", borderRadius: "24px", border: "none",
                background: input.trim() ? T.primary : T.border,
                color: "#fff", cursor: input.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", gap: "6px",
                fontSize: "13px", fontWeight: 500, transition: "background 0.15s",
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", color: T.textMut }}>
          <div style={{ fontSize: "40px" }}>💬</div>
          <div style={{ fontSize: "14px" }}>Select a conversation to start chatting</div>
        </div>
      )}
    </div>
  );
}
