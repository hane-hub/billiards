import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function History() {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'won', 'lost'

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (!u) window.location.href = "/";
      else setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const gamesRef = collection(db, "gameHistory");
        const q = query(
          gamesRef,
          where("playerIds", "array-contains", user.uid),
          orderBy("completedAt", "desc")
        );
        
        const snapshot = await getDocs(q);
        const gameList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setGames(gameList);
      } catch (error) {
        console.error("Failed to fetch game history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const filteredGames = games.filter(game => {
    if (filter === "all") return true;
    if (filter === "won") return game.winner?.uid === user.uid;
    if (filter === "lost") return game.winner?.uid !== user.uid;
    return true;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (!user) return <p className="text-white text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => window.location.href = "/home"}
          className="text-indigo-400 hover:text-indigo-300 text-sm mb-6 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-indigo-500 tracking-wider mb-3">
            GAME HISTORY
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            View your past poker pool games
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-700 p-1 rounded-lg max-w-md mx-auto">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-indigo-500 text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            All Games
          </button>
          <button
            onClick={() => setFilter("won")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              filter === "won"
                ? "bg-indigo-500 text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Won
          </button>
          <button
            onClick={() => setFilter("lost")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              filter === "lost"
                ? "bg-indigo-500 text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Lost
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-8 max-w-2xl mx-auto">
          <div className="bg-slate-700 p-4 rounded-lg text-center border border-slate-600">
            <p className="text-2xl sm:text-3xl font-bold text-white">{games.length}</p>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Total Games</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg text-center border border-slate-600">
            <p className="text-2xl sm:text-3xl font-bold text-green-400">
              {games.filter(g => g.winner?.uid === user.uid).length}
            </p>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Wins</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg text-center border border-slate-600">
            <p className="text-2xl sm:text-3xl font-bold text-red-400">
              {games.filter(g => g.winner?.uid !== user.uid).length}
            </p>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Losses</p>
          </div>
        </div>

        {/* Game List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <p className="text-slate-400 mt-4">Loading games...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="bg-slate-700 p-8 rounded-lg border border-slate-600 text-center">
            <p className="text-slate-400 text-lg mb-2">No games found</p>
            <p className="text-slate-500 text-sm">
              {filter === "all" 
                ? "Start playing to build your game history!" 
                : `You haven't ${filter} any games yet.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGames.map((game) => {
              const isWinner = game.winner?.uid === user.uid;
              const myPlayer = game.players?.find(p => p.uid === user.uid);
              
              return (
                <div
                  key={game.id}
                  className="bg-slate-700 p-5 sm:p-6 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${isWinner ? "bg-green-400" : "bg-red-400"}`}></div>
                      <h3 className="text-white font-semibold text-lg">
                        Room: {game.roomCode}
                      </h3>
                    </div>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full self-start sm:self-auto ${
                      isWinner 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {isWinner ? "Victory" : "Defeat"}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">Winner:</span>
                      <span className="text-white font-medium">{game.winner?.name || "Unknown"}</span>
                      {isWinner && <span className="text-yellow-400">👑</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">Your Score:</span>
                      <span className="text-white font-medium">{myPlayer?.score || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">Players:</span>
                      <span className="text-white">{game.players?.length || 0}</span>
                    </div>
                  </div>

                  {/* Player List */}
                  <div className="bg-slate-800 rounded-lg p-3 mb-3">
                    <p className="text-slate-400 text-xs font-medium mb-2">All Players:</p>
                    <div className="space-y-1">
                      {game.players?.map((player, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className={`${player.uid === user.uid ? "text-indigo-400 font-medium" : "text-slate-300"}`}>
                            {player.name} {player.uid === user.uid && "(You)"}
                          </span>
                          <span className="text-slate-400">Score: {player.score || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs">
                    {formatDate(game.completedAt)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-slate-500 text-xs sm:text-sm mt-10 text-center">
          Built for real-life play. No online gaming, just fun with friends.
        </p>
      </div>
    </div>
  );
}