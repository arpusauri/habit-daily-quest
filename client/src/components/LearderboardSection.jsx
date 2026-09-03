import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const LeaderboardSection = ({ onViewPlayer }) => {
  const [tab, setTab] = useState("level"); // 'level' | 'streak'
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      fetchLeaderboard();
      return;
    }

    const timeout = setTimeout(() => searchPlayers(searchQuery), 300); // debounce
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, tab]);

  const searchPlayers = async (query) => {
    setLoading(true);
    try {
      const isNumeric = /^\d+$/.test(query.trim());
      const { data, error } = isNumeric
        ? await supabase
            .from("users")
            .select("id, username, level, exp, last_login")
            .eq("id", query.trim())
        : await supabase
            .from("users")
            .select("id, username, level, exp, last_login")
            .ilike("username", `%${query.trim()}%`)
            .limit(20);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (err) {
      console.error("Error searching players:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      if (tab === "level") {
        const { data, error } = await supabase
          .from("users")
          .select("id, username, level, exp, last_login")
          .order("level", { ascending: false })
          .order("exp", { ascending: false })
          .limit(20);

        if (error) throw error;
        setLeaderboard(data || []);
      } else {
        const { data, error } = await supabase
          .from("users")
          .select("id, username, level, last_login, habits(streak)");

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

  const getRankBadge = (index) => `#${index + 1}`;

  const formatLastSeen = (dateStr) => {
    if (!dateStr) return "—";
    const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
    if (days === 0) return "Hari ini";
    if (days === 1) return "Kemarin";
    return `${days} hari lalu`;
  };

  return (
    <div className="w-full flex flex-col">
  
      {/* Two-column full-bleed layout */}
      <div className="flex flex-1 bg-white">
        {/* ── SIDEBAR ── */}
        <aside className="w-64 shrink-0 border-r border-gray-200 bg-gray-50 p-4 hidden sm:block">
          {/* Search */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Cari username / UID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-[#1e720f]/30 rounded-sm px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#053b05] focus:border-[#1e720f] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Peringkat selector */}
          <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-2">
            Peringkat
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setTab("level")}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-bold transition-all border-l-4 ${
                tab === "level"
                  ? "bg-[#51b330]/10 text-[#1e720f] border-[#51b330]"
                  : "text-gray-600 hover:bg-gray-100 border-transparent"
              }`}
            >
              Top Level
            </button>
            <button
              type="button"
              onClick={() => setTab("streak")}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-bold transition-all border-l-4 ${
                tab === "streak"
                  ? "bg-[#51b330]/10 text-[#1e720f] border-[#51b330]"
                  : "text-gray-600 hover:bg-gray-100 border-transparent"
              }`}
            >
              Top Streak
            </button>
          </div>
        </aside>

        {/* ── CONTENT ── */}
        <div className="flex-1 min-w-0 p-6">
          {/* Search + tab versi mobile (sidebar disembunyiin di layar kecil) */}
          <div className="relative mb-4 sm:hidden">
            <input
              type="text"
              placeholder="Cari username / UID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-[#1e720f]/30 rounded-sm px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#053b05] focus:border-[#1e720f] transition-colors"
            />
          </div>
          <div className="flex sm:hidden gap-2 mb-4">
            <button
              type="button"
              onClick={() => setTab("level")}
              className={`flex-1 py-2 text-xs font-black rounded-md transition-all ${
                tab === "level"
                  ? "bg-[#51b330] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Top Level
            </button>
            <button
              type="button"
              onClick={() => setTab("streak")}
              className={`flex-1 py-2 text-xs font-black rounded-md transition-all ${
                tab === "streak"
                  ? "bg-[#51b330] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Top Streak
            </button>
          </div>

          <div className="flex items-center gap-2 mb-5">
            <h3 className="text-lg font-black text-gray-900">
              {tab === "level" ? "Top Level" : "Top Streak"}
            </h3>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 rounded-full px-2.5 py-0.5">
              {leaderboard.length}
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm animate-pulse">
              Memuat peringkat...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              {searchQuery
                ? `Tidak ada pemain "${searchQuery}"`
                : "Belum ada data."}
            </div>
          ) : (
            <div className="space-y-2 max-w-4xl">
              {leaderboard.map((player, index) => (
                <div
                  key={player.id || index}
                  onClick={() => onViewPlayer && onViewPlayer(player.id)}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-[#51b330] hover:bg-green-50/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold w-8 text-center text-gray-700">
                      {getRankBadge(index)}
                    </span>
                    <div>
                      <p className="font-bold text-sm text-gray-900">
                        {player.username}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Lv. {player.level || 1} ·{" "}
                        {formatLastSeen(player.last_login)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {tab === "level" ? (
                      <span className="text-xs font-black text-[#1e720f] bg-green-50 border border-green-200 px-2.5 py-1 rounded-md">
                        {player.exp || 0} EXP
                      </span>
                    ) : (
                      <span className="text-xs font-black text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md">
                        {player.max_streak || 0} Hari
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardSection;
