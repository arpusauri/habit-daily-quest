import React, { useState } from "react";

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
      <div className="text-left mt-8 mb-4 border-b border-gray-300 pb-2">
        <h2 className="text-2xl font-black text-gray-900">Daily Quests</h2>
      </div>

      {/* Background Container */}
      <div className="bg-white border border-gray-200 p-6">
        {/* Form Add Quest */}
        <form onSubmit={addHabit} className="mb-6 flex gap-2 items-center">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Add a new daily quest..."
            className="flex-1 min-w-0 px-4 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-5 py-2 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
          >
            Add Quest
          </button>
        </form>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-4"></div>

        {/* Habits List */}
        <div className="space-y-3">
          {habits.length === 0 ? (
            <div className="p-6 text-center border border-gray-300">
              <p className="text-gray-600">
                No quests yet. Add one to get started!
              </p>
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
                className={`p-4 border-l-4 flex justify-between items-center transition-all cursor-move ${
                  draggedHabit?.id === habit.id
                    ? "opacity-50 bg-gray-50"
                    : dragOverIndex === index
                      ? "bg-blue-50 border-l-blue-500"
                      : habit.is_completed
                        ? "bg-gray-50 border-l-gray-300"
                        : "bg-white border-l-blue-500"
                } ${habit.is_completed ? "border border-gray-200" : "border border-gray-300"}`}
              >
                <div className="text-left flex-1">
                  <h3
                    className={`text-lg font-semibold ${
                      habit.is_completed
                        ? "text-gray-500 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    {habit.name}
                  </h3>
                  <p
                    className={`text-sm font-bold mt-1 ${
                      habit.is_completed ? "text-gray-400" : "text-orange-500"
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
                      className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-sm text-sm"
                    >
                      Complete
                    </button>
                  ) : (
                    <span className="px-4 py-2 font-semibold text-green-700 bg-green-100 border border-green-300 text-sm">
                      Cleared!
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteHabit(habit.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
