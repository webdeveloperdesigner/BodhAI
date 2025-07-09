// src/pages/Login.js
import React from "react";
import { auth, googleProvider } from "../services/firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import "./Login.css";

function Login() {
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      localStorage.setItem("user", JSON.stringify(user));
      alert("Login Successful");
    } catch (err) {
      alert("Google login failed");
    }
  };

  return (
    <div className="login-container">
      <h2>Login to BodhAI</h2>
      <button onClick={loginWithGoogle}>Sign in with Google</button>
    </div>



  );
}

export default Login;
