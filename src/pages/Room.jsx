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
  <div className="flex items-center justify-center min-h-screen bg-[#0D0F2B] px-4 py-8 font-sans text-white">
    <div className="bg-[#111433] p-8 sm:p-10 w-full max-w-md rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.4)] text-center">
      
      <div className="text-4xl mb-2">🎉</div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-1">Game Lobby</h2>
      <div className="text-sm sm:text-base opacity-70 mt-1">{user?.displayName}</div>

      <p className="text-sm opacity-70 mt-3">
        Share the code below with your friends to join.
      </p>

      <div className="text-xs sm:text-sm opacity-70 mt-5">GAME CODE</div>
      <div className="mt-2 bg-[#1A1D46] py-3 rounded-lg text-2xl sm:text-3xl font-bold tracking-widest">
        {roomCode}
      </div>

      <button
        onClick={() => navigator.clipboard.writeText(roomCode)}
        className="mt-2 border border-gray-700 rounded-lg px-3 py-1 text-sm text-gray-400 hover:text-white transition"
      >
        Copy Code
      </button>

      <div className="text-left mt-6">
        <div className="text-base font-semibold mb-2">
          👥 Players ({room.players.length})
        </div>

        {room.players.map((p) => (
          <div
            key={p.uid}
            className="bg-[#1A1D46] p-3 rounded-lg mb-2 flex justify-between items-center text-sm"
          >
            <span>{p.name}</span>
            <span className="text-xs text-yellow-400">
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
          className="w-full mt-4 py-3 bg-[#4C5FFF] rounded-lg font-semibold text-lg hover:bg-[#3b4fd9] transition"
        >
          Start Game
        </button>
      )}

      {room.started && (
        <div className="mt-4 text-[#4C5FFF] font-semibold">
          Game is starting...
        </div>
      )}
    </div>
  </div>
);

}