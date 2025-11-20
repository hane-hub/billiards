import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc, getDoc, runTransaction } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import { generateDeck, shuffleDeck } from '../utils/game';

export default function Room() {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);

  // AUTH LISTENER
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      if (!u) window.location.href = "/";
      else setUser(u);
    });
    return unsub;
  }, []);

  // ROOM LISTENER
  useEffect(() => {
    if (!roomCode) return;
    const roomRef = doc(db, "rooms", roomCode);
    const unsub = onSnapshot(roomRef, snap => {
      if (snap.exists()) setRoom(snap.data());
      else setRoom(null);
    });
    return unsub;
  }, [roomCode]);

  // AUTO-NAVIGATE when game starts
  useEffect(() => {
    if (room && room.started) {
      navigate(`/game/${roomCode}`);
    }
  }, [room, roomCode, navigate]);

  // JOIN ROOM
  useEffect(() => {
    if (!room || !user) return;
    
    const join = async () => {
      const roomRef = doc(db, "rooms", roomCode);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) return;
      
      const data = snap.data();
      const exists = data.players.some(p => p.uid === user.uid);
      if (exists) return;
      
      await updateDoc(roomRef, {
        players: [
          ...data.players,
          {
            uid: user.uid,
            name: user.displayName || "Player",
            cards: [],
            scoredCards: [],
            score: 0,
          }
        ]
      });
    };
    join();
  }, [room, user, roomCode]);

  // START GAME
  const handleStartGame = async () => {
    if (!user || !room) return;
    if (user.uid !== room.host) return;
    
    const roomRef = doc(db, "rooms", roomCode);
    
    try {
      await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        if (!roomSnap.exists()) throw new Error("Room does not exist");
        
        const liveRoom = roomSnap.data();
        const deck = shuffleDeck(generateDeck());
        
        const updatedPlayers = liveRoom.players.map(p => ({
          ...p,
          cards: deck.splice(0, 7),
          scoredCards: [],
          score: 0,
        }));
        
        transaction.update(roomRef, {
          started: true,
          deck,
          players: updatedPlayers,
          currentTurn: 0, // Optional: track whose turn it is
        });
      });
      
      // Navigation will happen automatically via useEffect
      console.log("Game started successfully!");
      
    } catch (err) {
      console.error("Failed to start game:", err);
      alert("Failed to start game. Please try again.");
    }
  };

  // SAFE conditional render
  if (!room || !user) return <p>Loading...</p>;
  
  const isHost = user.uid === room.host;

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
        <div style={{ fontSize: "38px", marginBottom: "10px" }}>🎉</div>
        <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>
          Game Lobby
        </h2>
        <div style={{ marginTop: "4px", opacity: 0.7, fontSize: "15px" }}>
          {user?.displayName}
        </div>
        <p style={{ marginTop: "12px", opacity: 0.7 }}>
          Share the code below with your friends to join.
        </p>

        <div style={{ marginTop: "20px", fontSize: "12px", opacity: 0.7 }}>
          GAME CODE
        </div>
        <div
          style={{
            marginTop: "8px",
            background: "#1A1D46",
            padding: "14px 0",
            borderRadius: "10px",
            fontSize: "26px",
            letterSpacing: "6px",
            fontWeight: "700",
          }}
        >
          {roomCode}
        </div>

        <button
          onClick={() => navigator.clipboard.writeText(roomCode)}
          style={{
            marginTop: "10px",
            background: "transparent",
            border: "1px solid #343864",
            padding: "6px 10px",
            borderRadius: "8px",
            color: "#aaa",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Copy Code
        </button>

        <div style={{ textAlign: "left", marginTop: "26px" }}>
          <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "10px" }}>
            👥 Players ({room.players.length})
          </div>
          {room.players.map((p) => (
            <div
              key={p.uid}
              style={{
                background: "#1A1D46",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "15px",
              }}
            >
              <span>{p.name}</span>
              <span style={{ fontSize: "12px", color: "#ffdd55" }}>
                {p.uid === room.host ? "HOST" : ""}
                {p.uid === room.host && p.uid === user.uid ? " (You)" : ""}
                {p.uid === user.uid && p.uid !== room.host ? "(You)" : ""}
              </span>
            </div>
          ))}
        </div>

        {isHost && !room.started && (
          <button
            onClick={handleStartGame}
            style={{
              width: "100%",
              marginTop: "20px",
              background: "#4C5FFF",
              padding: "14px",
              borderRadius: "10px",
              border: "none",
              fontSize: "17px",
              fontWeight: "600",
              cursor: "pointer",
              color: "white",
            }}
          >
            Start Game
          </button>
        )}

        {room.started && (
          <div style={{ marginTop: "20px", color: "#4C5FFF", fontWeight: 600 }}>
            Game is starting...
          </div>
        )}
      </div>
    </div>
  );
}