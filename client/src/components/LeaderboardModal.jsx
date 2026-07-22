import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

function LeaderboardModal({ onClose }) {
  const [tab, setTab] = useState("level"); // 'level' | 'streak'
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [tab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      if (tab === "level") {
        // Ambil Top 10 Level & EXP dari Supabase
        const { data, error } = await supabase
          .from("users")
          .select("id, username, level, exp, equipped_border, equipped_font")
          .order("level", { ascending: false })
          .order("exp", { ascending: false })
          .limit(10);

        if (error) throw error;
        setLeaderboard(data || []);
      } else {
        // Ambil Top 10 Streak (dengan join tabel habits)
        const { data, error } = await supabase.from("users").select(`
            id, username, level, equipped_border, equipped_font,
            habits ( streak )
          `);

        if (error) throw error;

        // Hitung streak tertinggi (max streak) milik setiap pemain
        const processed = (data || []).map((user) => {
          const maxStreak =
            user.habits && user.habits.length > 0
              ? Math.max(...user.habits.map((h) => h.streak || 0))
              : 0;
          return { ...user, max_streak: maxStreak };
        });

        // Urutkan dari streak tertinggi
        processed.sort(
          (a, b) => b.max_streak - a.max_streak || b.level - a.level,
        );

        setLeaderboard(processed.slice(0, 10));
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

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 text-white shadow-2xl relative">
        {/* Header & Close Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-yellow-400 flex items-center gap-2">
            🏆 GLOBAL LEADERBOARD
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-800 p-1 rounded-xl mb-4 gap-1">
          <button
            onClick={() => setTab("level")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              tab === "level"
                ? "bg-purple-600 text-white shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            ⭐ Top Level
          </button>
          <button
            onClick={() => setTab("streak")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              tab === "streak"
                ? "bg-purple-600 text-white shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🔥 Top Streak
          </button>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="py-8 text-center text-gray-400 animate-pulse font-semibold">
            Memuat data leaderboard...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            Belum ada data pemain.
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {leaderboard.map((player, index) => (
              <div
                key={player.id || index}
                className="flex items-center justify-between p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold w-8 text-center">
                    {getRankBadge(index)}
                  </span>
                  <div>
                    <p className="font-bold text-sm text-slate-100">
                      {player.username}
                    </p>
                    <p className="text-xs text-gray-400">
                      Lv. {player.level || 1}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {tab === "level" ? (
                    <span className="text-sm font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                      EXP: {player.exp || 0}
                    </span>
                  ) : (
                    <span className="text-sm font-black text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-lg border border-orange-400/20">
                      🔥 {player.max_streak || 0} Hari
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaderboardModal;
