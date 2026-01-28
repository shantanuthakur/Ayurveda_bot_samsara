import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { User, Bot, Send, X } from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:4000/api/chat";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    gender: "Male",
    height: "",
    weight: ""
  });

  const [bmi, setBmi] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Namaste 🙏 I am your Ayurveda assistant. How can I help you today?"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (profile.height && profile.weight) {
      const h = profile.height / 100;
      const bmiValue = (profile.weight / (h * h)).toFixed(1);
      setBmi(bmiValue);
    }
  }, [profile.height, profile.weight]);

 
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

 
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input;

   
    setMessages(prev => [
      ...prev,
      { role: "user", content: userText }
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(API_URL, {
        prompt: userText,
        ...profile,
        bmi
      });

      console.log("Frontend received:", res.data);

      const botReply =
        res?.data?.response ||
        "⚠️ The model did not return a response. Please try again.";

      setMessages(prev => [
        ...prev,
        { role: "bot", content: botReply }
      ]);
    } catch (error) {
      console.error("❌ Frontend error:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "bot",
          content: "❌ Unable to reach the backend server."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {/* TOP BAR */}
      <header className="top-bar">
        <h2>🌿 Samsara Ayurveda</h2>
        <button
          className="profile-btn"
          onClick={() => setSidebarOpen(true)}
        >
          <User size={22} />
        </button>
      </header>

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>User Profile</h3>
          <X onClick={() => setSidebarOpen(false)} />
        </div>

        <label>Name</label>
        <input
          value={profile.name}
          onChange={e =>
            setProfile({ ...profile, name: e.target.value })
          }
        />

        <label>Age</label>
        <input
          type="number"
          value={profile.age}
          onChange={e =>
            setProfile({ ...profile, age: e.target.value })
          }
        />

        <label>Gender</label>
        <select
          value={profile.gender}
          onChange={e =>
            setProfile({ ...profile, gender: e.target.value })
          }
        >
          <option>Male</option>
          <option>Female</option>
        </select>

        <label>Height (cm)</label>
        <input
          type="number"
          value={profile.height}
          onChange={e =>
            setProfile({ ...profile, height: e.target.value })
          }
        />

        <label>Weight (kg)</label>
        <input
          type="number"
          value={profile.weight}
          onChange={e =>
            setProfile({ ...profile, weight: e.target.value })
          }
        />

        {bmi && (
          <div className="bmi">
            BMI: <b>{bmi}</b>
          </div>
        )}
      </div>

      {/* CHAT */}
      <div className="chat">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <div className="avatar">
              {m.role === "bot" ? <Bot /> : <User />}
            </div>
            <div className="bubble">{m.content}</div>
          </div>
        ))}

        {loading && (
          <p className="typing">Ayurveda AI is thinking...</p>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div className="input-box">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Ask your health concern..."
        />
        <button onClick={sendMessage} disabled={loading}>
          <Send />
        </button>
      </div>
    </div>
  );
}

export default App;
