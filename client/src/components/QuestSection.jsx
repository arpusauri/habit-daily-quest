import React, { useState } from "react";
import StreakIcon from "../assets/icons/check.svg?react";

// Konfigurasi Tema
const THEMES = {
  default: {
    bg: "bg-gray-50",
    boardBg: "bg-gray-100/70",
    cardBg: "bg-white",
    filterContainerBg: "bg-gray-100",
    textPrimary: "text-gray-900",
    textSecondary: "text-gray-500",
    textMuted: "text-gray-400",
    border: "border-gray-200",
    borderInput: "border-gray-300",
    borderLActive: "border-l-[#51b330]",
    borderLCompleted: "border-l-gray-300",
    accent: "bg-[#51b330]",
    accentHover: "hover:bg-[#409228]",
    accentText: "text-[#1e720f]",
    accentRing: "focus:ring-[#51b330] focus:border-[#51b330]",
    activeTab: "bg-[#51b330] text-white",
    inactiveTab: "text-gray-500 hover:text-gray-900",
    clearedBg: "bg-green-50 border-green-200",
    dragOver: "bg-green-50 border-l-[#51b330]",
    completedCard: "bg-gray-50",
    inputBg: "bg-white text-gray-900",
    deleteBtn: "text-gray-400 hover:text-red-500 hover:bg-red-50",
  },
  obsidian: {
    bg: "bg-[#121212]",
    boardBg: "bg-[#1a1a1a]",
    cardBg: "bg-[#1e1e1e]",
    filterContainerBg: "bg-[#1e1e1e]",
    textPrimary: "text-gray-100",
    textSecondary: "text-gray-400",
    textMuted: "text-gray-500",
    border: "border-gray-800",
    borderInput: "border-gray-700",
    borderLActive: "border-l-[#7c3aed]", // Aksen ungu obsidian
    borderLCompleted: "border-l-gray-700",
    accent: "bg-[#7c3aed]",
    accentHover: "hover:bg-[#6d28d9]",
    accentText: "text-[#c4b5fd]",
    accentRing: "focus:ring-[#7c3aed] focus:border-[#7c3aed]",
    activeTab: "bg-[#7c3aed] text-white",
    inactiveTab: "text-gray-500 hover:text-gray-300",
    clearedBg: "bg-[#2e1065]/30 border-[#4c1d95]",
    dragOver: "bg-[#2e1065]/20 border-l-[#7c3aed]",
    completedCard: "bg-[#121212]",
    inputBg: "bg-[#1a1a1a] text-gray-100 placeholder-gray-600",
    deleteBtn: "text-gray-600 hover:text-red-400 hover:bg-red-950/30",
  },
  matrix: {
    bg: "bg-black",
    boardBg: "bg-black",
    cardBg: "bg-[#0d1f0d]",
    filterContainerBg: "bg-[#0d1f0d]",
    textPrimary: "text-[#00ff41]",
    textSecondary: "text-[#008f11]",
    textMuted: "text-[#005900]",
    border: "border-[#008f11]",
    borderInput: "border-[#008f11]",
    borderLActive: "border-l-[#00ff41]",
    borderLCompleted: "border-l-[#003b00]",
    accent: "bg-[#008f11]",
    accentHover: "hover:bg-[#00ff41] hover:text-black",
    accentText: "text-[#00ff41]",
    accentRing: "focus:ring-[#00ff41] focus:border-[#00ff41]",
    activeTab: "bg-[#008f11] text-black",
    inactiveTab: "text-[#008f11] hover:text-[#00ff41]",
    clearedBg: "bg-[#003b00]/50 border-[#008f11]",
    dragOver: "bg-[#003b00]/30 border-l-[#00ff41]",
    completedCard: "bg-black",
    inputBg: "bg-black text-[#00ff41] placeholder-[#005900]",
    deleteBtn: "text-[#008f11] hover:text-red-500",
  },

  // 2. AURORA DREAM THEME
  aurora: {
    bg: "bg-[#0b0f19]",
    boardBg: "bg-[#111827]/80",
    cardBg: "bg-[#1e293b]",
    filterContainerBg: "bg-[#1e293b]",
    textPrimary: "text-cyan-50",
    textSecondary: "text-cyan-300",
    textMuted: "text-indigo-400",
    border: "border-indigo-500/30",
    borderInput: "border-indigo-400/50",
    borderLActive: "border-l-fuchsia-500",
    borderLCompleted: "border-l-indigo-900",
    accent: "bg-gradient-to-r from-cyan-500 to-fuchsia-500",
    accentHover: "hover:from-cyan-400 hover:to-fuchsia-400",
    accentText: "text-fuchsia-300",
    accentRing: "focus:ring-fuchsia-500 focus:border-fuchsia-500",
    activeTab: "bg-fuchsia-500 text-white",
    inactiveTab: "text-indigo-300 hover:text-cyan-200",
    clearedBg: "bg-fuchsia-900/30 border-fuchsia-500/50",
    dragOver: "bg-fuchsia-900/20 border-l-cyan-400",
    completedCard: "bg-[#0b0f19]",
    inputBg: "bg-[#0b0f19] text-cyan-50 placeholder-indigo-500",
    deleteBtn: "text-indigo-400 hover:text-pink-400",
  },

  // 3. STARFORGE CELESTIAL
  starforge: {
    bg: "bg-slate-950",
    boardBg: "bg-slate-900",
    cardBg: "bg-slate-800",
    filterContainerBg: "bg-slate-800",
    textPrimary: "text-amber-50",
    textSecondary: "text-amber-200/70",
    textMuted: "text-slate-500",
    border: "border-amber-900/30",
    borderInput: "border-slate-700",
    borderLActive: "border-l-amber-400",
    borderLCompleted: "border-l-slate-700",
    accent: "bg-amber-600",
    accentHover: "hover:bg-amber-500",
    accentText: "text-amber-400",
    accentRing: "focus:ring-amber-500 focus:border-amber-500",
    activeTab: "bg-amber-600 text-white",
    inactiveTab: "text-slate-400 hover:text-amber-200",
    clearedBg: "bg-amber-950/50 border-amber-800",
    dragOver: "bg-amber-900/20 border-l-amber-300",
    completedCard: "bg-slate-900",
    inputBg: "bg-slate-950 text-amber-50 placeholder-slate-600",
    deleteBtn: "text-slate-500 hover:text-red-400",
  },

  // 4. NOTEPAD THEME
  notepad: {
    bg: "bg-yellow-50",
    boardBg: "bg-yellow-100/50",
    cardBg: "bg-white",
    filterContainerBg: "bg-white",
    textPrimary: "text-blue-900", // Tinta pulpen
    textSecondary: "text-blue-700/70",
    textMuted: "text-blue-400",
    border: "border-blue-200", // Garis buku tulis
    borderInput: "border-blue-300",
    borderLActive: "border-l-red-500", // Garis margin merah
    borderLCompleted: "border-l-gray-300",
    accent: "bg-red-500",
    accentHover: "hover:bg-red-600",
    accentText: "text-red-600",
    accentRing: "focus:ring-red-400 focus:border-red-400",
    activeTab: "bg-red-500 text-white",
    inactiveTab: "text-blue-500 hover:text-blue-900",
    clearedBg: "bg-blue-50 border-blue-200",
    dragOver: "bg-red-50 border-l-red-600",
    completedCard: "bg-yellow-50/50",
    inputBg: "bg-white text-blue-900 placeholder-blue-300",
    deleteBtn: "text-blue-300 hover:text-red-500",
  },
};

