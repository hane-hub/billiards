// import React from "react"; /
import { signInWithGoogle, auth } from "../firebase";

export default function LoginPage() {
  const handleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      console.log("User logged in:", result.user);
      window.location.href = "/home"; // redirect after login
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column"
    }}>
      <h1>Login</h1>
      <button
        onClick={handleLogin}
        style={{
          padding: "12px 20px",
          borderRadius: "8px",
          background: "#4285F4",
          color: "#fff",
          fontSize: "16px",
          cursor: "pointer",
          border: "none",
          marginTop: "20px"
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}
