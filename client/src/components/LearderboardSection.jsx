import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

import LeftArrowIcon from "../assets/icons/left-arrow.svg?react";
import RightArrowIcon from "../assets/icons/right-arrow.svg?react";

const LeaderboardSection = ({ onViewPlayer, currentUser, currentUserId }) => {
  const [tab, setTab] = useState("level"); // 'level' | 'streak'
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // State untuk Paging
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [hasNextPage, setHasNextPage] = useState(true);

  // 1. Buat referensi untuk bagian atas list
  const listTopRef = useRef(null);

  // State untuk Peringkat Asli
  const [myRank, setMyRank] = useState("...");
  const [myStreakRank, setMyStreakRank] = useState("...");
  const [myMaxStreak, setMyMaxStreak] = useState(0);

  // Reset page ke 1 kalau ganti tab atau ngetik search
  useEffect(() => {
    setPage(1);
  }, [tab, searchQuery]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      fetchLeaderboard();
      return;
    }

    const timeout = setTimeout(() => searchPlayers(searchQuery), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, tab, page]);

  // Kalkulasi Peringkat Global User
  useEffect(() => {
    const fetchGlobalRank = async () => {
      if (!currentUser?.level) return;

      const userLevel = currentUser.level || 1;
      const userExp = currentUser.exp || 0;

      // Hitung jumlah pemain yang punya level lebih tinggi ATAU (level sama tapi exp lebih tinggi)
      const { count, error } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .or(
          `level.gt.${userLevel},and(level.eq.${userLevel},exp.gt.${userExp})`,
        );

      if (!error && count !== null) {
        setMyRank(`#${count + 1}`);
      } else {
        setMyRank("N/A");
      }
    };

    fetchGlobalRank();
  }, [currentUser]);

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
            .limit(ITEMS_PER_PAGE);

      if (error) throw error;
      setLeaderboard(data || []);
      setHasNextPage(false); // Disable next page saat searching
    } catch (err) {
      console.error("Error searching players:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    try {
      if (tab === "level") {
        const { data, error } = await supabase
          .from("users")
          .select("id, username, level, exp, last_login")
          .order("level", { ascending: false })
          .order("exp", { ascending: false })
          .range(from, to + 1); // Ambil +1 untuk cek apa ada halaman selanjutnya

        if (error) throw error;

        const hasMore = data.length > ITEMS_PER_PAGE;
        setLeaderboard(hasMore ? data.slice(0, ITEMS_PER_PAGE) : data);
        setHasNextPage(hasMore);
      } else {
        // Logika streak diproses di frontend karena butuh join table habits
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

        // Urutkan dari streak tertinggi
        processed.sort(
          (a, b) => b.max_streak - a.max_streak || b.level - a.level,
        );

        // --- TAMBAHAN BARU: Cari peringkat dan streak mu sendiri ---
        const myIndex = processed.findIndex((p) => p.id === currentUserId);
        if (myIndex !== -1) {
          setMyStreakRank(`#${myIndex + 1}`);
          setMyMaxStreak(processed[myIndex].max_streak);
        } else {
          setMyStreakRank("N/A");
          setMyMaxStreak(0);
        }
        // ---------------------------------------------------------

        const hasMore = processed.length > to + 1;
        setLeaderboard(processed.slice(from, to + 1));
        setHasNextPage(hasMore);
      }
    } catch (err) {
      console.error("Error loading leaderboard:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index) => {
    const actualRank = (page - 1) * ITEMS_PER_PAGE + index + 1;
    return `#${actualRank}`;
  };

  const formatLastSeen = (dateStr) => {
    if (!dateStr) return "—";
    const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
    if (days === 0) return "Hari ini";
    if (days === 1) return "Kemarin";
    return `${days} hari lalu`;
  };

  // Kalkulasi stat user saat ini
  const currentExp = currentUser?.exp || 0;
  const expNeeded = 100 - currentExp;
  const progressPercent = Math.min(100, Math.max(0, currentExp));

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="flex flex-1 bg-white">
        {/* ── SIDEBAR ── */}
        <aside className="w-64 shrink-0 border-r border-gray-200 bg-gray-50 p-4 hidden sm:block">
          {/* (Sidebar utuh, tidak ada yg diubah dari kodemu) */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search Username / UID..."
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
          <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-2">
            Leaderboard Type
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setTab("level")}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-bold transition-all ${
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
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-bold transition-all ${
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
                  ? "bg-[#51b330] text-white rounded-l-none border-l-0"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Top Streak
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
            {/* KOLOM KIRI: Daftar Peringkat */}
            <div className="flex-1 w-full min-w-0">
              {/* Tambahkan ref di sini agar scroll otomatis ke elemen ini */}
              <div
                ref={listTopRef}
                className="flex items-center gap-2 mb-5 pt-2"
              >
                <h3 className="text-lg font-black text-gray-900">
                  {tab === "level" ? "Top Level" : "Top Streak"}
                </h3>
              </div>

              {loading ? (
                <div className="py-16 text-center text-gray-400 text-sm animate-pulse">
                  Loading...
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-sm">
                  {searchQuery
                    ? `Tidak ada pemain "${searchQuery}"`
                    : "Belum ada data."}
                </div>
              ) : (
                <div className="space-y-2 w-full">
                  {leaderboard.map((player, index) => (
                    <div
                      key={player.id || index}
                      onClick={() => onViewPlayer && onViewPlayer(player.id)}
                      className={`flex items-center justify-between p-3 border rounded-lg hover:border-[#51b330] hover:bg-green-50/50 cursor-pointer transition-all ${
                        player.id === currentUserId
                          ? "bg-green-50/30 border-[#51b330]"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-base font-bold w-8 text-center ${player.id === currentUserId ? "text-[#1e720f]" : "text-gray-700"}`}
                        >
                          {getRankBadge(index)}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-gray-900 flex items-center gap-2">
                            {player.username}
                            {player.id === currentUserId && (
                              <span className="text-[9px] bg-[#1e720f] text-white px-1.5 py-0.5 rounded-sm uppercase">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Last Seen · {formatLastSeen(player.last_login)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {tab === "level" ? (
                          <span className="text-xs font-black text-[#1e720f] bg-green-50 border border-green-200 px-2.5 py-1 rounded-md">
                            Lv. {player.level || 1}
                          </span>
                        ) : (
                          <span className="text-xs font-black text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md">
                            {player.max_streak || 0} Hari
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* KONTROL PAGING */}
                  {!searchQuery && (
                    <div className="flex items-center justify-center gap-4 pt-6 mt-4 border-t border-gray-100">
                      <button
                        disabled={page === 1}
                        aria-label="Previous Page"
                        onClick={() => {
                          setPage((p) => p - 1);
                          setTimeout(() => {
                            if (listTopRef.current) {
                              listTopRef.current.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                            }
                          }, 100);
                        }}
                        // p-3 membuat tombol lebih kotak dan area klik membesar (~44px)
                        className="flex items-center justify-center text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed p-3 rounded-lg transition-colors"
                      >
                        <LeftArrowIcon className="w-4 h-4" />
                      </button>

                      {/* Indikator Halaman (Memberi feedback visual ke user) */}
                      <span className="text-sm font-bold text-gray-400 min-w-[3rem] text-center">
                        {page}
                      </span>

                      <button
                        disabled={!hasNextPage}
                        aria-label="Next Page"
                        onClick={() => {
                          setPage((p) => p + 1);
                          setTimeout(() => {
                            if (listTopRef.current) {
                              listTopRef.current.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                            }
                          }, 100);
                        }}
                        className="flex items-center justify-center text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed p-3 rounded-lg transition-colors"
                      >
                        <RightArrowIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* KOLOM KANAN: Kartu Statistik Pribadi */}
            <div className="w-full lg:w-[350px] shrink-0 bg-white border border-gray-200 rounded-xl p-6 shadow-sm mt-[50px] lg:mt-[44px]">
              <h3 className="text-sm font-black text-gray-800 mb-5 uppercase tracking-wider">
                Your Standings
              </h3>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">
                    Current Rank
                  </p>
                  <p
                    className={`text-4xl font-black ${tab === "level" ? "text-[#1e720f]" : "text-orange-600"}`}
                  >
                    {tab === "level" ? myRank : myStreakRank}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-medium mb-1">
                    {tab === "level" ? "Level" : "Best Streak"}
                  </p>
                  <div
                    className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-black border ${
                      tab === "level"
                        ? "bg-[#e8f5e9] text-[#1e720f] border-[#c8e6c9]"
                        : "bg-orange-50 text-orange-600 border-orange-200"
                    }`}
                  >
                    {tab === "level"
                      ? `Lv. ${currentUser?.level || 1}`
                      : `${myMaxStreak} Hari`}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <div className="flex justify-between items-center text-sm mb-3">
                  <span className="font-bold text-gray-700">
                    {currentUser?.username || "Player"}
                  </span>
                  {tab === "level" && (
                    <span className="text-[#51b330] font-black">
                      {currentExp} / 100 EXP
                    </span>
                  )}
                </div>

                {tab === "level" ? (
                  <>
                    {/* Progress Bar Dinamis untuk Level */}
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-3">
                      <div
                        className="bg-[#51b330] h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      <span className="font-bold text-gray-700">
                        {expNeeded} EXP
                      </span>{" "}
                      needed to Level Up!
                    </p>
                  </>
                ) : (
                  <>{/* Tampilan Alternatif untuk Tab Streak */}</>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};;

export default LeaderboardSection;