const QuestSection = ({
  habits,
  newHabitName,
  setNewHabitName,
  addHabit,
  completeHabit,
  deleteHabit,
  onReorderHabits,
  isMatrixMode,
  isDarkMode,
  isAuroraMode,
  isStarforgeMode,
  isNotepadMode,
  equippedTheme,
}) => {
  const [draggedHabit, setDraggedHabit] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  let activeThemeKey = "default";
  if (isMatrixMode) activeThemeKey = "matrix";
  else if (isAuroraMode) activeThemeKey = "aurora";
  else if (isStarforgeMode) activeThemeKey = "starforge";
  else if (isNotepadMode) activeThemeKey = "notepad";
  else if (isDarkMode) activeThemeKey = "obsidian";

  const t = THEMES[activeThemeKey] || THEMES.default;

  const handleDragStart = (e, habit) => {
    setDraggedHabit(habit);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, targetHabit) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedHabit || draggedHabit.id === targetHabit.id) {
      setDraggedHabit(null);
      return;
    }

    const draggedIndex = habits.findIndex((h) => h.id === draggedHabit.id);
    const targetIndex = habits.findIndex((h) => h.id === targetHabit.id);

    const newHabits = [...habits];
    newHabits.splice(draggedIndex, 1);
    newHabits.splice(targetIndex, 0, draggedHabit);

    if (onReorderHabits) {
      onReorderHabits(newHabits);
    }

    setDraggedHabit(null);
  };

  const handleDragEnd = () => {
    setDraggedHabit(null);
    setDragOverIndex(null);
  };

  const filteredHabits = habits.filter((habit) => {
    if (
      searchQuery &&
      !habit.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    if (statusFilter === "active" && habit.is_completed) return false;
    if (statusFilter === "completed" && !habit.is_completed) return false;
    return true;
  });

  const activeCount = habits.filter((h) => !h.is_completed).length;

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      {/* Top Bar: Search + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-8 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quests..."
            className={`w-full px-4 py-2 text-sm border rounded-sm focus:outline-none focus:ring-2 ${t.inputBg} ${t.borderInput} ${t.accentRing}`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${t.textMuted} hover:${t.textPrimary}`}
            >
              ✕
            </button>
          )}
        </div>

        <div
          className={`flex border rounded-sm p-1 shrink-0 ${t.filterContainerBg} ${t.border}`}
        >
          {["all", "active", "completed"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm capitalize transition-all cursor-pointer ${
                statusFilter === f ? t.activeTab : t.inactiveTab
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Board Column */}
      <div className={`border rounded-sm ${t.bg} ${t.border}`}>
        {/* Column Header */}
        <div
          className={`flex items-center gap-2 px-4 py-3 border-b ${t.boardBg} ${t.border}`}
        >
          <h2
            className={`text-sm font-black uppercase tracking-wide ${t.textPrimary}`}
          >
            Daily Quests
          </h2>
          <span
            className={`text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${t.accent}`}
          >
            {activeCount}
          </span>
        </div>

        {/* Add Quest Row */}
        <form
          onSubmit={addHabit}
          className={`flex gap-2 items-center p-3 border-b ${t.cardBg} ${t.border}`}
        >
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Add a new daily quest..."
            className={`flex-1 min-w-0 px-3 py-2 text-sm border rounded-sm focus:outline-none focus:ring-2 ${t.inputBg} ${t.borderInput} ${t.accentRing}`}
          />
          <button
            type="submit"
            className={`px-4 py-2 text-sm font-black text-white transition-all rounded-sm shrink-0 cursor-pointer ${t.accent} ${t.accentHover} active:scale-95`}
          >
            Add Quest
          </button>
        </form>

        {/* Habits List */}
        <div className="p-4 space-y-3">
          {filteredHabits.length === 0 ? (
            <div
              className={`p-6 text-center border border-dashed rounded-sm text-sm ${t.borderInput} ${t.textSecondary}`}
            >
              {habits.length === 0
                ? "No quests yet. Add one to get started!"
                : "No quests match your search or filter."}
            </div>
          ) : (
            filteredHabits.map((habit, index) => {
              // Menentukan state background dan border item
              let itemClasses = "";
              if (draggedHabit?.id === habit.id) {
                itemClasses = `opacity-50 ${t.boardBg} ${t.border}`;
              } else if (dragOverIndex === index) {
                itemClasses = `${t.dragOver} ${t.border}`;
              } else if (habit.is_completed) {
                itemClasses = `${t.completedCard} ${t.borderLCompleted} ${t.border}`;
              } else {
                itemClasses = `${t.cardBg} ${t.borderLActive} ${t.border}`;
              }

              return (
                <div
                  key={habit.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, habit)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, habit)}
                  onDragEnd={handleDragEnd}
                  className={`p-5 border-l-4 border rounded-sm flex justify-between items-center transition-all cursor-move ${itemClasses}`}
                >
                  <div className="text-left flex-1 min-w-0">
                    <h3
                      className={`text-base font-semibold truncate ${
                        habit.is_completed
                          ? `${t.textSecondary} line-through`
                          : t.textPrimary
                      }`}
                    >
                      {habit.name}
                    </h3>
                    <p
                      className={`text-xs font-bold mt-2 flex items-center gap-1 ${t.textMuted}`}
                    >
                      <span className="relative group inline-flex">
                        <StreakIcon className="w-3.5 h-3.5 cursor-help" />
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          Streak Counter
                        </span>
                      </span>
                      {habit.streak}
                    </p>
                  </div>

                  <div className="flex gap-2 items-center ml-4 shrink-0">
                    {!habit.is_completed ? (
                      <button
                        type="button"
                        onClick={() => completeHabit(habit.id)}
                        className={`px-4 py-2 text-xs font-black text-white transition-all rounded-sm cursor-pointer active:scale-95 ${t.accent} ${t.accentHover}`}
                      >
                        Complete
                      </button>
                    ) : (
                      <span
                        className={`px-4 py-2 text-xs font-black border rounded-sm ${t.clearedBg} ${t.accentText}`}
                      >
                        Cleared!
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteHabit(habit.id)}
                      className={`p-2 transition-colors rounded-sm cursor-pointer ${t.deleteBtn}`}
                      title="Delete Quest"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestSection;
