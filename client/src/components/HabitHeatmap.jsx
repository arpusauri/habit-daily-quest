import React, { useEffect, useState, useMemo } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { supabase } from "../supabaseClient";

const HabitHeatmap = ({
  apiUrl = "",
  equippedTheme,
  refreshTrigger,
  unlockedCosmeticsCount,
}) => {
  const [activeTab, setActiveTab] = useState("week"); // 'week' | 'month' | 'all'
  const [rawApiData, setRawApiData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data dari Backend
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

        // 🔥 UBAH BARIS INI: Tambahkan ${apiUrl} di depan URL endpoint
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

  // Map Data API untuk O(1) Quick Lookup
  const dataMap = useMemo(() => {
    const map = new Map();
    rawApiData.forEach((item) => map.set(item.date, item));
    return map;
  }, [rawApiData]);

  // -------------------------------------------------------------
  // DATA HELPER 1: THIS WEEK (Senin - Minggu)
  // -------------------------------------------------------------
  const weekData = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0: Sun, 1: Mon, ...
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

  // -------------------------------------------------------------
  // DATA HELPER 2: THIS MONTH (Grid Kalender Matriks 1 Bulan)
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // DATA HELPER 3: KESELURUHAN (365 Hari + Stats Summary)
  // -------------------------------------------------------------
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

  // Hitung Statistik RPG Keseluruhan
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

  // Hitung Total Quest yang Aktif Berdasarkan Tab
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

  // -------------------------------------------------------------
  // TEMA WARNA RPG
  // -------------------------------------------------------------
  const themeConfig = useMemo(() => {
    switch (equippedTheme) {
      case "r_blue":
        return {
          colors: ["#1e293b", "#0284c7", "#38bdf8", "#7dd3fc", "#bae6fd"],
          activeBg: "bg-sky-500",
          textAccent: "text-sky-400",
          borderGlow: "border-sky-500/50 shadow-sky-900/30",
          badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/30",
        };
      case "r_pink":
        return {
          colors: ["#1e293b", "#be185d", "#f43f5e", "#fb7185", "#fecdd3"],
          activeBg: "bg-rose-500",
          textAccent: "text-rose-400",
          borderGlow: "border-rose-500/50 shadow-rose-900/30",
          badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30",
        };
      case "ssr_matrix":
        return {
          colors: ["#0d1117", "#0e4429", "#006d32", "#26a641", "#39d353"],
          activeBg: "bg-green-500",
          textAccent: "text-green-400",
          borderGlow: "border-green-500/50 shadow-green-900/30",
          badgeBg: "bg-green-500/20 text-green-300 border-green-500/30",
        };
      default:
        return {
          colors: ["#18181b", "#064e3b", "#047857", "#10b981", "#34d399"],
          activeBg: "bg-emerald-500",
          textAccent: "text-emerald-400",
          borderGlow: "border-emerald-500/50 shadow-emerald-900/30",
          badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        };
    }
  }, [equippedTheme]);

  const daysHeader = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl text-white my-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <h3 className={`font-bold text-base ${themeConfig.textAccent}`}>
            Quest Activity
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-semibold ml-1 ${themeConfig.badgeBg}`}
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
        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("week")}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === "week"
                ? `${themeConfig.activeBg} text-slate-950 font-bold shadow-md`
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setActiveTab("month")}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === "month"
                ? `${themeConfig.activeBg} text-slate-950 font-bold shadow-md`
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === "all"
                ? `${themeConfig.activeBg} text-slate-950 font-bold shadow-md`
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Keseluruhan
          </button>
        </div>
      </div>

      {/* BODY CONTENT */}
      {loading ? (
        <div className="h-28 flex items-center justify-center text-xs text-slate-500 animate-pulse">
          Loading matrix data...
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
                        ? "ring-2 ring-emerald-400/80 bg-slate-800/90"
                        : "bg-slate-950/50"
                    } ${
                      hasQuest
                        ? `${themeConfig.borderGlow} shadow-lg`
                        : "border-slate-800/60 opacity-70"
                    }`}
                  >
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      {item.dayName}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-200 my-1">
                      {item.dayNum}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold ${
                        hasQuest
                          ? `${themeConfig.activeBg} text-slate-950 shadow-sm`
                          : "bg-slate-800/80 text-slate-600"
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
              <div className="text-xs font-semibold text-slate-400 text-center uppercase tracking-wider">
                {monthCalendarData.monthName}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {daysHeader.map((d, i) => (
                  <div
                    key={i}
                    className="text-[10px] font-bold text-slate-500 uppercase"
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
                        className="h-8 sm:h-9 rounded-lg bg-slate-950/20 border border-transparent"
                      />
                    );
                  }

                  const hasQuest = cell.count > 0;
                  return (
                    <div
                      key={cell.key}
                      className={`h-8 sm:h-9 rounded-lg flex flex-col items-center justify-center relative border transition-all ${
                        cell.isToday
                          ? "ring-2 ring-emerald-400/90 bg-slate-800 font-extrabold"
                          : "bg-slate-950/60"
                      } ${
                        hasQuest
                          ? `${themeConfig.borderGlow} bg-slate-800/80 shadow-md`
                          : "border-slate-800/50 text-slate-500"
                      }`}
                    >
                      <span className="text-[11px] text-slate-200 font-semibold">
                        {cell.dayNum}
                      </span>

                      {hasQuest && (
                        <span
                          className={`absolute -top-1 -right-1 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ${themeConfig.activeBg} text-slate-950 shadow-sm`}
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
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2 text-center">
                  <div className="text-[10px] text-slate-400 font-medium">
                    Jumlah Hari Aktif
                  </div>
                  <div
                    className={`text-sm sm:text-base font-black ${themeConfig.textAccent}`}
                  >
                    {overallStats.activeDays}{" "}
                    <span className="text-[10px] text-slate-500 font-normal">
                      Hari
                    </span>
                  </div>
                </div>

                {/* 2. Rekor Sehari */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2 text-center">
                  <div className="text-[10px] text-slate-400 font-medium">
                    Rekor Sehari
                  </div>
                  <div className="text-sm sm:text-base font-black text-amber-400">
                    {overallStats.maxSingleDay}{" "}
                    <span className="text-[10px] text-slate-500 font-normal">
                      Quests
                    </span>
                  </div>
                </div>

                {/* 3. Kosmetik Terbuka */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2 text-center">
                  <div className="text-[10px] text-slate-400 font-medium">
                    Kosmetik Terbuka
                  </div>
                  <div className="text-sm sm:text-base font-black text-purple-400">
                    {unlockedCosmeticsCount}{" "}
                    <span className="text-[10px] text-slate-500 font-normal">
                      Items
                    </span>
                  </div>
                </div>
              </div>

              {/* Heatmap Full Year */}
              <div className="w-full overflow-x-auto flex justify-center py-2 bg-slate-950/50 border border-slate-800/60 rounded-xl scrollbar-thin scrollbar-thumb-slate-700">
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