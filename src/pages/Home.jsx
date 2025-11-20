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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>POCKET ACES</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("create")}
          style={{ padding: "10px", borderRadius: "6px", border: "none", background: activeTab === "create" ? "#4CAF50" : "#ccc", color: "#fff" }}>
          Create Room
        </button>
        <button onClick={() => setActiveTab("join")}
          style={{ padding: "10px", borderRadius: "6px", border: "none", background: activeTab === "join" ? "#2196F3" : "#ccc", color: "#fff" }}>
          Join Room
        </button>
      </div>

      {/* Create Tab */}
      {activeTab === "create" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "300px" }}>
          <label>Your Name</label>
          <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Player 1"
            style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
          <button onClick={handleCreateRoom} style={{ padding: "10px", borderRadius: "6px", background: "#4CAF50", color: "#fff", border: "none" }}>
            Create Room
          </button>
        </div>
      )}

      {/* Join Tab */}
      {activeTab === "join" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "300px" }}>
          <label>Room Code</label>
          <input value={joinRoomCode} onChange={(e) => setJoinRoomCode(e.target.value)} placeholder="Enter room code"
            style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
          <button onClick={handleJoinRoom} style={{ padding: "10px", borderRadius: "6px", background: "#2196F3", color: "#fff", border: "none" }}>
            Join Room
          </button>
        </div>
      )}
    </div>
  );
}
