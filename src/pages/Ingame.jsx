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
        <div className="flex items-center justify-center min-h-screen bg-[#0D0F2B] px-4 py-8 font-sans text-white">
            <div className="bg-[#111433] p-8 w-full max-w-sm rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.4)] text-center">
                <h1 className="text-xl font-bold">
                    In Game <br /> Room - {roomCode}
                </h1>

                <h3 className="mt-2 text-lg">Player: {myPlayer.name}</h3>

                <h2 className="mt-4 text-lg font-semibold">
                    Your Cards ({7 - selectedCards.length})
                </h2>

                {/* Cards */}
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {myPlayer.cards?.length ? (
                        myPlayer.cards.map((c, i) => (
                            <div
                                key={i}
                                onClick={() => {
                                    setSelectedCards(prev => {
                                        if (prev.includes(i)) {
                                            // Deselect → increase count
                                            return prev.filter(idx => idx !== i);
                                        } else if (prev.length < 7) {
                                            // Select only if under 7
                                            return [...prev, i];
                                        } else {
                                            return prev; // max reached
                                        }
                                    });
                                }}
                                className={`relative border border-[#333] p-3 rounded-lg bg-[#1A1D46] min-w-[50px] text-center cursor-pointer transition
          ${selectedCards.includes(i)
                                        ? "opacity-60 scale-95"
                                        : "opacity-100 scale-100"
                                    }`}
                            >
                                {c.rank}
                                {c.suit}

                                {selectedCards.includes(i) && (
                                    <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-red-500 transform -translate-y-1/2 -rotate-12 pointer-events-none"></div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-300">No cards yet</p>
                    )}
                </div>


                {/* Players Section */}
                <div className="mt-8 text-left">
                    <h3 className="text-lg font-semibold mb-2">All Players:</h3>

                    {room.players.map((p) => (
                        <div
                            key={p.uid}
                            className={`bg-[#1A1D46] p-3 mb-2 rounded-lg ${p.uid === user.uid ? "border-2 border-[#4C5FFF]" : ""
                                }`}
                        >
                            <strong>{p.name}</strong> {p.uid === user.uid && "(You)"}
                            <br />
                            <small>
                                Cards: {p.cards?.length || 0} | Score: {p.score || 0}
                            </small>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}