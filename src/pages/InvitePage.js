// src/pages/InvitePage.js
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, firestore } from "../services/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";

function InvitePage() {
  const [inviter, setInviter] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const from = params.get("from");
    if (from) {
      setInviter(from);
      localStorage.setItem("invitedBy", from);
    }
  }, [location.search]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save user data to Firestore
      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          displayName: user.displayName,
          email: user.email,
          invitedBy: inviter || null,
          createdAt: serverTimestamp(),
        });

        if (inviter) {
          const inviterRef = doc(firestore, "inviteCounts", inviter);
          await updateDoc(inviterRef, {
            count: increment(1),
          }).catch(async () => {
            await setDoc(inviterRef, { count: 1 });
          });
        }
      }

      localStorage.setItem("user", JSON.stringify(user));
      alert("🎉 Welcome to BodhAI!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="invite-page" style={styles.container}>
      <h1>😈 Web Dev Dangal Begins!</h1>
      <p>Aye coder bhai/behen 🧠💻</p>
      <p>
        Tumhara HTML se pyar, CSS ke saath affair, JS se jugalbandi aur React mein romance toh suna hai...
      </p>
      <p>Par asli level toh tab pata chalega jab MCQs se takraoge! 🥵🔥</p>

      <h2>🚀 Challenge from <span style={styles.accent}>{inviter || "someone"}</span></h2>

      <button onClick={handleLogin} style={styles.button}>
        🎯 Login with Google & Accept Challenge
      </button>

      <p style={styles.note}>
        🥇 Winner = Bragging Rights <br />
        🥹 Loser = Chai + Samosa Treat ☕🥟
      </p>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    maxWidth: "600px",
    margin: "auto",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    marginTop: "60px",
  },
  button: {
    padding: "12px 24px",
    fontSize: "18px",
    borderRadius: "8px",
    backgroundColor: "#5c6ac4",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    marginTop: "20px",
  },
  note: {
    marginTop: "30px",
    fontSize: "14px",
    color: "gray",
  },
  accent: {
    color: "#d72638",
    fontWeight: "bold",
  },
};

export default InvitePage;
