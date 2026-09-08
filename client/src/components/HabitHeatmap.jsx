import React, { useEffect, useState, useMemo } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { supabase } from "../supabaseClient";

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const DAYS_HEADER = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const HEATMAP_COLORS = ["#f0fdf4", "#bbf7d0", "#4ade80", "#22c55e", "#166534"];

const HabitHeatmap = ({ apiUrl = "", refreshTrigger }) => {
  const [activeTab, setActiveTab] = useState("week");
  const [rawApiData, setRawApiData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const dataMap = useMemo(() => {
    const map = new Map();
    rawApiData.forEach((item) => map.set(item.date, item));
    return map;
  }, [rawApiData]);

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

  const overallStats = useMemo(() => {
    let activeDays = 0,
      maxSingleDay = 0,
      longestStreak = 0,
      currentStreak = 0;
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

  const activeTotalQuests = useMemo(() => {
    if (activeTab === "week")
      return weekData.reduce((acc, curr) => acc + (curr.count || 0), 0);
    if (activeTab === "month")
      return monthCalendarData.cells.reduce(
        (acc, curr) => acc + (curr.count || 0),
        0,
      );
    return yearData.reduce((acc, curr) => acc + (curr.count || 0), 0);
  }, [activeTab, weekData, monthCalendarData, yearData]);

  return (
    <div className="w-full max-w-5xl mx-auto pb-12 mt-8 px-4 sm:px-0">
      {/* 1. KELUARKAN STATS KE ATAS AGAR SELALU TERISI */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-sm p-4 text-center border border-gray-200 bg-white shadow-sm flex flex-col items-center justify-center">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Hari Aktif
          </div>
          <div className="text-2xl font-black text-[#1e720f]">
            {overallStats.activeDays}{" "}
            <span className="text-xs font-semibold text-gray-400">Hari</span>
          </div>
        </div>
        <div className="rounded-sm p-4 text-center border border-gray-200 bg-white shadow-sm flex flex-col items-center justify-center">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Rekor Sehari
          </div>
          <div className="text-2xl font-black text-[#1e720f]">
            {overallStats.maxSingleDay}{" "}
            <span className="text-xs font-semibold text-gray-400">Quests</span>
          </div>
        </div>
        <div className="rounded-sm p-4 text-center border border-gray-200 bg-white shadow-sm flex flex-col items-center justify-center">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Max Streak
          </div>
          <div className="text-2xl font-black text-[#1e720f]">
            {overallStats.longestStreak}{" "}
            <span className="text-xs font-semibold text-gray-400">Hari</span>
          </div>
        </div>
      </div>

      {/* 2. BUNGKUS HEATMAP DENGAN BOARD SEPERTI QUEST SECTION */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col">
        {/* Board Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-200 px-6 pt-4 bg-gray-50/70">
          <div className="flex items-center gap-3 mb-4 sm:mb-3">
            <h2 className="text-base font-black text-gray-900 uppercase tracking-wide">
              Activity Logs
            </h2>
            <span className="bg-[#51b330] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center justify-center">
              {activeTotalQuests} Total
            </span>
          </div>

          <div className="flex overflow-x-auto gap-6 -mb-[1px]">
            {[
              { id: "week", label: "This Week" },
              { id: "month", label: "This Month" },
              { id: "all", label: "All Time" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-bold whitespace-nowrap transition-all border-b-4 cursor-pointer ${
                  activeTab === tab.id
                    ? "border-[#1e720f] text-[#1e720f]"
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Board Content */}
        <div className="p-6 sm:p-10 bg-gray-50/30 flex justify-center items-start min-h-[350px]">
          {loading ? (
            <div className="text-xs font-bold text-gray-400 animate-pulse mt-10">
              Memuat data aktivitas...
            </div>
          ) : (
            <div className="w-full flex justify-center">
              {activeTab === "week" && (
                <div className="grid grid-cols-7 gap-3 sm:gap-4 w-full max-w-4xl">
                  {weekData.map((item, idx) => {
                    const hasQuest = item.count > 0;
                    return (
                      <div
                        key={idx}
                        className={`relative flex flex-col items-center justify-between p-4 rounded-sm border transition-all ${
                          item.isToday
                            ? "ring-2 ring-[#51b330]/50 bg-green-50"
                            : "bg-white"
                        } ${hasQuest ? "border-[#51b330]/50 shadow-sm" : "border-gray-200"}`}
                      >
                        <span className="text-[11px] font-bold uppercase text-gray-400 mb-2">
                          {item.dayName}
                        </span>
                        <span className="text-lg font-black text-gray-900 mb-3">
                          {item.dayNum}
                        </span>
                        <div
                          className={`w-full py-1.5 rounded flex items-center justify-center text-xs font-black ${
                            hasQuest
                              ? "bg-[#51b330] text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {hasQuest ? `+${item.count}` : "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === "month" && (
                <div className="w-full max-w-3xl bg-white p-6 rounded-sm border border-gray-200 shadow-sm">
                  <div className="text-sm font-black text-center uppercase tracking-widest text-gray-800 mb-6">
                    {monthCalendarData.monthName}
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {DAYS_HEADER.map((d, i) => (
                      <div
                        key={i}
                        className="text-[11px] font-bold uppercase text-gray-400"
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {monthCalendarData.cells.map((cell) => {
                      if (cell.isBlank)
                        return (
                          <div key={cell.key} className="h-12 bg-transparent" />
                        );
                      const hasQuest = cell.count > 0;
                      return (
                        <div
                          key={cell.key}
                          className={`h-12 rounded flex flex-col items-center justify-center relative border transition-all ${
                            cell.isToday
                              ? "ring-2 ring-[#51b330]/50 bg-green-50"
                              : "bg-gray-50"
                          } ${hasQuest ? "border-[#51b330]/60 shadow-sm" : "border-transparent"}`}
                        >
                          <span
                            className={`text-sm font-bold ${hasQuest ? "text-[#1e720f]" : "text-gray-500"}`}
                          >
                            {cell.dayNum}
                          </span>
                          {hasQuest && (
                            <span className="absolute -top-2 -right-2 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center bg-[#51b330] text-white shadow-sm border-2 border-white">
                              {cell.count}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "all" && (
                <div className="w-full overflow-x-auto flex justify-center p-6 rounded-sm border border-gray-200 bg-white shadow-sm">
                  <ActivityCalendar
                    data={yearData}
                    theme={{ dark: HEATMAP_COLORS, light: HEATMAP_COLORS }}
                    blockSize={12}
                    blockMargin={4}
                    blockRadius={2}
                    fontSize={12}
                    showWeekdayLabels={true}
                    labels={{
                      legend: { less: "Relax", more: "Grind" },
                      totalCount: "{{count}} Quests logged in 365 days",
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitHeatmap;
