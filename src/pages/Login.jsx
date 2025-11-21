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
    flexDirection: "column",
    backgroundColor: "#1a202c", // Dark navy background
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    // color: "#ffffff",
    padding: "20px"
  }}>
    
    {/* Header Section */}
    <div style={{
      textAlign: "center",
      marginBottom: "30px"
    }}>
      <h1 style={{
        fontSize: "4rem",
        fontWeight: "bold",
        color: "#6366f1", // Purple color for POCKET ACE
        letterSpacing: "0.1em",
        margin: "0 0 20px 0"
      }}>
        POCKET ACE
      </h1>
      <p style={{
        color: "#a0aec0", // Light gray
        fontSize: "1.1rem",
        lineHeight: "1.6",
        maxWidth: "500px",
        margin: "0 auto"
      }}>
        A real-life poker billiards helper. Create a room, share the<br />
        code, and let the app handle the cards and scoring.
      </p>
    </div>

    {/* Login Card */}
    <div style={{
      backgroundColor: "#2d3748", // Darker card background
      padding: "40px",
      borderRadius: "12px",
      border: "1px solid #4a5568",
      minWidth: "350px",
      textAlign: "center"
    }}>
      <h2 style={{
        fontSize: "1.8rem",
        fontWeight: "600",
        color: "#ffffff",
        margin: "0 0 8px 0"
      }}>
        Welcome
      </h2>
      <p style={{
        color: "#a0aec0",
        fontSize: "1rem",
        margin: "0 0 30px 0"
      }}>
        Sign in to play Pocket Aces.
      </p>
      
      <button
        onClick={handleLogin}
        style={{
          width: "100%",
          padding: "14px 24px",
          borderRadius: "8px",
          background: "#6366f1", // Purple button to match theme
          color: "#ffffff",
          fontSize: "16px",
          fontWeight: "500",
          cursor: "pointer",
          border: "none",
          transition: "all 0.2s ease",
          boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "#5856eb";
          e.target.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "#6366f1";
          e.target.style.transform = "translateY(0)";
        }}
      >
        Sign in with Google
      </button>
    </div>

    {/* Footer Text */}
    <p style={{
      color: "#718096",
      fontSize: "0.9rem",
      marginTop: "15px",
      textAlign: "center"
    }}>
      Built for real-life play. No online gaming, just fun with friends.
    </p>
  </div>
);
}
