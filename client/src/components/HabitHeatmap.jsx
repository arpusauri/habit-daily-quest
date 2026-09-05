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

const HEATMAP_COLORS = ["#f0fdf4", "#bbf7d0", "#4ade80", "#22c55e", "#166534"];

const HabitHeatmap = ({ apiUrl = "", refreshTrigger }) => {
  const [activeTab, setActiveTab] = useState("week"); // 'week' | 'month' | 'all'
  const [rawApiData, setRawApiData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const tabLabel = {
    week: "minggu ini",
    month: "bulan ini",
    all: "total",
  }[activeTab];

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Top Bar: Title + Tabs */}
      <div className="border-b border-gray-200 px-6 pt-4 bg-gray-50/50">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xl font-black text-gray-900">Activity</h2>
          <span className="text-xs font-bold text-[#1e720f] bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
            {activeTotalQuests} {tabLabel}
          </span>
        </div>

        <div className="flex overflow-x-auto gap-6 -mb-[1px]">
          {["week", "month", "all"].map((tabKey) => {
            const labels = {
              week: "This Week",
              month: "This Month",
              all: "Keseluruhan",
            };
            return (
              <button
                key={tabKey}
                type="button"
                onClick={() => setActiveTab(tabKey)}
                className={`pb-3 text-sm font-bold whitespace-nowrap transition-all border-b-4 ${
                  activeTab === tabKey
                    ? "border-[#1e720f] text-[#1e720f]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {labels[tabKey]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1">
        {loading ? (
          <div className="h-28 flex items-center justify-center text-xs text-gray-400 animate-pulse">
            Memuat data aktivitas...
          </div>
        ) : (
          <div className="w-full">
            {/* TAB 1: THIS WEEK */}
            {activeTab === "week" && (
              <div className="grid grid-cols-7 gap-2 sm:gap-3 max-w-3xl">
                {weekData.map((item, idx) => {
                  const hasQuest = item.count > 0;
                  return (
                    <div
                      key={idx}
                      className={`relative flex flex-col items-center justify-between p-3 rounded-lg border transition-all ${
                        item.isToday
                          ? "ring-2 ring-[#51b330]/40 bg-green-50"
                          : "bg-white"
                      } ${
                        hasQuest
                          ? "border-[#51b330]/50 shadow-sm"
                          : "border-gray-200 opacity-70"
                      }`}
                    >
                      <span className="text-[10px] font-semibold uppercase text-gray-500">
                        {item.dayName}
                      </span>
                      <span className="text-sm font-bold my-1 text-gray-900">
                        {item.dayNum}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-extrabold ${
                          hasQuest
                            ? "bg-[#51b330] text-white shadow-sm"
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

            {/* TAB 2: THIS MONTH */}
            {activeTab === "month" && (
              <div className="space-y-3 max-w-2xl">
                <div className="text-xs font-semibold text-center uppercase tracking-wider text-gray-500">
                  {monthCalendarData.monthName}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {DAYS_HEADER.map((d, i) => (
                    <div
                      key={i}
                      className="text-[10px] font-bold uppercase text-gray-500"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {monthCalendarData.cells.map((cell) => {
                    if (cell.isBlank) {
                      return (
                        <div
                          key={cell.key}
                          className="h-10 rounded-lg border border-transparent bg-transparent"
                        />
                      );
                    }

                    const hasQuest = cell.count > 0;
                    return (
                      <div
                        key={cell.key}
                        className={`h-10 rounded-lg flex flex-col items-center justify-center relative border transition-all ${
                          cell.isToday
                            ? "ring-2 ring-[#51b330]/40 bg-green-50"
                            : "bg-white"
                        } ${
                          hasQuest
                            ? "border-[#51b330]/50 shadow-sm"
                            : "border-gray-200 opacity-70"
                        }`}
                      >
                        <span className="text-xs font-semibold text-gray-900">
                          {cell.dayNum}
                        </span>
                        {hasQuest && (
                          <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center bg-[#51b330] text-white shadow-sm">
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
              <div className="space-y-4 max-w-4xl">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg p-3 text-center border border-gray-200 bg-white shadow-sm">
                    <div className="text-xs font-medium text-gray-500">
                      Hari Aktif
                    </div>
                    <div className="text-lg font-black text-[#1e720f]">
                      {overallStats.activeDays}{" "}
                      <span className="text-xs font-normal text-gray-500">
                        Hari
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg p-3 text-center border border-gray-200 bg-white shadow-sm">
                    <div className="text-xs font-medium text-gray-500">
                      Rekor Sehari
                    </div>
                    <div className="text-lg font-black text-[#1e720f]">
                      {overallStats.maxSingleDay}{" "}
                      <span className="text-xs font-normal text-gray-500">
                        Quests
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg p-3 text-center border border-gray-200 bg-white shadow-sm">
                    <div className="text-xs font-medium text-gray-500">
                      Streak Terpanjang
                    </div>
                    <div className="text-lg font-black text-[#1e720f]">
                      {overallStats.longestStreak}{" "}
                      <span className="text-xs font-normal text-gray-500">
                        Hari
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full overflow-x-auto flex justify-center py-3 rounded-lg border border-gray-200 bg-white shadow-sm">
                  <ActivityCalendar
                    data={yearData}
                    theme={{ dark: HEATMAP_COLORS, light: HEATMAP_COLORS }}
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
    </div>
  );
};

export default HabitHeatmap;
