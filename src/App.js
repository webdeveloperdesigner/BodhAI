// src/App.js
import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { auth } from "./services/firebase";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        const localUser = localStorage.getItem("user");
        if (localUser) {
          setUser(JSON.parse(localUser));
        }
      }
    });
  }, []);

  return (
    <div className="bodhai-wrapper">
      <header className="app-header">
        <h1 className="logo">🧠 Bodh<span className="accent">AI</span></h1>
        <p className="tagline">Sharpen your mind. Practice with purpose.</p>
        <p className="app-slogan">Your AI-powered practice space for MCQs & Coding Challenges</p>
      </header>

      <main className="main-container">
        {user ? <Dashboard user={user} /> : <Login />}
      </main>

      {!user && (
        <>
          {/* Feature Cards */}
          <section className="pre-login-options">
            <div className="card">
              <h2>📝 Practice MCQs</h2>
              <p>Curated questions across Quant, Logic, Verbal, and Tech – with solutions.</p>
            </div>
            <div className="card">
              <h2>💻 Solve Coding Challenges</h2>
              <p>Attempt problems with built-in test cases & real-time feedback.</p>
            </div>
            <div className="card">
              <h2>📈 Analyze Your Growth</h2>
              <p>Get insights, topic-wise accuracy, and time management scores.</p>
            </div>
            <div className="card">
              <h2>🌐 AI-Generated Tests</h2>
              <p>Use our AI engine to generate topic-wise practice questions instantly.</p>
            </div>
          </section>

          {/* Why BodhAI? */}
          <section className="about-bodhai">
            <h2>Why Choose <span className="accent">BodhAI</span>?</h2>
            <ul>
              <li>✅ Smart tests curated by AI for targeted improvement.</li>
              <li>✅ Blend of technical and aptitude practice.</li>
              <li>✅ Clean analytics dashboard to track accuracy & speed.</li>
              <li>✅ Daily challenges & streak tracking for motivation.</li>
            </ul>
          </section>

          {/* Sanskrit + Learning Quote */}
          <section className="inspiration">
            <blockquote>
              <p>“विद्या धनं सर्वधनं प्रधानम्”</p>
              <cite>— Knowledge is the supreme wealth</cite>
            </blockquote>
          </section>
        </>
      )}

      {user && (
        <section className="post-login-options">
          <div className="card">
            <h2>📊 View Results</h2>
            <p>Track your previous attempts and performance metrics.</p>
          </div>
          {/* <div className="card">
            <h2>⚙️ Admin Panel</h2>
            <p>Create, edit, and manage your own test questions via AI or manual upload.</p>
          </div> */}
        </section>
      )}

      <footer className="footer">
        &copy; {new Date().getFullYear()} <strong>BodhAI</strong> — Awakening through Knowledge
      </footer>
    </div>
  );
}

export default App;
