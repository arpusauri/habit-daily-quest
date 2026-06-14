import React from "react";

const QuestSection = ({
  habits,
  newHabitName,
  setNewHabitName,
  addHabit,
  completeHabit,
  deleteHabit,
  isMatrixMode,
  isDarkMode,
  questCardStyle,
  questTitleStyle,
}) => {
  return (
    <div className="w-full">
      {/* Section Judul Daily Quests */}
      <div className="text-left mt-8 mb-4 border-b border-gray-700/40 pb-2">
        <h2
          className={`text-2xl font-black tracking-wide ${
            isMatrixMode
              ? "text-green-400 font-mono drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
              : isDarkMode
                ? "text-slate-100"
                : "text-gray-800"
          }`}
        >
          ⚔️ {isMatrixMode ? "CORE_DAILY_MISSIONS" : "Daily Quests"}
        </h2>
      </div>

      {/* Form Add Quest */}
      <form
        onSubmit={addHabit}
        className={`p-4 rounded-xl mb-6 flex gap-2 items-center transition-all duration-300 ${
          isMatrixMode
            ? "bg-black border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.05)]"
            : isDarkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-gray-50 border border-gray-200 shadow-inner"
        }`}
      >
        <input
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder={
            isMatrixMode ? "ENTER_NEW_MISSION..." : "Add a new daily quest..."
          }
          className={`flex-1 px-4 py-2 rounded-lg text-sm border focus:outline-none transition-all ${
            isMatrixMode
              ? "bg-black border-green-600/50 text-green-400 placeholder-green-700 focus:border-green-400 font-mono"
              : isDarkMode
                ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                : "bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-blue-500"
          }`}
        />
        <button
          type="submit"
          className={`px-5 py-2 text-sm font-black rounded-lg active:scale-95 transition-all shadow-sm shrink-0 ${
            isMatrixMode
              ? "bg-green-950/40 text-green-400 border border-green-400 hover:bg-green-400 hover:text-black shadow-[0_0_10px_rgba(34,197,94,0.2)] font-mono"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isMatrixMode ? "[+]_INITIALIZE" : "Add Quest"}
        </button>
      </form>

      {/* Habit List */}
      <div className="space-y-3">
        <div className="space-y-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={`p-4 rounded-xl flex justify-between items-center transition-all duration-300 ${questCardStyle(
                habit.is_completed,
              )}`}
            >
              <div className="text-left">
                <h3
                  className={`text-lg tracking-wide ${questTitleStyle(
                    habit.is_completed,
                  )}`}
                >
                  {habit.name}
                </h3>
                <p
                  className={`text-sm font-bold mt-1 ${
                    isMatrixMode ? "text-green-500/80" : "text-orange-500"
                  }`}
                >
                  🔥 {habit.streak} Day Streak
                </p>
              </div>

              {/* Action Buttons Container */}
              <div className="flex gap-2 items-center">
                {!habit.is_completed ? (
                  <button
                    type="button"
                    onClick={() => completeHabit(habit.id)}
                    className={`px-4 py-2 font-black rounded-lg active:scale-95 transition-all shadow-sm ${
                      isMatrixMode
                        ? "bg-green-900/30 text-green-400 border border-green-400 hover:bg-green-400 hover:text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    +30 Gems
                  </button>
                ) : (
                  <span
                    className={`px-4 py-2 font-bold rounded-lg shadow-inner text-sm ${
                      isMatrixMode
                        ? "bg-green-950/40 text-green-400 border border-green-500/20"
                        : isDarkMode
                          ? "bg-emerald-900/20 text-emerald-400"
                          : "bg-green-200 text-green-800"
                    }`}
                  >
                    Cleared! ✓
                  </span>
                )}

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => deleteHabit(habit.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isMatrixMode
                      ? "text-green-700 hover:text-red-400 hover:bg-red-500/10"
                      : "text-red-400 hover:text-red-600 hover:bg-red-50"
                  }`}
                  title="Delete Quest"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestSection;
