import React, { useEffect, useState, useMemo } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { supabase } from "../supabaseClient";

// Helper function to get YYYY-MM-DD in local time (avoids UTC timezone shift bugs)
const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const DAYS_HEADER = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const HabitHeatmap = ({ apiUrl = "", equippedTheme, refreshTrigger }) => {
  const [activeTab, setActiveTab] = useState("week"); // 'week' | 'month' | 'all'
  const [rawApiData, setRawApiData] = useState([]);
  const [loading, setLoading] = useState(true);

  const isMatrixMode = equippedTheme === "ssr_matrix";

  // FETCH ACTIVITY DATA
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const token = session?.access_token;
        if (!token) return;

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

  // COMPLETE THEME CONFIGURATION
  const themeConfig = useMemo(() => {
    switch (equippedTheme) {
      case "ssr_matrix":
        return {
          colors: ["#0d1117", "#0e4429", "#006d32", "#26a641", "#39d353"],
          activeBg: "bg-green-500",
          activeText: "text-slate-950",
          textAccent: "text-green-400",
          borderGlow: "border-green-500/50 shadow-green-900/30",
          badgeBg: "bg-green-500/20 text-green-300 border-green-500/30",
          container: "bg-black border-green-600/40 font-mono text-white",
          tabContainer: "bg-black border-green-600/30",
          tabInactive: "text-green-600 hover:text-green-300",
          cardBg: "bg-black border-green-800/30",
          subText: "text-green-700",
          mainText: "text-green-300",
          todayRing: "ring-2 ring-green-400/80 bg-green-950/30",
          emptyCell: "bg-green-950/50 text-green-700",
          itemBaseBg: "bg-black",
          itemInactiveBorder: "border-green-800/30 opacity-70",
        };
      case "ssr_notepad":
        return {
          colors: ["#fef3e2", "#fed7aa", "#fdba74", "#fb923c", "#ea580c"],
          activeBg: "bg-orange-500",
          activeText: "text-slate-950",
          textAccent: "text-orange-600",
          borderGlow: "border-orange-300 shadow-orange-200/40",
          badgeBg: "bg-orange-100 text-orange-700 border-orange-300",
          container: "bg-white border-stone-200 text-stone-800",
          tabContainer: "bg-amber-50 border-stone-200",
          tabInactive: "text-stone-400 hover:text-stone-700",
          cardBg: "bg-amber-50 border-stone-200",
          subText: "text-stone-400",
          mainText: "text-stone-700",
          todayRing: "ring-2 ring-orange-400/70 bg-orange-100/70",
          emptyCell: "bg-stone-200 text-stone-500",
          itemBaseBg: "bg-amber-50/60",
          itemInactiveBorder: "border-stone-200 opacity-70",
        };
      case "shop_aurora":
        return {
          colors: ["#1e1b4b", "#a21caf", "#c026d3", "#e879f9", "#f0abfc"],
          activeBg: "bg-fuchsia-500",
          activeText: "text-slate-950",
          textAccent: "text-fuchsia-300",
          borderGlow: "border-fuchsia-500/50 shadow-fuchsia-900/30",
          badgeBg: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
          container: "bg-slate-900/90 border-slate-800 text-white",
          tabContainer: "bg-slate-950/80 border-slate-800",
          tabInactive: "text-slate-400 hover:text-slate-200",
          cardBg: "bg-slate-950/70 border-slate-800/80",
          subText: "text-slate-400",
          mainText: "text-slate-200",
          todayRing: "ring-2 ring-fuchsia-400/80 bg-slate-800/90",
          emptyCell: "bg-slate-800/80 text-slate-600",
          itemBaseBg: "bg-slate-950/50",
          itemInactiveBorder: "border-slate-800/60 opacity-70",
        };
      case "ssr_starforge":
        return {
          colors: ["#1c1305", "#78350f", "#b45309", "#f59e0b", "#fde68a"],
          activeBg: "bg-amber-500",
          activeText: "text-slate-950",
          textAccent: "text-amber-300",
          borderGlow: "border-amber-500/50 shadow-amber-900/30",
          badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          container: "bg-slate-900/90 border-slate-800 text-white",
          tabContainer: "bg-slate-950/80 border-slate-800",
          tabInactive: "text-slate-400 hover:text-slate-200",
          cardBg: "bg-slate-950/70 border-slate-800/80",
          subText: "text-slate-400",
          mainText: "text-slate-200",
          todayRing: "ring-2 ring-amber-400/80 bg-slate-800/90",
          emptyCell: "bg-slate-800/80 text-slate-600",
          itemBaseBg: "bg-slate-950/50",
          itemInactiveBorder: "border-slate-800/60 opacity-70",
        };
      case "sr_dark":
        return {
          colors: ["#0f172a", "#312e81", "#4338ca", "#6366f1", "#a5b4fc"],
          activeBg: "bg-indigo-500",
          activeText: "text-slate-950",
          textAccent: "text-indigo-400",
          borderGlow: "border-indigo-500/50 shadow-indigo-900/30",
          badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
          container: "bg-slate-900/90 border-slate-800 text-white",
          tabContainer: "bg-slate-950/80 border-slate-800",
          tabInactive: "text-slate-400 hover:text-slate-200",
          cardBg: "bg-slate-950/70 border-slate-800/80",
          subText: "text-slate-400",
          mainText: "text-slate-200",
          todayRing: "ring-2 ring-indigo-400/80 bg-slate-800/90",
          emptyCell: "bg-slate-800/80 text-slate-600",
          itemBaseBg: "bg-slate-950/50",
          itemInactiveBorder: "border-slate-800/60 opacity-70",
        };
      default:
        return {
          colors: ["#f1f5f9", "#cbd5e1", "#94a3b8", "#64748b", "#334155"],
          activeBg: "bg-gray-900",
          activeText: "text-white",
          textAccent: "text-slate-600",
          borderGlow: "border-slate-300 shadow-slate-200/40",
          badgeBg: "bg-slate-100 text-slate-700 border-slate-300",
          container: "bg-white border-gray-200 text-gray-900",
          tabContainer: "bg-white border-gray-300",
          tabInactive: "text-gray-400 hover:text-gray-900",
          cardBg: "bg-gray-50 border-gray-200",
          subText: "text-gray-500",
          mainText: "text-gray-800",
          todayRing: "ring-2 ring-gray-900/40 bg-gray-100",
          emptyCell: "bg-gray-200 text-gray-500",
          itemBaseBg: "bg-gray-50",
          itemInactiveBorder: "border-gray-200 opacity-70",
        };
    }
  }, [equippedTheme]);

  // MAP DATA FOR QUICK LOOKUP
  const dataMap = useMemo(() => {
    const map = new Map();
    rawApiData.forEach((item) => map.set(item.date, item));
    return map;
  }, [rawApiData]);

  // THIS WEEK DATA
  const weekData = useMemo(() => {
    const today = new Date();
    const todayStr = formatDateKey(today);
    const currentDay = today.getDay();
    const diffToMon = currentDay === 0 ? 6 : currentDay - 1;

    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMon);

    const list = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

      const dateStr = formatDateKey(d);
      const item = dataMap.get(dateStr) || {
        date: dateStr,
        count: 0,
        level: 0,
      };

      list.push({
        ...item,
        dayName: DAYS_HEADER[i],
        dayNum: d.getDate(),
        isToday: dateStr === todayStr,
      });
    }

    return list;
  }, [dataMap]);

  // THIS MONTH DATA
  const monthCalendarData = useMemo(() => {
    const today = new Date();
    const todayStr = formatDateKey(today);
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = firstDay.getDay();
    const startOffset = startDay === 0 ? 6 : startDay - 1;

    const cells = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push({ isBlank: true, key: `blank-${i}` });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = formatDateKey(dateObj);
      const item = dataMap.get(dateStr) || {
        date: dateStr,
        count: 0,
        level: 0,
      };

      cells.push({
        ...item,
        dayNum: d,
        isToday: dateStr === todayStr,
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

  // FULL YEAR DATA
  const yearData = useMemo(() => {
    const list = [];
    const today = new Date();

    for (let i = 364; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);

      const dateStr = formatDateKey(d);
      const item = dataMap.get(dateStr) || {
        date: dateStr,
        count: 0,
        level: 0,
      };
      list.push(item);
    }

    return list;
  }, [dataMap]);

  // STATS & STREAK COMPUTATION
  const overallStats = useMemo(() => {
    let activeDays = 0;
    let maxSingleDay = 0;
    let longestStreak = 0;
    let currentStreak = 0;

    yearData.forEach((item) => {
      if (item.count > 0) {
        activeDays++;
        if (item.count > maxSingleDay) maxSingleDay = item.count;
        currentStreak++;
        if (currentStreak > longestStreak) longestStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });

    return { activeDays, maxSingleDay, longestStreak };
  }, [yearData]);

  // TOTAL QUEST COUNTER ACCORDING TO ACTIVE TAB
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

  return (
    <div
      className={`rounded-2xl p-4 shadow-xl my-4 border ${themeConfig.container}`}
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
          className={`flex p-1 rounded-xl border text-xs font-medium shrink-0 self-start ${themeConfig.tabContainer}`}
        >
          {["week", "month", "all"].map((tabKey) => {
            const labels = {
              week: "This Week",
              month: "This Month",
              all: "Keseluruhan",
            };
            const isActive = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? `${themeConfig.activeBg} ${themeConfig.activeText} font-bold shadow-md`
                    : themeConfig.tabInactive
                }`}
              >
                {labels[tabKey]}
              </button>
            );
          })}
        </div>
      </div>

      {/* BODY CONTENT */}
      {loading ? (
        <div
          className={`h-28 flex items-center justify-center text-xs animate-pulse ${themeConfig.subText}`}
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
                        ? themeConfig.todayRing
                        : themeConfig.itemBaseBg
                    } ${
                      hasQuest
                        ? `${themeConfig.borderGlow} shadow-lg`
                        : themeConfig.itemInactiveBorder
                    }`}
                  >
                    <span
                      className={`text-[10px] font-semibold uppercase ${themeConfig.subText}`}
                    >
                      {item.dayName}
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-bold my-1 ${themeConfig.mainText}`}
                    >
                      {item.dayNum}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold ${
                        hasQuest
                          ? `${themeConfig.activeBg} ${themeConfig.activeText} shadow-sm`
                          : themeConfig.emptyCell
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
                className={`text-xs font-semibold text-center uppercase tracking-wider ${themeConfig.subText}`}
              >
                {monthCalendarData.monthName}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {DAYS_HEADER.map((d, i) => (
                  <div
                    key={i}
                    className={`text-[10px] font-bold uppercase ${themeConfig.subText}`}
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
                        className="h-8 sm:h-9 rounded-lg border border-transparent bg-transparent"
                      />
                    );
                  }

                  const hasQuest = cell.count > 0;
                  return (
                    <div
                      key={cell.key}
                      className={`h-8 sm:h-9 rounded-lg flex flex-col items-center justify-center relative border transition-all ${
                        cell.isToday
                          ? `${themeConfig.todayRing} font-extrabold`
                          : themeConfig.itemBaseBg
                      } ${
                        hasQuest
                          ? `${themeConfig.borderGlow} ${themeConfig.cardBg} shadow-md`
                          : themeConfig.itemInactiveBorder
                      }`}
                    >
                      <span
                        className={`text-[11px] font-semibold ${themeConfig.mainText}`}
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

          {/* TAB 3: KESELURUHAN */}
          {activeTab === "all" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {/* 1. Hari Aktif */}
                <div
                  className={`rounded-xl p-2 text-center border ${themeConfig.cardBg}`}
                >
                  <div
                    className={`text-[10px] font-medium ${themeConfig.subText}`}
                  >
                    Hari Aktif
                  </div>
                  <div
                    className={`text-sm sm:text-base font-black ${themeConfig.textAccent}`}
                  >
                    {overallStats.activeDays}{" "}
                    <span
                      className={`text-[10px] font-normal ${themeConfig.subText}`}
                    >
                      Hari
                    </span>
                  </div>
                </div>

                {/* 2. Rekor Sehari */}
                <div
                  className={`rounded-xl p-2 text-center border ${themeConfig.cardBg}`}
                >
                  <div
                    className={`text-[10px] font-medium ${themeConfig.subText}`}
                  >
                    Rekor Sehari
                  </div>
                  <div
                    className={`text-sm sm:text-base font-black ${themeConfig.textAccent}`}
                  >
                    {overallStats.maxSingleDay}{" "}
                    <span
                      className={`text-[10px] font-normal ${themeConfig.subText}`}
                    >
                      Quests
                    </span>
                  </div>
                </div>

                {/* 3. Streak Terpanjang */}
                <div
                  className={`rounded-xl p-2 text-center border ${themeConfig.cardBg}`}
                >
                  <div
                    className={`text-[10px] font-medium ${themeConfig.subText}`}
                  >
                    Streak Terpanjang
                  </div>
                  <div
                    className={`text-sm sm:text-base font-black ${themeConfig.textAccent}`}
                  >
                    {overallStats.longestStreak}{" "}
                    <span
                      className={`text-[10px] font-normal ${themeConfig.subText}`}
                    >
                      Hari
                    </span>
                  </div>
                </div>
              </div>

              {/* Heatmap Full Year */}
              <div
                className={`w-full overflow-x-auto flex justify-center py-2 rounded-xl scrollbar-thin border ${themeConfig.cardBg}`}
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
