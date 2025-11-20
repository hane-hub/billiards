import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function InGame() {
  const { roomCode } = useParams();
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]); // Track selected card indices

  // Auth listener
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      if (!u) window.location.href = "/";
      else setUser(u);
    });
    return () => unsub();
  }, []);

  // Room listener
  useEffect(() => {
    if (!roomCode) return;
    const roomRef = doc(db, "rooms", roomCode);
    const unsub = onSnapshot(roomRef, snap => {
      if (snap.exists()) {
        setRoom(snap.data());
      }
    });
    return () => unsub();
  }, [roomCode]);

  // Toggle card selection
  const toggleCardSelection = (index) => {
    setSelectedCards(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index); // Deselect
      } else {
        return [...prev, index]; // Select
      }
    });
  };

  if (!room || !user) return <p>Loading game...</p>;

  // Get current player's data
  const myPlayer = room.players.find(p => p.uid === user.uid);

  if (!myPlayer) {
    return <p>Player not found in room...</p>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D0F2B",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        color: "white",
        fontFamily: "Inter, sans-serif"
      }}
    >
      <div
        style={{
          background: "#111433",
          padding: "32px",
          width: "380px",
          borderRadius: "16px",
          boxShadow: "0 0 40px rgba(0,0,0,0.4)",
          textAlign: "center",
        }}
      >
        <h1>In Game <br /> Room - {roomCode}</h1>
        <h3>Player: {myPlayer.name}</h3>
        <h2>Your Cards ({myPlayer.cards?.length || 0})</h2>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          {myPlayer.cards && myPlayer.cards.length > 0 ? (
            myPlayer.cards.map((c, i) => (
              <div
                key={i}
                onClick={() => toggleCardSelection(i)}
                style={{
                  position: "relative",
                  border: "1px solid #333",
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#1A1D46",
                  minWidth: "50px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  opacity: selectedCards.includes(i) ? 0.6 : 1,
                  transform: selectedCards.includes(i) ? "scale(0.95)" : "scale(1)",
                }}
              >
                {c.rank}{c.suit}
                
                {/* Red crossover line */}
                {selectedCards.includes(i) && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "0",
                      right: "0",
                      height: "3px",
                      background: "red",
                      transform: "translateY(-50%) rotate(-15deg)",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </div>
            ))
          ) : (
            <p>No cards yet</p>
          )}
        </div>

        <div style={{ marginTop: "30px", textAlign: "left" }}>
          <h3>All Players:</h3>
          {room.players.map((p, idx) => (
            <div
              key={p.uid}
              style={{
                background: "#1A1D46",
                padding: "10px",
                marginBottom: "8px",
                borderRadius: "8px",
                border: p.uid === user.uid ? "2px solid #4C5FFF" : "none"
              }}
            >
              <strong>{p.name}</strong> {p.uid === user.uid && "(You)"}
              <br />
              <small>Cards: {p.cards?.length || 0} | Score: {p.score || 0}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}