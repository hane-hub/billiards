import { useEffect, useState } from "react";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [activeTab, setActiveTab] = useState("create"); // 'create' or 'join'
  const [joinRoomCode, setJoinRoomCode] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (!u) window.location.href = "/";
      else setUser(u);
      setPlayerName(u.displayName || "Player 1");
    });
    return () => unsubscribe();
  }, []);

  const handleCreateRoom = async () => {
    if (!user) return;

    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      const roomRef = doc(db, "rooms", roomCode);
      await setDoc(roomRef, {
        host: user.uid,
        hostName: user.displayName,
        players: [{ uid: user.uid, name: user.displayName }],
        started: false,
      });
      navigate(`/room/${roomCode}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("Failed to create room");
    }
  };

  const handleJoinRoom = async () => {
    if (!user || !joinRoomCode) return;

    const roomRef = doc(db, "rooms", joinRoomCode.toUpperCase());
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      alert("Room not found!");
      return;
    }

    const roomData = roomSnap.data();
    const isAlreadyIn = roomData.players.some((p) => p.uid === user.uid);

    if (!isAlreadyIn) {
      roomData.players.push({ uid: user.uid, name: user.displayName });
      await updateDoc(roomRef, { players: roomData.players });
    }

    navigate(`/room/${joinRoomCode.toUpperCase()}`);
  };

  if (!user) return <p>Loading...</p>;

return (
  <div style={{
    display: "flex",
    height: "100vh",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    backgroundColor: "#1a202c", // Dark navy background
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: "#ffffff",
    padding: "20px"
  }}>
    
    {/* Header Section */}
    <div style={{
      textAlign: "center",
      marginBottom: "60px"
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

    {/* Tab Navigation */}
    <div style={{
      display: "flex",
      marginBottom: "0",
      borderRadius: "8px 8px 0 0",
      overflow: "hidden",
      border: "1px solid #4a5568",
      borderBottom: "none"
    }}>
      <button 
        onClick={() => setActiveTab("create")}
        style={{
          padding: "12px 24px",
          border: "none",
          background: activeTab === "create" ? "#2d3748" : "#4a5568",
          color: activeTab === "create" ? "#ffffff" : "#a0aec0",
          fontSize: "14px",
          fontWeight: "500",
          cursor: "pointer",
          transition: "all 0.2s ease",
          borderRight: "1px solid #4a5568"
        }}
      >
        Create Game
      </button>
      <button 
        onClick={() => setActiveTab("join")}
        style={{
          padding: "12px 24px",
          border: "none",
          background: activeTab === "join" ? "#2d3748" : "#4a5568",
          color: activeTab === "join" ? "#ffffff" : "#a0aec0",
          fontSize: "14px",
          fontWeight: "500",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
      >
        Join Game
      </button>
    </div>

    {/* Main Content Card */}
    <div style={{
      backgroundColor: "#2d3748", // Darker card background
      padding: "40px",
      borderRadius: "0 0 12px 12px",
      border: "1px solid #4a5568",
      minWidth: "400px",
      textAlign: "left"
    }}>
      
      {/* Create Tab Content */}
      {activeTab === "create" && (
        <div>
          <h2 style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            color: "#ffffff",
            margin: "0 0 8px 0"
          }}>
            Create a New Game
          </h2>
          <p style={{
            color: "#a0aec0",
            fontSize: "0.95rem",
            margin: "0 0 30px 0"
          }}>
            Set up a new game room for your friends.
          </p>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              color: "#e2e8f0",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "8px"
            }}>
              Your Name
            </label>
            <input 
              value={playerName} 
              onChange={(e) => setPlayerName(e.target.value)} 
              placeholder="Player 1"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid #4a5568",
                backgroundColor: "#1a202c",
                color: "#ffffff",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.2s ease"
              }}
              onFocus={(e) => e.target.style.borderColor = "#6366f1"}
              onBlur={(e) => e.target.style.borderColor = "#4a5568"}
            />
          </div>
          
          <button 
            onClick={handleCreateRoom} 
            style={{
              width: "100%",
              padding: "14px 24px",
              borderRadius: "8px",
              background: "#6366f1",
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
            Create Game
          </button>
        </div>
      )}

      {/* Join Tab Content */}
      {activeTab === "join" && (
        <div>
          <h2 style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            color: "#ffffff",
            margin: "0 0 8px 0"
          }}>
            Join an Existing Game
          </h2>
          <p style={{
            color: "#a0aec0",
            fontSize: "0.95rem",
            margin: "0 0 30px 0"
          }}>
            Enter your name and the 6-digit game code.
          </p>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              color: "#e2e8f0",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "8px"
            }}>
              Your Name
            </label>
            <input 
              value={playerName} 
              onChange={(e) => setPlayerName(e.target.value)} 
              placeholder="Player 2"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid #4a5568",
                backgroundColor: "#1a202c",
                color: "#ffffff",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.2s ease"
              }}
              onFocus={(e) => e.target.style.borderColor = "#6366f1"}
              onBlur={(e) => e.target.style.borderColor = "#4a5568"}
            />
          </div>

          <div style={{ marginBottom: "30px" }}>
            <label style={{
              display: "block",
              color: "#e2e8f0",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "8px"
            }}>
              Game Code
            </label>
            <input 
              value={joinRoomCode} 
              onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())} 
              placeholder="ABC123"
              maxLength="6"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid #4a5568",
                backgroundColor: "#1a202c",
                color: "#ffffff",
                fontSize: "16px",
                letterSpacing: "0.1em",
                textAlign: "center",
                outline: "none",
                transition: "border-color 0.2s ease"
              }}
              onFocus={(e) => e.target.style.borderColor = "#6366f1"}
              onBlur={(e) => e.target.style.borderColor = "#4a5568"}
            />
          </div>
          
          <button 
            onClick={handleJoinRoom} 
            style={{
              width: "100%",
              padding: "14px 24px",
              borderRadius: "8px",
              background: "#6366f1",
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
            Join Game
          </button>
        </div>
      )}
    </div>

    {/* View Game History Link */}
    <a 
      href="#" 
      style={{
        color: "#6366f1",
        fontSize: "0.9rem",
        marginTop: "30px",
        textDecoration: "none",
        transition: "color 0.2s ease"
      }}
      onMouseEnter={(e) => e.target.style.color = "#5856eb"}
      onMouseLeave={(e) => e.target.style.color = "#6366f1"}
    >
      View Game History
    </a>

    {/* Footer Text */}
    <p style={{
      color: "#718096",
      fontSize: "0.9rem",
      marginTop: "40px",
      textAlign: "center"
    }}>
      Built for real-life play. No online gaming, just fun with friends.
    </p>
  </div>
);
}
