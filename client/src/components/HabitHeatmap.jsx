import React, { useEffect, useState, useMemo } from "react";

import { ActivityCalendar } from "react-activity-calendar";

import { supabase } from "../supabaseClient";

const HabitHeatmap = ({
  apiUrl = "",

  equippedTheme,

  refreshTrigger,

  unlockedCosmeticsCount,
}) => {
  const isMatrixMode = equippedTheme === "ssr_matrix";
  const isAuroraMode = equippedTheme === "shop_aurora";
  const isStarforgeMode = equippedTheme === "ssr_starforge";
  const isNotepadMode = equippedTheme === "ssr_notepad";
  const isDarkMode = equippedTheme === "sr_dark";

  const [activeTab, setActiveTab] = useState("week"); // 'week' | 'month' | 'all'

  const [rawApiData, setRawApiData] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const token = session?.access_token;

        if (!token) {
          setLoading(false);

          return;
        }

        const response = await fetch(`${apiUrl}/api/activity-history`, {
          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();

          setRawApiData(result);
        }
      } catch (err) {
        console.error("Failed to load activity calendar:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [refreshTrigger, apiUrl]);

  const dataMap = useMemo(() => {
    const map = new Map();

    rawApiData.forEach((item) => map.set(item.date, item));

    return map;
  }, [rawApiData]);

  const weekData = useMemo(() => {
    const today = new Date();

    const currentDay = today.getDay();

    const diffToMon = currentDay === 0 ? 6 : currentDay - 1;

    const monday = new Date(today);

    monday.setDate(today.getDate() - diffToMon);

    const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

    const list = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);

      d.setDate(monday.getDate() + i);

      const dateStr = d.toISOString().split("T")[0];

      const item = dataMap.get(dateStr) || {
        date: dateStr,

        count: 0,

        level: 0,
      };

      const isToday = dateStr === today.toISOString().split("T")[0];

      list.push({
        ...item,

        dayName: dayNames[i],

        dayNum: d.getDate(),

        isToday,
      });
    }

    return list;
  }, [dataMap]);

  const monthCalendarData = useMemo(() => {
    const today = new Date();

    const year = today.getFullYear();

    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);

    const lastDay = new Date(year, month + 1, 0);

    let startDay = firstDay.getDay();

    const startOffset = startDay === 0 ? 6 : startDay - 1;

    const cells = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push({ isBlank: true, key: `blank-${i}` });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateObj = new Date(year, month, d);

      const dateStr = dateObj.toISOString().split("T")[0];

      const item = dataMap.get(dateStr) || {
        date: dateStr,

        count: 0,

        level: 0,
      };

      const isToday = dateStr === today.toISOString().split("T")[0];

      cells.push({
        ...item,

        dayNum: d,

        isToday,

        isBlank: false,

        key: dateStr,
      });
    }

    const monthName = firstDay.toLocaleDateString("id-ID", {
      month: "long",

      year: "numeric",
    });

    return { cells, monthName };
  }, [dataMap]);

  const yearData = useMemo(() => {
    const list = [];

    const today = new Date();

    for (let i = 364; i >= 0; i--) {
      const d = new Date();

      d.setDate(today.getDate() - i);

      const dateStr = d.toISOString().split("T")[0];

      const item = dataMap.get(dateStr) || {
        date: dateStr,

        count: 0,

        level: 0,
      };

      list.push(item);
    }

    return list;
  }, [dataMap]);

  const overallStats = useMemo(() => {
    let activeDays = 0;

    let maxSingleDay = 0;

    yearData.forEach((item) => {
      if (item.count > 0) {
        activeDays++;

        if (item.count > maxSingleDay) maxSingleDay = item.count;
      }
    });

    return { activeDays, maxSingleDay };
  }, [yearData]);

  const activeTotalQuests = useMemo(() => {
    if (activeTab === "week") {
      return weekData.reduce((acc, curr) => acc + (curr.count || 0), 0);
    } else if (activeTab === "month") {
      return monthCalendarData.cells.reduce(
        (acc, curr) => acc + (curr.count || 0),

        0,
      );
    } else {
      return yearData.reduce((acc, curr) => acc + (curr.count || 0), 0);
    }
  }, [activeTab, weekData, monthCalendarData, yearData]);

  // TEMA WARNA RPG — tiap tema punya `activeText` sendiri sekarang, biar
  // teks di atas `activeBg` selalu kebaca gak peduli terang/gelap-nya activeBg.
  const themeConfig = useMemo(() => {
    switch (equippedTheme) {
      case "sr_dark":
        return {
          colors: ["#0f172a", "#312e81", "#4338ca", "#6366f1", "#a5b4fc"],

          activeBg: "bg-indigo-500",
          activeText: "text-slate-950",

          textAccent: "text-indigo-400",

          borderGlow: "border-indigo-500/50 shadow-indigo-900/30",

          badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
        };

      case "shop_aurora":
        return {
          colors: ["#1e1b4b", "#a21caf", "#c026d3", "#e879f9", "#f0abfc"],

          activeBg: "bg-fuchsia-500",
          activeText: "text-slate-950",

          textAccent: "text-fuchsia-300",

          borderGlow: "border-fuchsia-500/50 shadow-fuchsia-900/30",

          badgeBg: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
        };

      case "ssr_starforge":
        return {
          colors: ["#1c1305", "#78350f", "#b45309", "#f59e0b", "#fde68a"],

          activeBg: "bg-amber-500",
          activeText: "text-slate-950",

          textAccent: "text-amber-300",

          borderGlow: "border-amber-500/50 shadow-amber-900/30",

          badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        };

      case "ssr_matrix":
        return {
          colors: ["#0d1117", "#0e4429", "#006d32", "#26a641", "#39d353"],

          activeBg: "bg-green-500",
          activeText: "text-slate-950",

          textAccent: "text-green-400",

          borderGlow: "border-green-500/50 shadow-green-900/30",

          badgeBg: "bg-green-500/20 text-green-300 border-green-500/30",
        };

      case "ssr_notepad":
        return {
          colors: ["#fef3e2", "#fed7aa", "#fdba74", "#fb923c", "#ea580c"],

          activeBg: "bg-orange-500",
          activeText: "text-slate-950",

          textAccent: "text-orange-600",

          borderGlow: "border-orange-300 shadow-orange-200/40",

          badgeBg: "bg-orange-100 text-orange-700 border-orange-300",
        };

      default:
        // Tidak ada tema di-equip sama sekali
        return {
          colors: ["#f1f5f9", "#cbd5e1", "#94a3b8", "#64748b", "#334155"],

          activeBg: "bg-gray-900",
          activeText: "text-white",

          textAccent: "text-slate-600",

          borderGlow: "border-slate-300 shadow-slate-200/40",

          badgeBg: "bg-slate-100 text-slate-700 border-slate-300",
        };
    }
  }, [equippedTheme]);

  const daysHeader = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  return (
    <div
      className={`rounded-2xl p-4 shadow-xl my-4 border ${
        isMatrixMode
          ? "bg-black border-green-600/40 font-mono text-white"
          : isNotepadMode
            ? "bg-white border-stone-200 text-stone-800"
            : isDarkMode
              ? "bg-slate-900/90 border-slate-800 text-white"
              : isAuroraMode || isStarforgeMode
                ? "bg-slate-900/90 border-slate-800 text-white"
                : "bg-white border-gray-200 text-gray-900"
      }`}
    >
      {/* HEADER SECTION */}

      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">🔥</span>

          <h3
            className={`font-bold text-base whitespace-nowrap ${themeConfig.textAccent}`}
          >
            Quest Activity
          </h3>

          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-semibold ml-1 whitespace-nowrap ${themeConfig.badgeBg}`}
          >
            {activeTotalQuests}{" "}
            {activeTab === "week"
              ? "this week"
              : activeTab === "month"
                ? "this month"
                : "total"}
          </span>
        </div>

        {/* TAB SWITCHER */}

        <div
          className={`flex p-1 rounded-xl border text-xs font-medium shrink-0 self-start ${
            isMatrixMode
              ? "bg-black border-green-600/30"
              : isNotepadMode
                ? "bg-amber-50 border-stone-200"
                : isDarkMode || isAuroraMode || isStarforgeMode
                  ? "bg-slate-950/80 border-slate-800"
                  : "bg-white border-gray-300"
          }`}
        >
          <button
            onClick={() => setActiveTab("week")}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
              activeTab === "week"
                ? `${themeConfig.activeBg} ${themeConfig.activeText} font-bold shadow-md`
                : isMatrixMode
                  ? "text-green-600 hover:text-green-300"
                  : isNotepadMode
                    ? "text-stone-400 hover:text-stone-700"
                    : isDarkMode || isAuroraMode || isStarforgeMode
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-gray-400 hover:text-gray-900"
            }`}
          >
            This Week
          </button>

          <button
            onClick={() => setActiveTab("month")}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
              activeTab === "month"
                ? `${themeConfig.activeBg} ${themeConfig.activeText} font-bold shadow-md`
                : isMatrixMode
                  ? "text-green-600 hover:text-green-300"
                  : isNotepadMode
                    ? "text-stone-400 hover:text-stone-700"
                    : isDarkMode || isAuroraMode || isStarforgeMode
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-gray-400 hover:text-gray-900"
            }`}
          >
            This Month
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
              activeTab === "all"
                ? `${themeConfig.activeBg} ${themeConfig.activeText} font-bold shadow-md`
                : isMatrixMode
                  ? "text-green-600 hover:text-green-300"
                  : isNotepadMode
                    ? "text-stone-400 hover:text-stone-700"
                    : isDarkMode || isAuroraMode || isStarforgeMode
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-gray-400 hover:text-gray-900"
            }`}
          >
            Keseluruhan
          </button>
        </div>
      </div>

      {/* BODY CONTENT */}

      {loading ? (
        <div
          className={`h-28 flex items-center justify-center text-xs animate-pulse ${
            isMatrixMode
              ? "text-green-600 font-mono"
              : isNotepadMode
                ? "text-stone-400"
                : isDarkMode || isAuroraMode || isStarforgeMode
                  ? "text-slate-500"
                  : "text-gray-400"
          }`}
        >
          {isMatrixMode ? "> LOADING_CACHE..." : "Loading matrix data..."}
        </div>
      ) : (
        <div>
          {/* TAB 1: THIS WEEK */}

          {activeTab === "week" && (
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {weekData.map((item, idx) => {
                const hasQuest = item.count > 0;

                return (
                  <div
                    key={idx}
                    className={`relative flex flex-col items-center justify-between p-2 rounded-xl border transition-all ${
                      item.isToday
                        ? isMatrixMode
                          ? "ring-2 ring-green-400/80 bg-green-950/30"
                          : isNotepadMode
                            ? "ring-2 ring-orange-400/70 bg-orange-100/70"
                            : isDarkMode
                              ? "ring-2 ring-indigo-400/80 bg-slate-800/90"
                              : isAuroraMode
                                ? "ring-2 ring-fuchsia-400/80 bg-slate-800/90"
                                : isStarforgeMode
                                  ? "ring-2 ring-amber-400/80 bg-slate-800/90"
                                  : "ring-2 ring-gray-900/40 bg-gray-100"
                        : isMatrixMode
                          ? "bg-black"
                          : isNotepadMode
                            ? "bg-amber-50/60"
                            : isDarkMode || isAuroraMode || isStarforgeMode
                              ? "bg-slate-950/50"
                              : "bg-gray-50"
                    } ${
                      hasQuest
                        ? `${themeConfig.borderGlow} shadow-lg`
                        : isMatrixMode
                          ? "border-green-800/30 opacity-70"
                          : isNotepadMode
                            ? "border-stone-200 opacity-70"
                            : isDarkMode || isAuroraMode || isStarforgeMode
                              ? "border-slate-800/60 opacity-70"
                              : "border-gray-200 opacity-70"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-semibold uppercase ${
                        isMatrixMode
                          ? "text-green-600"
                          : isNotepadMode
                            ? "text-stone-400"
                            : isDarkMode || isAuroraMode || isStarforgeMode
                              ? "text-slate-400"
                              : "text-gray-500"
                      }`}
                    >
                      {item.dayName}
                    </span>

                    <span
                      className={`text-xs sm:text-sm font-bold my-1 ${
                        isMatrixMode
                          ? "text-green-300"
                          : isNotepadMode
                            ? "text-stone-700"
                            : isDarkMode || isAuroraMode || isStarforgeMode
                              ? "text-slate-200"
                              : "text-gray-800"
                      }`}
                    >
                      {item.dayNum}
                    </span>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold ${
                        hasQuest
                          ? `${themeConfig.activeBg} ${themeConfig.activeText} shadow-sm`
                          : isMatrixMode
                            ? "bg-green-950/50 text-green-700"
                            : isNotepadMode
                              ? "bg-stone-200 text-stone-500"
                              : isDarkMode || isAuroraMode || isStarforgeMode
                                ? "bg-slate-800/80 text-slate-600"
                                : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {hasQuest ? `+${item.count}` : "•"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: THIS MONTH */}

          {activeTab === "month" && (
            <div className="space-y-3">
              <div
                className={`text-xs font-semibold text-center uppercase tracking-wider ${
                  isMatrixMode
                    ? "text-green-500"
                    : isNotepadMode
                      ? "text-stone-500"
                      : isDarkMode || isAuroraMode || isStarforgeMode
                        ? "text-slate-400"
                        : "text-gray-500"
                }`}
              >
                {monthCalendarData.monthName}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {daysHeader.map((d, i) => (
                  <div
                    key={i}
                    className={`text-[10px] font-bold uppercase ${
                      isMatrixMode
                        ? "text-green-700"
                        : isNotepadMode
                          ? "text-stone-400"
                          : isDarkMode || isAuroraMode || isStarforgeMode
                            ? "text-slate-500"
                            : "text-gray-400"
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {monthCalendarData.cells.map((cell) => {
                  if (cell.isBlank) {
                    return (
                      <div
                        key={cell.key}
                        className={`h-8 sm:h-9 rounded-lg border border-transparent ${
                          isMatrixMode
                            ? "bg-black/40"
                            : isNotepadMode
                              ? "bg-transparent"
                              : isDarkMode || isAuroraMode || isStarforgeMode
                                ? "bg-slate-950/20"
                                : "bg-gray-50/40"
                        }`}
                      />
                    );
                  }

                  const hasQuest = cell.count > 0;

                  return (
                    <div
                      key={cell.key}
                      className={`h-8 sm:h-9 rounded-lg flex flex-col items-center justify-center relative border transition-all ${
                        cell.isToday
                          ? isMatrixMode
                            ? "ring-2 ring-green-400/90 bg-green-950/30 font-extrabold"
                            : isNotepadMode
                              ? "ring-2 ring-orange-400/80 bg-orange-100 font-extrabold"
                              : isDarkMode
                                ? "ring-2 ring-indigo-400/90 bg-slate-800 font-extrabold"
                                : isAuroraMode
                                  ? "ring-2 ring-fuchsia-400/90 bg-slate-800 font-extrabold"
                                  : isStarforgeMode
                                    ? "ring-2 ring-amber-400/90 bg-slate-800 font-extrabold"
                                    : "ring-2 ring-gray-900/40 bg-gray-100 font-extrabold"
                          : isMatrixMode
                            ? "bg-black"
                            : isNotepadMode
                              ? "bg-amber-50/60"
                              : isDarkMode || isAuroraMode || isStarforgeMode
                                ? "bg-slate-950/60"
                                : "bg-gray-50"
                      } ${
                        hasQuest
                          ? `${themeConfig.borderGlow} ${isMatrixMode ? "bg-green-950/20" : isNotepadMode ? "bg-orange-50" : isDarkMode || isAuroraMode || isStarforgeMode ? "bg-slate-800/80" : "bg-gray-100"} shadow-md`
                          : isMatrixMode
                            ? "border-green-800/30 text-green-700"
                            : isNotepadMode
                              ? "border-stone-200 text-stone-400"
                              : isDarkMode || isAuroraMode || isStarforgeMode
                                ? "border-slate-800/50 text-slate-500"
                                : "border-gray-200 text-gray-400"
                      }`}
                    >
                      <span
                        className={`text-[11px] font-semibold ${
                          isMatrixMode
                            ? "text-green-300"
                            : isNotepadMode
                              ? "text-stone-700"
                              : isDarkMode || isAuroraMode || isStarforgeMode
                                ? "text-slate-200"
                                : "text-gray-700"
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      {hasQuest && (
                        <span
                          className={`absolute -top-1 -right-1 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ${themeConfig.activeBg} ${themeConfig.activeText} shadow-sm`}
                        >
                          {cell.count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: KESELURUHAN (PEMBARUAN CARD STATS) */}

          {activeTab === "all" && (
            <div className="space-y-4">
              {/* 3 RPG Summary Stats Cards */}

              <div className="grid grid-cols-3 gap-2">
                {/* 1. Hari Aktif */}

                <div
                  className={`rounded-xl p-2 text-center border ${
                    isMatrixMode
                      ? "bg-black border-green-800/30"
                      : isNotepadMode
                        ? "bg-amber-50 border-stone-200"
                        : isDarkMode || isAuroraMode || isStarforgeMode
                          ? "bg-slate-950/70 border-slate-800/80"
                          : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div
                    className={`text-[10px] font-medium ${
                      isMatrixMode
                        ? "text-green-700"
                        : isNotepadMode
                          ? "text-stone-400"
                          : isDarkMode || isAuroraMode || isStarforgeMode
                            ? "text-slate-400"
                            : "text-gray-500"
                    }`}
                  >
                    Jumlah Hari Aktif
                  </div>

                  <div
                    className={`text-sm sm:text-base font-black ${themeConfig.textAccent}`}
                  >
                    {overallStats.activeDays}{" "}
                    <span
                      className={`text-[10px] font-normal ${
                        isMatrixMode
                          ? "text-green-800"
                          : isNotepadMode
                            ? "text-stone-400"
                            : isDarkMode || isAuroraMode || isStarforgeMode
                              ? "text-slate-500"
                              : "text-gray-400"
                      }`}
                    >
                      Hari
                    </span>
                  </div>
                </div>

                {/* 2. Rekor Sehari */}

                <div
                  className={`rounded-xl p-2 text-center border ${
                    isMatrixMode
                      ? "bg-black border-green-800/30"
                      : isNotepadMode
                        ? "bg-amber-50 border-stone-200"
                        : isDarkMode || isAuroraMode || isStarforgeMode
                          ? "bg-slate-950/70 border-slate-800/80"
                          : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div
                    className={`text-[10px] font-medium ${
                      isMatrixMode
                        ? "text-green-700"
                        : isNotepadMode
                          ? "text-stone-400"
                          : isDarkMode || isAuroraMode || isStarforgeMode
                            ? "text-slate-400"
                            : "text-gray-500"
                    }`}
                  >
                    Rekor Sehari
                  </div>

                  <div
                    className={`text-sm sm:text-base font-black ${
                      isMatrixMode
                        ? "text-green-400"
                        : isNotepadMode
                          ? "text-orange-600"
                          : isDarkMode
                            ? "text-indigo-300"
                            : "text-amber-400"
                    }`}
                  >
                    {overallStats.maxSingleDay}{" "}
                    <span
                      className={`text-[10px] font-normal ${
                        isMatrixMode
                          ? "text-green-800"
                          : isNotepadMode
                            ? "text-stone-400"
                            : isDarkMode || isAuroraMode || isStarforgeMode
                              ? "text-slate-500"
                              : "text-gray-400"
                      }`}
                    >
                      Quests
                    </span>
                  </div>
                </div>

                {/* 3. Kosmetik Terbuka */}

                <div
                  className={`rounded-xl p-2 text-center border ${
                    isMatrixMode
                      ? "bg-black border-green-800/30"
                      : isNotepadMode
                        ? "bg-amber-50 border-stone-200"
                        : isDarkMode || isAuroraMode || isStarforgeMode
                          ? "bg-slate-950/70 border-slate-800/80"
                          : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div
                    className={`text-[10px] font-medium ${
                      isMatrixMode
                        ? "text-green-700"
                        : isNotepadMode
                          ? "text-stone-400"
                          : isDarkMode || isAuroraMode || isStarforgeMode
                            ? "text-slate-400"
                            : "text-gray-500"
                    }`}
                  >
                    Kosmetik Terbuka
                  </div>

                  <div
                    className={`text-sm sm:text-base font-black ${
                      isMatrixMode
                        ? "text-green-400"
                        : isNotepadMode
                          ? "text-amber-600"
                          : isDarkMode
                            ? "text-indigo-300"
                            : "text-purple-400"
                    }`}
                  >
                    {unlockedCosmeticsCount}{" "}
                    <span
                      className={`text-[10px] font-normal ${
                        isMatrixMode
                          ? "text-green-800"
                          : isNotepadMode
                            ? "text-stone-400"
                            : isDarkMode || isAuroraMode || isStarforgeMode
                              ? "text-slate-500"
                              : "text-gray-400"
                      }`}
                    >
                      Items
                    </span>
                  </div>
                </div>
              </div>

              {/* Heatmap Full Year */}

              <div
                className={`w-full overflow-x-auto flex justify-center py-2 rounded-xl scrollbar-thin border ${
                  isMatrixMode
                    ? "bg-black border-green-800/30 scrollbar-thumb-green-800/40"
                    : isNotepadMode
                      ? "bg-amber-50/50 border-stone-200 scrollbar-thumb-stone-300"
                      : isDarkMode || isAuroraMode || isStarforgeMode
                        ? "bg-slate-950/50 border-slate-800/60 scrollbar-thumb-slate-700"
                        : "bg-gray-50 border-gray-200 scrollbar-thumb-gray-300"
                }`}
              >
                <ActivityCalendar
                  data={yearData}
                  theme={{
                    dark: themeConfig.colors,

                    light: themeConfig.colors,
                  }}
                  blockSize={10}
                  blockMargin={2.5}
                  blockRadius={2}
                  fontSize={10}
                  showWeekdayLabels={true}
                  labels={{
                    legend: { less: "Relax", more: "Grind" },

                    totalCount: "{{count}} Quests logged in 365 days",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HabitHeatmap;
