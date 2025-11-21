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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-indigo-500 tracking-wider mb-4 sm:mb-5">
          POCKET ACE
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xs sm:max-w-md mx-auto px-2">
          A real-life poker billiards helper. Create a room, share the code, and let the app handle the cards and scoring.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex w-full max-w-xs sm:max-w-sm md:max-w-md">
        <button
          onClick={() => setActiveTab("create")}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors rounded-tl-lg border border-b-0 border-slate-600 ${
            activeTab === "create"
              ? "bg-slate-700 text-white"
              : "bg-slate-600 text-slate-400 hover:text-slate-300"
          }`}
        >
          Create Game
        </button>
        <button
          onClick={() => setActiveTab("join")}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors rounded-tr-lg border border-b-0 border-l-0 border-slate-600 ${
            activeTab === "join"
              ? "bg-slate-700 text-white"
              : "bg-slate-600 text-slate-400 hover:text-slate-300"
          }`}
        >
          Join Game
        </button>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-slate-700 p-6 sm:p-8 md:p-10 rounded-b-xl border border-slate-600 border-t-0">
        {activeTab === "create" ? (
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              Create a New Game
            </h2>
            <p className="text-slate-400 text-sm mb-6 sm:mb-8">
              Set up a new game room for your friends.
            </p>

            <div className="mb-5">
              <label className="block text-slate-200 text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Player 1"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              onClick={handleCreateRoom}
              className="w-full py-3 sm:py-4 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/30"
            >
              Create Game
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              Join an Existing Game
            </h2>
            <p className="text-slate-400 text-sm mb-6 sm:mb-8">
              Enter your name and the 6-digit game code.
            </p>

            <div className="mb-5">
              <label className="block text-slate-200 text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Player 2"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="mb-6 sm:mb-8">
              <label className="block text-slate-200 text-sm font-medium mb-2">
                Game Code
              </label>
              <input
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 text-center tracking-widest uppercase focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              onClick={handleJoinRoom}
              className="w-full py-3 sm:py-4 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/30"
            >
              Join Game
            </button>
          </div>
        )}
      </div>

      {/* Links */}
      <a
        href="#"
        className="text-indigo-500 hover:text-indigo-400 text-sm mt-6 sm:mt-8 transition-colors"
      >
        View Game History
      </a>

      <p className="text-slate-500 text-xs sm:text-sm mt-8 sm:mt-10 text-center px-4">
        Built for real-life play. No online gaming, just fun with friends.
      </p>
    </div>
  );
}
