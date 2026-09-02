import React, { useState } from "react";

const QuestSection = ({
  habits,
  newHabitName,
  setNewHabitName,
  addHabit,
  completeHabit,
  deleteHabit,
  onReorderHabits, // Callback untuk reorder habits
  // Tambahin prop tema di sini nanti kalau mau bikin varian lain,
  // contoh: isMatrixMode, isDarkMode, dst — samain sama pola
  // yang dipakai di Inventory.jsx / HabitHeatmap.jsx
}) => {
  const [draggedHabit, setDraggedHabit] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // ─────────────────────────────────────────────────────────
  // THEME CONFIG - tambahin key baru di sini (misal "wireframe")
  // buat bikin varian tema baru tanpa nyentuh JSX di bawah
  // ─────────────────────────────────────────────────────────
  const themeConfig = {
    // DEFAULT - mengikuti visual LeaderboardSection (hijau)
    light: {
      headerBorderClass: "border-gray-300",
      titleClass: "text-gray-900",
      containerClass: "bg-white border-gray-200 shadow-sm",
      inputClass:
        "border-gray-300 focus:ring-2 focus:ring-[#51b330] focus:border-[#51b330]",
      addButtonClass: "bg-[#51b330] text-white hover:bg-[#409228]",
      dividerClass: "border-gray-200",
      emptyStateClass: "border-gray-300 text-gray-600",
      cardBase: "bg-white border-gray-200 shadow-sm",
      cardDragging: "opacity-50 bg-gray-50 border-gray-200",
      cardDragOver: "bg-green-50 border-l-[#51b330] border-gray-200",
      cardCompleted: "bg-gray-50 border-l-gray-300 border-gray-200",
      cardActive: "bg-white border-l-[#51b330] border-gray-200",
      titleCompletedClass: "text-gray-500 line-through",
      titleActiveClass: "text-gray-900",
      streakCompletedClass: "text-gray-400",
      streakActiveClass: "text-orange-500",
      completeButtonClass: "bg-[#51b330] text-white hover:bg-[#409228]",
      clearedBadgeClass: "text-[#1e720f] bg-green-50 border-green-200",
      deleteButtonClass: "text-gray-400 hover:text-red-500 hover:bg-red-50",
    },
  };

  const theme = themeConfig.light; // ganti sesuai kondisi tema kalau udah nambah varian

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

    // Call parent callback to update order
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

  return (
    <div className="w-full">
      {/* Section Header */}
      <div
        className={`text-left mt-8 mb-4 border-b pb-2 ${theme.headerBorderClass}`}
      >
        <h2 className={`text-2xl font-black ${theme.titleClass}`}>
          Daily Quests
        </h2>
      </div>

      {/* Background Container */}
      <div className={`border p-6 ${theme.containerClass}`}>
        {/* Form Add Quest */}
        <form onSubmit={addHabit} className="mb-6 flex gap-2 items-center">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Add a new daily quest..."
            className={`flex-1 min-w-0 px-4 py-2 text-sm border focus:outline-none ${theme.inputClass}`}
          />
          <button
            type="submit"
            className={`px-5 py-2 text-sm font-black active:scale-95 transition-all shadow-sm ${theme.addButtonClass}`}
          >
            Add Quest
          </button>
        </form>

        {/* Divider */}
        <div className={`border-t mb-4 ${theme.dividerClass}`}></div>

        {/* Habits List */}
        <div className="space-y-3">
          {habits.length === 0 ? (
            <div className={`p-6 text-center border ${theme.emptyStateClass}`}>
              <p>No quests yet. Add one to get started!</p>
            </div>
          ) : (
            habits.map((habit, index) => (
              <div
                key={habit.id}
                draggable
                onDragStart={(e) => handleDragStart(e, habit)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, habit)}
                onDragEnd={handleDragEnd}
                className={`p-4 border-l-4 border flex justify-between items-center transition-all cursor-move ${
                  draggedHabit?.id === habit.id
                    ? theme.cardDragging
                    : dragOverIndex === index
                      ? theme.cardDragOver
                      : habit.is_completed
                        ? theme.cardCompleted
                        : theme.cardActive
                }`}
              >
                <div className="text-left flex-1">
                  <h3
                    className={`text-lg font-semibold ${
                      habit.is_completed
                        ? theme.titleCompletedClass
                        : theme.titleActiveClass
                    }`}
                  >
                    {habit.name}
                  </h3>
                  <p
                    className={`text-sm font-bold mt-1 ${
                      habit.is_completed
                        ? theme.streakCompletedClass
                        : theme.streakActiveClass
                    }`}
                  >
                    🔥 {habit.streak} Day Streak
                  </p>
                </div>

                <div className="flex gap-2 items-center ml-4 shrink-0">
                  {!habit.is_completed ? (
                    <button
                      type="button"
                      onClick={() => completeHabit(habit.id)}
                      className={`px-4 py-2 font-semibold active:scale-95 transition-all shadow-sm text-sm ${theme.completeButtonClass}`}
                    >
                      Complete
                    </button>
                  ) : (
                    <span
                      className={`px-4 py-2 font-semibold border text-sm ${theme.clearedBadgeClass}`}
                    >
                      Cleared!
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteHabit(habit.id)}
                    className={`p-2 transition-colors ${theme.deleteButtonClass}`}
                    title="Delete Quest"
                  >
                    X
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
