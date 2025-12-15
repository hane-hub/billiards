import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function InGame() {
  const { roomCode } = useParams();
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [winner, setWinner] = useState(null);
  const [gameSaved, setGameSaved] = useState(false);

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

  if (!room || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-slate-400">Loading game...</p>
        </div>
      </div>
    );
  }

  // Get current player data
  const myPlayer = room.players.find((p) => p.uid === user.uid);
  if (!myPlayer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <p className="text-slate-400">Player not found in room...</p>
      </div>
    );
  }

  // Save game to history
  const saveGameHistory = async (winnerPlayer) => {
    if (gameSaved) return; // Prevent duplicate saves
    
    try {
      const gameHistoryRef = collection(db, "gameHistory");
      await addDoc(gameHistoryRef, {
        roomCode: roomCode,
        playerIds: room.players.map(p => p.uid),
        players: room.players.map(p => ({
          uid: p.uid,
          name: p.name,
          score: (p.cards?.length || 0) - (p.selectedCards?.length || 0)
        })),
        winner: {
          uid: winnerPlayer.uid,
          name: winnerPlayer.name
        },
        completedAt: serverTimestamp()
      });
      setGameSaved(true);
    } catch (error) {
      console.error("Failed to save game history:", error);
    }
  };

  // Toggle card selection and update Firestore
  const handleCardClick = async (index) => {
    const roomRef = doc(db, "rooms", roomCode);
    const selectedCards = myPlayer.selectedCards || [];
    let newSelected;

    // Toggle selection
    if (selectedCards.includes(index)) {
      newSelected = selectedCards.filter((i) => i !== index);
    } else {
      newSelected = [...selectedCards, index];
    }

    // Update Firestore
    const updatedPlayers = room.players.map((p) =>
      p.uid === user.uid ? { ...p, selectedCards: newSelected } : p
    );
    await updateDoc(roomRef, { players: updatedPlayers });

    // Check if player has selected all their cards
    if (newSelected.length === myPlayer.cards.length) {
      setWinner(myPlayer);
      await saveGameHistory(myPlayer);
    }
  };

  const handleDrawCard = async () => {
    if (!room?.deck?.length) return;

    const roomRef = doc(db, "rooms", roomCode);
    const [drawnCard, ...newDeck] = room.deck;

    const updatedPlayers = room.players.map((p) =>
      p.uid === user.uid ? { ...p, cards: [...p.cards, drawnCard] } : p
    );

    await updateDoc(roomRef, {
      deck: newDeck,
      players: updatedPlayers,
    });
  };

  // Get card suit symbol
  const getSuitSymbol = (suit) => {
    const suits = {
      '♠': '♠',
      '♥': '♥',
      '♦': '♦',
      '♣': '♣',
      'spades': '♠',
      'hearts': '♥',
      'diamonds': '♦',
      'clubs': '♣'
    };
    return suits[suit] || suit;
  };

  // Get card color
  const getCardColor = (suit) => {
    const symbol = getSuitSymbol(suit);
    return (symbol === '♥' || symbol === '♦') ? 'text-red-500' : 'text-white';
  };

  const cardsRemaining = (myPlayer.cards?.length || 0) - (myPlayer.selectedCards?.length || 0);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4 py-8">
      <div className="bg-slate-800 p-6 sm:p-8 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block bg-indigo-500/20 px-4 py-2 rounded-lg mb-3">
            <p className="text-indigo-400 text-sm font-medium">Room Code</p>
            <p className="text-white text-2xl font-bold tracking-widest">{roomCode}</p>
          </div>
          <h3 className="text-slate-300 text-lg">
            Player: <span className="text-white font-semibold">{myPlayer.name}</span>
          </h3>
        </div>

        {/* Card Count */}
        <div className="bg-slate-700 rounded-lg p-4 mb-6 text-center border border-slate-600">
          <p className="text-slate-400 text-sm mb-1">Cards Remaining</p>
          <p className="text-4xl font-bold text-white">{cardsRemaining}</p>
        </div>

        {/* Cards Grid */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
            <span>Your Cards</span>
            <span className="text-sm text-slate-400 font-normal">
              {myPlayer.cards?.length || 0} total
            </span>
          </h2>

          {myPlayer.cards?.length ? (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {myPlayer.cards.map((c, i) => {
                const isSelected = myPlayer.selectedCards?.includes(i);
                const cardColor = getCardColor(c.suit);
                
                return (
                  <div
                    key={i}
                    onClick={() => handleCardClick(i)}
                    className={`relative aspect-[2/3] border-2 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
                      isSelected 
                        ? "bg-slate-900 border-slate-600 opacity-50 scale-95" 
                        : "bg-white border-slate-300 hover:border-indigo-400 shadow-lg"
                    }`}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                      <span className={`text-2xl font-bold ${isSelected ? 'text-slate-600' : cardColor}`}>
                        {c.rank}
                      </span>
                      <span className={`text-3xl ${isSelected ? 'text-slate-600' : cardColor}`}>
                        {getSuitSymbol(c.suit)}
                      </span>
                    </div>
                    
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-1 bg-red-500 transform -rotate-12"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-700 rounded-lg p-8 text-center border border-slate-600">
              <p className="text-slate-400">No cards yet</p>
            </div>
          )}
        </div>

        {/* Deck Info & Draw Button */}
        <div className="bg-slate-700 rounded-lg p-4 mb-6 border border-slate-600">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Deck</p>
                <p className="text-white font-semibold">{room.deck?.length || 0} cards left</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!room.deck?.length}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50 text-white font-medium transition-all"
            >
              Draw Card (Foul)
            </button>
          </div>
        </div>

        {/* Players List */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">All Players</h3>
          <div className="space-y-2">
            {room.players.map((p) => {
              const cardCount = p.uid === user.uid
                ? cardsRemaining
                : (p.cards?.length || 0) - (p.selectedCards?.length || 0);
              const isCurrentPlayer = p.uid === user.uid;

              return (
                <div
                  key={p.uid}
                  className={`bg-slate-700 p-4 rounded-lg border transition-all ${
                    isCurrentPlayer 
                      ? "border-indigo-500 shadow-lg shadow-indigo-500/20" 
                      : "border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        {p.name} {isCurrentPlayer && <span className="text-indigo-400">(You)</span>}
                      </p>
                      <div className="flex gap-4 mt-1 text-sm">
                        <span className="text-slate-400">
                          Cards: <span className="text-white font-medium">{cardCount}</span>
                        </span>
                        <span className="text-slate-400">
                          Score: <span className="text-white font-medium">{p.score || 0}</span>
                        </span>
                      </div>
                    </div>
                    
                    {cardCount === 0 && (
                      <div className="bg-green-500/20 px-3 py-1 rounded-full">
                        <span className="text-green-400 text-sm font-medium">Done!</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confirm Foul Draw Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 p-6 rounded-xl max-w-sm w-full shadow-2xl border border-slate-700 animate-in fade-in zoom-in duration-200">
              <h2 className="text-xl font-bold text-white mb-3">⚠️ Confirm Foul Draw</h2>
              <p className="text-slate-300 text-sm mb-6">
                Drawing a card is only for foul penalties. Are you sure you want to continue?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    await handleDrawCard();
                    setShowConfirm(false);
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all"
                >
                  Yes, Draw Card
                </button>

                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all border border-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Winner Modal */}
        {winner && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 p-8 rounded-xl max-w-md w-full shadow-2xl border border-green-500/50 animate-in fade-in zoom-in duration-200">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-green-400 mb-3">
                  Victory!
                </h2>
                <p className="text-slate-300 text-lg mb-2">
                  <span className="text-white font-semibold">{winner.name}</span> wins!
                </p>
                <p className="text-slate-400 text-sm mb-8">
                  All cards have been cleared. Game saved to history.
                </p>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => window.location.href = "/home"}
                    className="w-full px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all"
                  >
                    Back to Home
                  </button>
                  <button
                    onClick={() => window.location.href = "/history"}
                    className="w-full px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all border border-slate-600"
                  >
                    View History
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}