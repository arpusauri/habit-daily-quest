import React, { useState, useEffect } from "react";

// 1. ADD YOUR LIVE URL HERE (No slash at the end)
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://habitapi-q82gplsb.b4a.run";

function App() {
  const [userData, setUserData] = useState({
    username: "",
    gems: 0,
    inventory: [],
  });
  const [habits, setHabits] = useState([]);
  const [pulledResult, setPulledResult] = useState(null);
  const [newHabitName, setNewHabitName] = useState("");
  const [selectedRarityFilter, setSelectedRarityFilter] = useState("ALL");


  useEffect(() => {
    // 2. UPDATED FETCH
    fetch(`${API_URL}/api/dashboard`)
      .then((res) => res.json())
      .then((data) => {
        setUserData(data.user);
        setHabits(data.habits);
      })
      .catch((err) => console.error("Error:", err));
  }, []);

  const completeHabit = (id) => {
    // 3. UPDATED FETCH
    fetch(`${API_URL}/api/habits/${id}/complete`, { method: "POST" })
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
    // 4. UPDATED FETCH
    fetch(`${API_URL}/api/gacha/pull`, { method: "POST" })
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

  const addHabit = (e) => {
    e.preventDefault(); // Prevents the browser from reloading the page

    if (!newHabitName.trim()) return;

    fetch(`${API_URL}/api/habits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newHabitName }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          setHabits(data.habits); // Update the list with the fresh database rows
          setNewHabitName(""); // Clear the input box!
        }
      })
      .catch((err) => console.error("Error adding habit:", err));
  };

  const equipItem = (itemId) => {
    fetch(`${API_URL}/api/gacha/equip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) alert(data.error);
        else setUserData(data.user);
      })
      .catch((err) => console.error("Error equipping:", err));
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

  // Dynamic theme layouts
  const isDarkMode = userData.equipped_theme === "sr_dark";
  const isMatrixMode = userData.equipped_theme === "ssr_matrix";

  const appBackground = isMatrixMode
    ? "bg-black text-green-400 border-2 border-green-500 min-h-screen py-10 px-4 font-mono shadow-[0_0_30px_rgba(34,197,94,0.2)]"
    : isDarkMode
      ? "bg-slate-900 text-slate-100 min-h-screen py-10 px-4 font-sans"
      : "bg-gray-50 text-gray-900 min-h-screen py-10 px-4 font-sans";

  const userCardBorder =
    userData.equipped_border === "r_blue"
      ? "border-4 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
      : "border border-transparent";

  const nameTagStyle =
    userData.equipped_font === "sr_gold"
      ? "text-yellow-400 font-extrabold tracking-widest drop-shadow-[0_2px_8px_rgba(234,179,8,0.6)] animate-bounce"
      : userData.equipped_font === "r_pink"
        ? "text-pink-400 font-serif italic font-bold tracking-wide"
        : "text-white font-bold";

  return (
    <div className={appBackground}>
      <div className="max-w-xl mx-auto">
        {/* Top Banner */}
        {/* Update your Top Banner div wrapper to look like this: */}
        <div
          className={`flex justify-between items-center bg-gray-900 text-white px-6 py-4 rounded-xl shadow-lg ${userCardBorder}`}
        >
          <h2 className={`text-xl ${nameTagStyle}`}>
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
        {/* New Habit Creator Form */}
        <form onSubmit={addHabit} className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Enter a new daily quest... (e.g., Read 10 pages)"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors shadow-md"
          >
            ➕ Add Quest
          </button>
        </form>
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

        {/* Updated Interactive Inventory */}
        <h3 className="mt-10 text-xl font-bold mb-4">
          🎒 Unlocked Inventory ({userData.inventory?.length || 0})
        </h3>
        {/* Rarity Filter Controls */}
        <div className="flex gap-2 mb-6">
          {["ALL", "R", "SR", "SSR"].map((rarity) => (
            <button
              key={rarity}
              type="button"
              onClick={() => setSelectedRarityFilter(rarity)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all border ${
                selectedRarityFilter === rarity
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                  : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
              }`}
            >
              {rarity === "ALL" ? "✨ SHOW ALL" : `${rarity} RANK`}
            </button>
          ))}
        </div>
        {/* Master Inventory Section */}
        <div className="w-full space-y-6 mt-10">
          {/* Header & Filter Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-700 pb-3">
            <h3 className="text-xl font-bold tracking-wide">
              🎒 Your Inventory
            </h3>

            {/* Rarity Filter Controls */}
            <div className="flex gap-1 bg-gray-900/60 p-1 rounded-xl border border-gray-800 self-start sm:self-auto">
              {["ALL", "R", "SR", "SSR"].map((rarity) => (
                <button
                  key={rarity}
                  type="button"
                  onClick={() => setSelectedRarityFilter(rarity)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedRarityFilter === rarity
                      ? "bg-indigo-600 text-white shadow-md border border-indigo-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {rarity === "ALL" ? "✨ SHOW ALL" : rarity}
                </button>
              ))}
            </div>
          </div>

          {userData.inventory?.length === 0 ? (
            <p className="text-gray-500 italic text-center py-6">
              Your inventory is empty. Go pull on banners! 🎰
            </p>
          ) : (
            (() => {
              // 1. Structural blueprint defining our inventory slots
              const categories = [
                {
                  id: "THEMES",
                  label: "🖼️ Background Themes",
                  itemIds: ["sr_dark", "ssr_matrix"],
                },
                {
                  id: "BORDERS",
                  label: "🔲 Profile Borders",
                  itemIds: ["r_blue"],
                },
                {
                  id: "TITLES",
                  label: "🏷️ Custom Titles & Fonts",
                  itemIds: ["r_pink", "sr_gold"],
                },
              ];

              // 2. Rarity filter helper logic
              const matchesRarity = (itemId) => {
                if (selectedRarityFilter === "ALL") return true;
                if (selectedRarityFilter === "R" && itemId.startsWith("r_"))
                  return true;
                if (selectedRarityFilter === "SR" && itemId.startsWith("sr_"))
                  return true;
                if (selectedRarityFilter === "SSR" && itemId.startsWith("ssr_"))
                  return true;
                return false;
              };

              // 3. Count total visible matches across all slots to check for blank filters
              const totalVisible =
                userData.inventory.filter(matchesRarity).length;
              if (totalVisible === 0) {
                return (
                  <p className="text-gray-500 italic text-center py-6">
                    No {selectedRarityFilter} items currently unlocked.
                  </p>
                );
              }

              // 4. Render separated groups
              return categories.map((cat) => {
                const itemsToRender = userData.inventory.filter(
                  (itemId) =>
                    cat.itemIds.includes(itemId) && matchesRarity(itemId),
                );

                // Hide the whole card if no unlocked items in this category fit the active filter
                if (itemsToRender.length === 0) return null;

                return (
                  <div
                    key={cat.id}
                    className="bg-gray-900/30 p-5 rounded-2xl border border-gray-800 shadow-sm text-left"
                  >
                    {/* Group Label Banner */}
                    <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 border-l-4 border-indigo-500 pl-2">
                      {cat.label}
                    </h4>

                    {/* Grid for this specific category's items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {itemsToRender.map((itemId) => {
                        let cleanName = "";
                        if (itemId === "r_blue") cleanName = "Cyan Border";
                        if (itemId === "r_pink") cleanName = "Pink Text Font";
                        if (itemId === "sr_dark")
                          cleanName = "Obsidian Dark Theme";
                        if (itemId === "sr_gold") cleanName = "Golden Name Tag";
                        if (itemId === "ssr_matrix")
                          cleanName = "Animated Cyberpunk Matrix";

                        const isEquipped =
                          userData.equipped_border === itemId ||
                          userData.equipped_font === itemId ||
                          userData.equipped_theme === itemId;

                        const rank = itemId.startsWith("ssr_")
                          ? "SSR"
                          : itemId.startsWith("sr_")
                            ? "SR"
                            : "R";
                        const rankBadgeClass =
                          rank === "SSR"
                            ? "text-yellow-400 bg-yellow-400/10 border-yellow-500/20"
                            : rank === "SR"
                              ? "text-purple-400 bg-purple-400/10 border-purple-500/20"
                              : "text-blue-400 bg-blue-400/10 border-blue-500/20";

                        return (
                          <div
                            key={itemId}
                            className="bg-gray-800 text-white p-4 rounded-xl flex justify-between items-center shadow-md border border-gray-700/40 hover:border-gray-600 transition-all"
                          >
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-semibold tracking-wide text-left">
                                {cleanName}
                              </span>
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded border mt-1.5 ${rankBadgeClass}`}
                              >
                                {rank} RANK
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => equipItem(itemId)}
                              disabled={isEquipped}
                              className={`text-xs px-4 py-2 font-bold rounded-lg transition-all ${
                                isEquipped
                                  ? "bg-green-600/20 text-green-400 border border-green-500/40 cursor-not-allowed"
                                  : "bg-blue-600 text-white hover:bg-blue-500 active:scale-95 shadow-sm"
                              }`}
                            >
                              {isEquipped ? "Equipped ✓" : "Equip"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
