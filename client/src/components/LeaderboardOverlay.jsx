import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

function LeaderboardOverlay({ isOpen, onClose }) {
  const [tab, setTab] = useState("level"); // 'level' | 'streak'
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Shortcut tombol ESC untuk menutup Overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch data leaderboard saat overlay dibuka atau tab berubah
  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, tab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      if (tab === "level") {
        const { data, error } = await supabase
          .from("users")
          .select("id, username, level, exp")
          .order("level", { ascending: false })
          .order("exp", { ascending: false })
          .limit(20);

        if (error) throw error;
        setLeaderboard(data || []);
      } else {
        const { data, error } = await supabase
          .from("users")
          .select("id, username, level, habits(streak)");

        if (error) throw error;

        const processed = (data || []).map((user) => {
          const maxStreak =
            user.habits && user.habits.length > 0
              ? Math.max(...user.habits.map((h) => h.streak || 0))
              : 0;
          return { ...user, max_streak: maxStreak };
        });

        processed.sort(
          (a, b) => b.max_streak - a.max_streak || b.level - a.level,
        );
        setLeaderboard(processed.slice(0, 20));
      }
    } catch (err) {
      console.error("Error loading leaderboard:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  const filteredLeaderboard = leaderboard.filter((player) =>
    (player.username || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 text-white shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Header Overlay */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h2 className="text-xl font-black text-purple-400 tracking-wide">
                LEADERBOARD
              </h2>
              <p className="text-xs text-gray-400">
                Pemain dengan level & streak tertinggi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white font-bold text-xl p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab & Search Control */}
        <div className="space-y-3 mb-4">
          <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setTab("level")}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
                tab === "level"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              ⭐ TOP LEVEL
            </button>
            <button
              type="button"
              onClick={() => setTab("streak")}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
                tab === "streak"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🔥 TOP STREAK
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Cari username pemain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* List Leaderboard */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm animate-pulse">
              Memuat peringkat...
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              {searchQuery
                ? `Tidak ada pemain "${searchQuery}"`
                : "Belum ada data."}
            </div>
          ) : (
            filteredLeaderboard.map((player, index) => (
              <div
                key={player.id || index}
                className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold w-6 text-center">
                    {getRankBadge(index)}
                  </span>
                  <div>
                    <p className="font-bold text-sm text-slate-100">
                      {player.username}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Lv. {player.level || 1}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {tab === "level" ? (
                    <span className="text-xs font-black text-amber-400">
                      {player.exp || 0} EXP
                    </span>
                  ) : (
                    <span className="text-xs font-black text-orange-400">
                      🔥 {player.max_streak || 0} Hari
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default LeaderboardOverlay;
