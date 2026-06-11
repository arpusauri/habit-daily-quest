import React, { useState, useEffect } from "react";

function App() {
  const [userData, setUserData] = useState({
    username: "",
    gems: 0,
    inventory: [],
  });
  const [habits, setHabits] = useState([]);
  const [pulledResult, setPulledResult] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setUserData(data.user);
        setHabits(data.habits);
      })
      .catch((err) => console.error("Error:", err));
  }, []);

  const completeHabit = (id) => {
    fetch(`http://localhost:5000/api/habits/${id}/complete`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) alert(data.error);
        else {
          setUserData(data.user);
          setHabits(data.habits);
        }
      });
  };

  const pullGacha = () => {
    fetch("http://localhost:5000/api/gacha/pull", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          setUserData(data.user);
          setPulledResult(data.pulledItem);
        }
      });
  };

  // Tailwind text colors for rarity
  const getRarityTextColor = (rarity) => {
    if (rarity === "SSR") return "text-yellow-500";
    if (rarity === "SR") return "text-purple-500";
    return "text-blue-500";
  };

  // Tailwind border colors for rarity
  const getRarityBorderColor = (rarity) => {
    if (rarity === "SSR") return "border-yellow-500";
    if (rarity === "SR") return "border-purple-500";
    return "border-blue-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-xl mx-auto">
        {/* Top Banner */}
        <div className="flex justify-between items-center bg-gray-900 text-white px-6 py-4 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold">
            {userData.username || "Loading..."}
          </h2>
          <h2 className="text-xl font-bold text-yellow-400">
            💎 {userData.gems} Gems
          </h2>
        </div>

        {/* --- GACHA BANNER SECTION --- */}
        <div className="mt-8 bg-gradient-to-br from-slate-800 to-black text-white p-8 rounded-xl shadow-xl text-center">
          <h3 className="text-xl font-extrabold tracking-wider mb-2">
            ✨ BEGINNER BANNER ✨
          </h3>
          <p className="text-sm text-gray-300">
            Cost: 50 Gems per pull. 5% SSR Rate!
          </p>

          <button
            onClick={pullGacha}
            className="mt-6 px-8 py-3 text-lg font-bold bg-yellow-400 text-black rounded-full hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-[0_4px_15px_rgba(250,204,21,0.4)]"
          >
            🚀 Pull 1x (50 Gems)
          </button>

          {/* Display Pull Result */}
          {pulledResult && (
            <div
              className={`mt-6 p-4 bg-white/10 rounded-lg border-2 ${getRarityBorderColor(pulledResult.rarity)} animate-pulse`}
            >
              <p className="text-sm text-gray-300">You obtained:</p>
              <h2
                className={`text-2xl font-bold mt-1 ${getRarityTextColor(pulledResult.rarity)}`}
              >
                [{pulledResult.rarity}] {pulledResult.name}
              </h2>
            </div>
          )}
        </div>

        {/* Daily Quests */}
        <h3 className="mt-10 text-2xl font-bold text-gray-800 mb-4">
          📋 Daily Quests
        </h3>
        <div className="space-y-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={`flex justify-between items-center p-4 border rounded-xl shadow-sm transition-colors ${habit.isCompleted ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}
            >
              <div>
                <p
                  className={`font-bold ${habit.isCompleted ? "line-through text-gray-500" : "text-gray-800"}`}
                >
                  {habit.name}
                </p>
                <small className="text-gray-500">
                  🔥 Streak: {habit.streak} days
                </small>
              </div>

              <button
                onClick={() => completeHabit(habit.id)}
                disabled={habit.isCompleted}
                className={`px-5 py-2 font-semibold rounded-lg transition-colors ${
                  habit.isCompleted
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                }`}
              >
                {habit.isCompleted ? "Cleared!" : "+30 Gems"}
              </button>
            </div>
          ))}
        </div>

        {/* Inventory */}
        <h3 className="mt-10 text-xl font-bold text-gray-800 mb-4">
          🎒 Unlocked Inventory ({userData.inventory?.length || 0})
        </h3>
        <div className="flex gap-2 flex-wrap">
          {userData.inventory?.length === 0 ? (
            <p className="text-gray-500 italic">
              Your inventory is empty. Go do pulls!
            </p>
          ) : (
            userData.inventory?.map((itemId) => (
              <div
                key={itemId}
                className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium shadow"
              >
                {itemId
                  .replace("r_", "R: ")
                  .replace("sr_", "SR: ")
                  .replace("ssr_", "SSR: ")}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
