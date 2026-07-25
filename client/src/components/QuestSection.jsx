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
  isAuroraMode,
  isStarforgeMode,
  isNotepadMode,
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
              : isAuroraMode
                ? "text-fuchsia-100 drop-shadow-[0_0_10px_rgba(232,121,249,0.5)]"
                : isStarforgeMode
                  ? "text-amber-100 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  : isNotepadMode
                    ? "text-stone-800"
                    : isDarkMode
                      ? "text-slate-100"
                      : "text-gray-900"
          }`}
        >
          {isMatrixMode
            ? "⚡ "
            : isAuroraMode
              ? "🌌 "
              : isStarforgeMode
                ? "✨ "
                : ""}
          {isMatrixMode ? "CORE_DAILY_MISSIONS" : "Daily Quests"}
        </h2>
      </div>

      {/* Form Add Quest */}
      <form
        onSubmit={addHabit}
        className={`p-4 rounded-xl mb-6 flex gap-2 items-center transition-all duration-300 ${
          isMatrixMode
            ? "bg-black border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.05)]"
            : isAuroraMode
              ? "bg-indigo-950/50 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
              : isStarforgeMode
                ? "bg-slate-900/60 border border-amber-600/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                : isNotepadMode
                  ? "bg-white border border-stone-200 shadow-sm"
                  : isDarkMode
                    ? "bg-slate-800 border border-slate-700"
                    : "bg-white border border-gray-300"
        }`}
      >
        <input
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder={
            isMatrixMode ? "ENTER_NEW_MISSION..." : "Add a new daily quest..."
          }
          className={`flex-1 min-w-0 px-4 py-2 rounded-lg text-sm border focus:outline-none transition-all ${
            isMatrixMode
              ? "bg-black border-green-600/50 text-green-400 placeholder-green-700 focus:border-green-400 font-mono"
              : isAuroraMode
                ? "bg-indigo-950/80 border-purple-500/40 text-fuchsia-100 placeholder-purple-400/60 focus:border-fuchsia-400"
                : isStarforgeMode
                  ? "bg-slate-900/80 border-amber-600/40 text-amber-50 placeholder-amber-400/50 focus:border-yellow-400"
                  : isNotepadMode
                    ? "bg-amber-50/50 border-stone-300 text-stone-800 placeholder-stone-400 focus:border-orange-400"
                    : isDarkMode
                      ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-900"
          }`}
        />
        <button
          type="submit"
          className={`px-5 py-2 text-sm font-black rounded-lg active:scale-95 transition-all shadow-sm shrink-0 ${
            isMatrixMode
              ? "bg-green-950/40 text-green-400 border border-green-400 hover:bg-green-400 hover:text-black shadow-[0_0_10px_rgba(34,197,94,0.2)] font-mono"
              : isAuroraMode
                ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:from-fuchsia-500 hover:to-purple-500 shadow-[0_0_12px_rgba(217,70,239,0.3)]"
                : isStarforgeMode
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-400 hover:to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                  : isNotepadMode
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : isDarkMode
                      ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                      : "bg-gray-900 text-white hover:bg-gray-700"
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
                    isMatrixMode
                      ? "text-green-500/80"
                      : isAuroraMode
                        ? "text-fuchsia-400"
                        : isStarforgeMode
                          ? "text-amber-400"
                          : isNotepadMode
                            ? "text-orange-500"
                            : isDarkMode
                              ? "text-indigo-400"
                              : "text-orange-500"
                  }`}
                >
                  🔥 {habit.streak} Day Streak
                </p>
              </div>

              <div className="flex gap-2 items-center">
                {!habit.is_completed ? (
                  <button
                    type="button"
                    onClick={() => completeHabit(habit.id)}
                    className={`px-4 py-2 font-black rounded-lg active:scale-95 transition-all shadow-sm ${
                      isMatrixMode
                        ? "bg-green-900/30 text-green-400 border border-green-400 hover:bg-green-400 hover:text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                        : isAuroraMode
                          ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:from-fuchsia-500 hover:to-purple-500 shadow-[0_0_10px_rgba(217,70,239,0.3)]"
                          : isStarforgeMode
                            ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-400 hover:to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                            : isNotepadMode
                              ? "bg-orange-500 text-white hover:bg-orange-600"
                              : isDarkMode
                                ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.25)]"
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
                        : isAuroraMode
                          ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30"
                          : isStarforgeMode
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : isNotepadMode
                              ? "bg-orange-100 text-orange-700 border border-orange-200"
                              : isDarkMode
                                ? "bg-emerald-900/20 text-emerald-400"
                                : "bg-green-200 text-green-800"
                    }`}
                  >
                    Cleared! ✓
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => deleteHabit(habit.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isMatrixMode
                      ? "text-green-700 hover:text-red-400 hover:bg-red-500/10"
                      : isAuroraMode
                        ? "text-purple-300 hover:text-red-400 hover:bg-red-500/10"
                        : isStarforgeMode
                          ? "text-amber-300/70 hover:text-red-400 hover:bg-red-500/10"
                          : isNotepadMode
                            ? "text-stone-400 hover:text-red-500 hover:bg-red-50"
                            : isDarkMode
                              ? "text-slate-500 hover:text-red-400 hover:bg-red-500/10"
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
