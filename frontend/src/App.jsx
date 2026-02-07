import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { User, Send, X, MapPin, UserCircle } from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:4000/api/chat";
const BOT_NAME = "AI Guru";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    age: "",
    gender: "Male",
    height: "",
    weight: "",
    dosha: "",
    bodyType: "",
    location: "",
    chronicDisease: ""
  });

  const [bmi, setBmi] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Namaste 🙏 I am your Ayurveda assistant. Please share your concern."
    }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (profile.height && profile.weight) {
      const h = profile.height / 100;
      setBmi((profile.weight / (h * h)).toFixed(1));
    }
  }, [profile.height, profile.weight]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(API_URL, {
        prompt: userText,
        ...profile,
        bmi
      });

      const botReply = res?.data?.response || "The model did not return a response.";
      setMessages(prev => [...prev, { role: "bot", content: botReply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "bot", content: "Unable to connect to server." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {/* Main Chat Container */}
      <div className="chat-container">
        {/* HEADER - Light Green */}
        <header className="chat-header">
          <div className="header-left">
            <img src="/monk.png" className="bot-avatar-main" alt="Guru" />
            <div className="header-info">
              <h3>{BOT_NAME}</h3>
              <span className="online-status">
                <span className="online-dot"></span> Online
              </span>
            </div>
          </div>

          {/* User Icon to toggle profile */}
          <button className="user-profile-btn" onClick={() => setSidebarOpen(true)}>
            <UserCircle size={26} />
          </button>
        </header>

        {/* CHAT BODY */}
        <div className="chat-body">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <div className="message-avatar">
                {m.role === "bot" ? (
                  <img src="/monk.png" alt="bot" />
                ) : (
                  <div className="user-icon-circle">
                    <User size={20} />
                  </div>
                )}
              </div>
              <div className="bubble">{m.content}</div>
            </div>
          ))}

          {loading && (
            <p className="typing">AI Guru is thinking...</p>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* INPUT */}
        <div className="chat-input">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Type your health concern..."
          />
          <button onClick={sendMessage} disabled={loading} className="send-btn">
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Overlay for sidebar */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* PROFILE SIDEBAR */}
      <div className={`profile-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>Patient Profile</h3>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          <label>Name</label>
          <input
            value={profile.name}
            onChange={e => setProfile({ ...profile, name: e.target.value })}
            placeholder="Your name"
          />

          <div className="form-row">
            <div className="form-col">
              <label>Age</label>
              <input
                type="number"
                value={profile.age}
                onChange={e => setProfile({ ...profile, age: e.target.value })}
                placeholder="Age"
              />
            </div>
            <div className="form-col">
              <label>Gender</label>
              <select
                value={profile.gender}
                onChange={e => setProfile({ ...profile, gender: e.target.value })}
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label>Height (cm)</label>
              <input
                type="number"
                value={profile.height}
                onChange={e => setProfile({ ...profile, height: e.target.value })}
                placeholder="Height"
              />
            </div>
            <div className="form-col">
              <label>Weight (kg)</label>
              <input
                type="number"
                value={profile.weight}
                onChange={e => setProfile({ ...profile, weight: e.target.value })}
                placeholder="Weight"
              />
            </div>
          </div>

          <label><MapPin size={14} /> Location</label>
          <input
            placeholder="City, Country"
            value={profile.location}
            onChange={e => setProfile({ ...profile, location: e.target.value })}
          />

          <label>Dosha (if known)</label>
          <select
            value={profile.dosha}
            onChange={e => setProfile({ ...profile, dosha: e.target.value })}
          >
            <option value="">Select...</option>
            <option value="Vata">Vata</option>
            <option value="Pitta">Pitta</option>
            <option value="Kapha">Kapha</option>
            <option value="Vata-Pitta">Vata-Pitta</option>
            <option value="Pitta-Kapha">Pitta-Kapha</option>
            <option value="Vata-Kapha">Vata-Kapha</option>
          </select>

          <label>Body Type</label>
          <select
            value={profile.bodyType}
            onChange={e => setProfile({ ...profile, bodyType: e.target.value })}
          >
            <option value="">Select...</option>
            <option value="Slim">Slim (Vata)</option>
            <option value="Medium">Medium (Pitta)</option>
            <option value="Heavy">Heavy (Kapha)</option>
          </select>

          <label>Chronic History</label>
          <textarea
            rows={3}
            placeholder="Any long-term issues..."
            value={profile.chronicDisease}
            onChange={e => setProfile({ ...profile, chronicDisease: e.target.value })}
          />

          {bmi && <div className="bmi-badge">BMI: {bmi}</div>}
        </div>
      </div>
    </div>
  );
}

export default App;