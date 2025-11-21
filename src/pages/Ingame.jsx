import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function InGame() {
  const { roomCode } = useParams();
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);

  // Auth listener
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) window.location.href = "/";
      else setUser(u);
    });
    return () => unsub();
  }, []);

  // Room listener
  useEffect(() => {
    if (!roomCode) return;
    const roomRef = doc(db, "rooms", roomCode);
    const unsub = onSnapshot(roomRef, (snap) => {
      if (snap.exists()) setRoom(snap.data());
    });
    return () => unsub();
  }, [roomCode]);

  if (!room || !user) return <p>Loading game...</p>;

  // Get current player data
  const myPlayer = room.players.find((p) => p.uid === user.uid);
  if (!myPlayer) return <p>Player not found in room...</p>;

  // Toggle card selection and update Firestore
  const handleCardClick = async (index) => {
    const roomRef = doc(db, "rooms", roomCode);

    // Determine new selected cards for this player
    const selectedCards = myPlayer.selectedCards || [];
    let newSelected;
    if (selectedCards.includes(index)) {
      newSelected = selectedCards.filter((i) => i !== index);
    } else if (selectedCards.length < 7) {
      newSelected = [...selectedCards, index];
    } else {
      return; // max reached
    }

    // Update player in Firestore
    const updatedPlayers = room.players.map((p) =>
      p.uid === user.uid ? { ...p, selectedCards: newSelected } : p
    );

    await updateDoc(roomRef, { players: updatedPlayers });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0D0F2B] px-4 py-8 font-sans text-white">
      <div className="bg-[#111433] p-8 w-full max-w-sm rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.4)] text-center">
        <h1 className="text-xl font-bold">
          In Game <br /> Room - {roomCode}
        </h1>
        <h3 className="mt-2 text-lg">Player: {myPlayer.name}</h3>

        <h2 className="mt-4 text-lg font-semibold">
          Your Cards ({7 - (myPlayer.selectedCards?.length || 0)})
        </h2>

        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {myPlayer.cards?.length ? (
            myPlayer.cards.map((c, i) => {
              const isSelected = myPlayer.selectedCards?.includes(i);
              return (
                <div
                  key={i}
                  onClick={() => handleCardClick(i)}
                  className={`relative border border-[#333] p-3 rounded-lg bg-[#1A1D46] min-w-[50px] text-center cursor-pointer transition
                  ${isSelected ? "opacity-60 scale-95" : "opacity-100 scale-100"}`}
                >
                  {c.rank}
                  {c.suit}
                  {isSelected && (
                    <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-red-500 transform -translate-y-1/2 -rotate-12 pointer-events-none"></div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-300">No cards yet</p>
          )}
        </div>

        {/* Players */}
        <div className="mt-8 text-left">
          <h3 className="text-lg font-semibold mb-2">All Players:</h3>
          {room.players.map((p) => {
            const cardCount =
              p.uid === user.uid
                ? myPlayer.cards.length - (myPlayer.selectedCards?.length || 0)
                : p.cards?.length - (p.selectedCards?.length || 0) || 0;

            return (
              <div
                key={p.uid}
                className={`bg-[#1A1D46] p-3 mb-2 rounded-lg ${
                  p.uid === user.uid ? "border-2 border-[#4C5FFF]" : ""
                }`}
              >
                <strong>{p.name}</strong> {p.uid === user.uid && "(You)"}
                <br />
                <small>
                  Cards: {cardCount} | Score: {p.score || 0}
                </small>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
