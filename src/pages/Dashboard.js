import React, { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { ref, get, onValue } from "firebase/database";
import { doc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import TestMCQ from "../components/TestMCQ";
import TestCoding from "../components/TestCoding";
import AdminUpload from "../components/AdminUpload";
import ViewResults from "../components/ViewResults";
import InvitePage from "./InvitePage";
import AdminPanel from "./AdminPanel";
import AdminVersionPanel from "../components/AdminVersionPanel";
import AdminCodingUpload from "../components/AdminCodingUpload";



import "./Dashboard.css";

function Dashboard({ user }) {
  const [view, setView] = useState("home");
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState(null);
  const [quizzes, setQuizzes] = useState({});
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [codingQuizzes, setCodingQuizzes] = useState({});
  const [selectedCodingQuiz, setSelectedCodingQuiz] = useState(null);

  useEffect(() => {
    const userRef = ref(db, `users/${user.uid}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.val());
      }
    });

    const adminRef = ref(db, `admins/${user.uid}`);
    get(adminRef).then((snap) => {
      setIsAdmin(snap.exists());
    });

    const quizRef = ref(db, "quizzes/");
    onValue(quizRef, (snapshot) => {
      const data = snapshot.val() || {};
      setQuizzes(data);
    });

    const codingRef = ref(db, "codingQuestions/");
    onValue(codingRef, (snapshot) => {
      const data = snapshot.val() || {};
      setCodingQuizzes(data);
    });
  }, [user]);

  const logout = () => {
    auth.signOut();
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const copyInviteLink = async () => {
    const inviter = profile?.username || profile?.name || user.displayName || user.email;
    const link = `https://v3.bodhai.pages.dev/invite?from=${encodeURIComponent(inviter)}`;
    await navigator.clipboard.writeText(link);
    alert("✅ Invite link copied! Share it with your friends.");
  };

  return (
    <div className="dashboard-wrapper">
      <h2>👋 Welcome, {profile?.name || user.displayName || user.email}</h2>

      <div className="dashboard-buttons">
        <button onClick={() => {
          const quizList = Object.entries(quizzes);
          if (quizList.length > 0) {
            const latest = quizList[quizList.length - 1];
            setSelectedQuiz({ ...latest[1], id: latest[0] });
            setView("selectedQuiz");
          } else {
            alert("No quizzes available.");
          }
        }}>📝 Start Latest MCQ Test</button>

        <button onClick={() => {
          const quizList = Object.entries(codingQuizzes);
          if (quizList.length > 0) {
            const random = quizList[Math.floor(Math.random() * quizList.length)];
            setSelectedCodingQuiz({ ...random[1], id: random[0] });
            setView("selectedCodingQuiz");
          } else {
            alert("No coding quizzes available.");
          }
        }}>💻 Start Random Coding Test</button>

        <button onClick={() => setView("results")}>📊 View Results</button>
        <button onClick={copyInviteLink}>📨 Invite a Friend</button>

        {isAdmin && (
  <>
    <button onClick={() => setView("admin")}>⚙️ Admin Panel</button>
    
  </>
)}


        <button onClick={logout}>🚪 Logout</button>
      </div>

      <div className="dashboard-content">
        {view === "home" && (
          <>
            <p>Select an option above to get started.</p>
            <div className="quiz-section">
              <h3>📚 Available MCQ Quizzes</h3>
              <div className="quiz-list">
                {Object.entries(quizzes).map(([quizId, quiz]) => {
                  const questionCount = quiz.questions ? Object.keys(quiz.questions).length : 0;
                  return (
                    <div key={quizId} className="quiz-card">
                      <h4>{quizId}</h4>
                      <p>📅 Date: {quiz.date || "N/A"}</p>
                      <p>📋 Questions: {questionCount}</p>
                      <button
                        onClick={() => {
                          setSelectedQuiz({ ...quiz, id: quizId });
                          setView("selectedQuiz");
                        }}
                      >
                        ▶️ Start Quiz
                      </button>
                    </div>
                  );
                })}
              </div>

              <h3>💻 Available Coding Quizzes</h3>
              <div className="quiz-list">
                {Object.entries(codingQuizzes).map(([quizId, quiz]) => {
                  const questionCount = quiz.questions ? Object.keys(quiz.questions).length : 0;
                  return (
                    <div key={quizId} className="quiz-card">
                      <h4>{quiz.quizTitle || quizId}</h4>
                      <p>📅 Date: {quiz.date || "N/A"}</p>
                      <p>🧮 Questions: {questionCount}</p>
                      <button
                        onClick={() => {
                          setSelectedCodingQuiz({ ...quiz, id: quizId });
                          setView("selectedCodingQuiz");
                        }}
                      >
                        ▶️ Start Coding Quiz
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {view === "mcq" && <TestMCQ user={user} />}
        {view === "coding" && <TestCoding user={user} />}
        {view === "results" && <ViewResults user={user} />}
        {view === "invite" && <InvitePage />}
        {view === "admin" &&
          (isAdmin ? (
            <>
              <div className="admin-panel">
                <h3>Admin Panel</h3>
                <p>Upload new questions or manage existing ones.</p>
              </div>
              <AdminUpload user={user} />
              <AdminCodingUpload user={user} />
              <AdminPanel currentUID={user.uid} />
              <AdminVersionPanel />
              {/* <VersionDisplayPanel user={user} /> */}
            </>
          ) : (
            <p>⛔ You do not have admin access.</p>
          ))}

        {view === "selectedQuiz" && selectedQuiz && (
          <TestMCQ user={user} quizData={selectedQuiz} />
        )}

        {view === "selectedCodingQuiz" && selectedCodingQuiz && (
          <TestCoding user={user} quizData={selectedCodingQuiz} />
        )}
      </div>