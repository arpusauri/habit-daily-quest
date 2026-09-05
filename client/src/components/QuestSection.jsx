import React, { useState } from "react";

import StreakIcon from "../assets/icons/check.svg?react";

const QuestSection = ({
  habits,
  newHabitName,
  setNewHabitName,
  addHabit,
  completeHabit,
  deleteHabit,
  onReorderHabits, // Callback untuk reorder habits
}) => {
  const [draggedHabit, setDraggedHabit] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'completed'

  // Handle drag start
  const handleDragStart = (e, habit) => {
    setDraggedHabit(habit);
    e.dataTransfer.effectAllowed = "move";
  };

  // Handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  // Handle drop
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

  // Handle drag end
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
      {/* Top Bar: Search + Filter + Add */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-8 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quests..."
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#51b330] focus:border-[#51b330]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex bg-gray-100 border border-gray-200 rounded-sm p-1 shrink-0">
          {["all", "active", "completed"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm capitalize transition-all ${
                statusFilter === f
                  ? "bg-[#51b330] text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Board Column */}
      <div className="bg-gray-50 border border-gray-200 rounded-sm">
        {/* Column Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-100/70">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">
            Daily Quests
          </h2>
          <span className="bg-[#51b330] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {activeCount}
          </span>
        </div>

        {/* Add Quest Row - selalu keliatan */}
        <form
          onSubmit={addHabit}
          className="flex gap-2 items-center p-3 border-b border-gray-200 bg-white"
        >
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Add a new daily quest..."
            className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#51b330] focus:border-[#51b330]"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-black text-white bg-[#51b330] hover:bg-[#409228] active:scale-95 transition-all rounded-sm shrink-0"
          >
            Add Quest
          </button>
        </form>

        {/* Habits List */}
        <div className="p-4 space-y-3">
          {filteredHabits.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-gray-300 rounded-sm text-gray-500 text-sm">
              {habits.length === 0
                ? "No quests yet. Add one to get started!"
                : "No quests match your search or filter."}
            </div>
          ) : (
            filteredHabits.map((habit, index) => (
              <div
                key={habit.id}
                draggable
                onDragStart={(e) => handleDragStart(e, habit)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, habit)}
                onDragEnd={handleDragEnd}
                className={`p-5 border-l-4 border rounded-sm bg-white flex justify-between items-center transition-all cursor-move ${
                  draggedHabit?.id === habit.id
                    ? "opacity-50 bg-gray-50 border-gray-200"
                    : dragOverIndex === index
                      ? "bg-green-50 border-l-[#51b330] border-gray-200"
                      : habit.is_completed
                        ? "bg-gray-50 border-l-gray-300 border-gray-200"
                        : "border-l-[#51b330] border-gray-200"
                }`}
              >
                <div className="text-left flex-1 min-w-0">
                  <h3
                    className={`text-base font-semibold truncate ${
                      habit.is_completed
                        ? "text-gray-500 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    {habit.name}
                  </h3>
                  <p className="text-xs font-bold mt-2 text-gray-400 flex items-center gap-1">
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
                      className="px-4 py-2 text-xs font-black text-white bg-[#51b330] hover:bg-[#409228] active:scale-95 transition-all rounded-sm"
                    >
                      Complete
                    </button>
                  ) : (
                    <span className="px-4 py-2 text-xs font-black text-[#1e720f] bg-green-50 border border-green-200 rounded-sm">
                      Cleared!
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteHabit(habit.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-sm"
                    title="Delete Quest"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestSection;
