import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useParams } from 'react-router-dom';
import { generateDeck, shuffleDeck } from '../utils/game';

export default function Room() {
  const { roomCode } = useParams();
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);

  // Auth listener
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(u => {
      if (!u) window.location.href = '/';
      else setUser(u);
    });
    return () => unsubscribeAuth();
  }, []);

  // Room listener
  useEffect(() => {
    if (!roomCode) return;
    const roomRef = doc(db, 'rooms', roomCode);

    const unsubscribe = onSnapshot(roomRef, docSnap => {
      if (docSnap.exists()) setRoom(docSnap.data());
      else setRoom(null);
    });

    return () => unsubscribe();
  }, [roomCode]);

  if (!room || !user) return <p>Loading...</p>;

  const isHost = user.uid === room.host;

  // Start game: shuffle deck and deal cards
  const handleStartGame = async () => {
    if (!isHost) return;

    const deck = shuffleDeck(generateDeck());
    const updatedPlayers = room.players.map(player => {
      const hand = deck.splice(0, 7); // 7 cards per player
      return { ...player, cards: hand, scoredCards: [], score: 0 };
    });

    const roomRef = doc(db, 'rooms', roomCode);
    await updateDoc(roomRef, {
      started: true,
      deck,
      players: updatedPlayers,
    });
  };

  // Current user’s cards only
  const myPlayer = room.players.find(p => p.uid === user.uid);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Room: {roomCode}</h1>
      <h2>Players:</h2>
      <ul>
        {room.players.map(p => (
          <li key={p.uid}>
            {p.name} {p.uid === room.host && '(Host)'} {p.uid === user.uid && '(You)'}
          </li>
        ))}
      </ul>

      {isHost && !room.started && (
        <button
          onClick={handleStartGame}
          style={{ padding: '10px 20px', marginTop: '20px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Start Game
        </button>
      )}

      {room.started && myPlayer && (
        <div style={{ marginTop: '20px' }}>
          <h3>Your Cards:</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {myPlayer.cards.map(c => (
              <div
                key={c.id}
                style={{
                  border: '1px solid #000',
                  borderRadius: '6px',
                  padding: '10px',
                  minWidth: '40px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                {c.rank}{c.suit}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
