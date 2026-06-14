import React, { useState, useEffect, useRef } from "react";
// Helper untuk menghentikan kode sementara (jeda waktu)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 1. ADD YOUR LIVE URL HERE (No slash at the end)
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://habitapi-4anhd8m7.b4a.run";

    const ITEM_NAME_MAP = {
      r_blue: "Cyan Border",
      r_pink: "Pink Text Font",
      sr_dark: "Obsidian Dark Theme",
      sr_gold: "Golden Name Tag",
      ssr_matrix: "Animated Cyberpunk Matrix",
    };

    const POOL_ITEMS = [
      "Cyan Border",
      "Pink Text Font",
      "Obsidian Dark Theme",
      "Golden Name Tag",
      "Animated Cyberpunk Matrix",
      "Cyan Border",
      "Pink Text Font",
      "Obsidian Dark Theme",
      "Cyan Border",
      "Golden Name Tag",
    ];

function App() {
  const [userData, setUserData] = useState({
    username: "",
    gems: 0,
    inventory: [],
  });
  const [habits, setHabits] = useState([]);
  // TAMBAH ini:
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [gachaResult, setGachaResult] = useState(null);
  const [newHabitName, setNewHabitName] = useState("");
  const [selectedRarityFilter, setSelectedRarityFilter] = useState("ALL");
  const [isRolling, setIsRolling] = useState(false);
  const [currentRollItem, setCurrentRollItem] = useState("???");

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

  // SESUDAH:
  const completeHabit = (habitId) => {
    // Update UI langsung
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, is_completed: true, streak: h.streak + 1 }
          : h,
      ),
    );
    setUserData((prev) => ({
      ...prev,
      gems: prev.gems + 30,
      exp: (prev.exp || 0) + 10 >= 100 ? 0 : (prev.exp || 0) + 10,
      level:
        (prev.exp || 0) + 10 >= 100 ? (prev.level || 1) + 1 : prev.level || 1,
    }));
    playSound("complete");

    const oldLevel = userData.level || 1;

    // Kirim ke server di belakang layar
    fetch(`${API_URL}/api/habits/${habitId}/complete`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          // Rollback: ambil data asli dari server
          fetch(`${API_URL}/api/dashboard`)
            .then((r) => r.json())
            .then((d) => {
              setUserData(d.user);
              setHabits(d.habits);
            });
          return;
        }
        // Sync dengan data server yang akurat
        setUserData(data.user);
        setHabits(data.habits);
        if (data.user.level > oldLevel)
          setTimeout(() => playSound("level_up"), 100);
      })
      .catch((err) => {
        console.error(err);
        // Rollback kalau network error
        fetch(`${API_URL}/api/dashboard`)
          .then((r) => r.json())
          .then((d) => {
            setUserData(d.user);
            setHabits(d.habits);
          });
      });
  };

  const rollGacha = async () => {
    if (userData.gems < 50) {
      alert("Gems tidak cukup! Selesaikan quest dulu.");
      return;
    }

    setGachaResult(null);
    setCurrentRollItem("???");
    setIsRolling(true);
    setOverlayVisible(true); // ← overlay muncul sekali, tidak akan hilang sampai kita tutup
    playSound("pull_click");

    try {
      // Fetch dan animasi jalan BERSAMAAN
      const fetchPromise = fetch(`${API_URL}/api/gacha/pull`, {
        method: "POST",
      }).then((res) => res.json());

      let delay = 30;
      for (let i = 0; i < 30; i++) {
        setCurrentRollItem(POOL_ITEMS[i % POOL_ITEMS.length]);
        playSound("gacha_tick");
        await sleep(delay);
        if (i > 20) delay += 55;
        else delay += 4;
      }

      const data = await fetchPromise;

      if (data.error) {
        setIsRolling(false);
        setOverlayVisible(false);
        alert(data.error);
        return;
      }

      const resultItem = data.pulledItem;
      const resultName =
        ITEM_NAME_MAP[resultItem?.id] || resultItem?.name || "???";

      // Animasi perlambatan akhir
      for (let i = 0; i < 6; i++) {
        setCurrentRollItem(
          i % 2 === 0 ? POOL_ITEMS[i % POOL_ITEMS.length] : resultName,
        );
        playSound("gacha_tick");
        await sleep(300 + i * 100);
      }

      setCurrentRollItem(resultName);
      await sleep(100);

      // Set result DULU, baru matikan rolling
      setGachaResult(resultItem);
      setUserData(data.user);
      setIsRolling(false); // overlay tetap visible, hanya switch isi

      if (resultItem?.id?.startsWith("ssr_")) playSound("ssr_drop");
      else playSound("complete");
    } catch (err) {
      console.error("Error Gacha:", err);
      setIsRolling(false);
      setOverlayVisible(false);
    }
  };

  const closeOverlay = () => {
    setOverlayVisible(false);
    setGachaResult(null);
  };

  const audioCtxRef = useRef(null);

  const playSound = (type) => {
    try {
      if (!audioCtxRef.current)
        audioCtxRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === "complete") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880.0, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "level_up") {
        // Suara Terompet Kemenangan (Fanfare)
        osc.type = "square";
        const times = [0, 0.15, 0.3, 0.5];
        const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        freqs.forEach((freq, i) => {
          osc.frequency.setValueAtTime(freq, now + times[i]);
        });
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
        osc.start(now);
        osc.stop(now + 1.0);
      } else if (type === "gacha_tick") {
        // Suara putaran roda kasino (klik cepat)
        osc.type = "triangle";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "pull_click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "ssr_drop") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(261.63, now);
        osc.frequency.linearRampToValueAtTime(523.25, now + 0.2);
        osc.frequency.linearRampToValueAtTime(1046.5, now + 0.5);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
      }
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    // Optimistic: tambah langsung ke UI
    const tempId = `temp_${Date.now()}`;
    const tempHabit = {
      id: tempId,
      name: newHabitName,
      streak: 0,
      is_completed: false,
    };
    setHabits((prev) => [...prev, tempHabit]);
    setNewHabitName("");

    fetch(`${API_URL}/api/habits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newHabitName }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          setHabits((prev) => prev.filter((h) => h.id !== tempId)); // rollback
          return;
        }
        // Ganti temp dengan data asli dari server
        setHabits(data.habits);
      })
      .catch((err) => {
        console.error("Error adding habit:", err);
        setHabits((prev) => prev.filter((h) => h.id !== tempId)); // rollback
      });
  };

  const deleteHabit = (habitId) => {
    if (!window.confirm("Are you sure you want to delete this quest?")) return;

    // Optimistic: simpan dulu untuk rollback, lalu hapus dari UI
    setHabits((prev) => {
      const deleted = prev.find((h) => h.id === habitId);
      deletedHabitRef.current = deleted;
      return prev.filter((h) => h.id !== habitId);
    });

    fetch(`${API_URL}/api/habits/${habitId}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          setHabits((prev) => [...prev, deletedHabitRef.current]); // rollback
          return;
        }
        setHabits(data.habits);
      })
      .catch((err) => {
        console.error("Error deleting habit:", err);
        setHabits((prev) => [...prev, deletedHabitRef.current]); // rollback
      });
  };

  const deletedHabitRef = useRef(null);

  // SESUDAH:
  const equipItem = (itemId) => {
    // Update UI langsung tanpa tunggu server
    setUserData((prev) => {
      const isTheme = ["sr_dark", "ssr_matrix"].includes(itemId);
      const isBorder = itemId === "r_blue";
      const isFont = ["r_pink", "sr_gold"].includes(itemId);
      return {
        ...prev,
        equipped_theme: isTheme ? itemId : prev.equipped_theme,
        equipped_border: isBorder ? itemId : prev.equipped_border,
        equipped_font: isFont ? itemId : prev.equipped_font,
      };
    });

    // Kirim ke server di belakang layar
    fetch(`${API_URL}/api/gacha/equip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          // Rollback kalau server error
          setUserData((prev) => ({ ...prev }));
        }
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

  // Dynamic quest card themes based on equipped cosmetics
  const questCardStyle = (isCompleted) => {
    if (isMatrixMode) {
      return isCompleted
        ? "bg-black border-2 border-green-400 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.4)] font-mono"
        : "bg-black border border-green-600/50 text-green-500 hover:border-green-400 shadow-[0_0_5px_rgba(34,197,94,0.1)] font-mono";
    }

    if (isDarkMode) {
      return isCompleted
        ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 shadow-inner"
        : "bg-slate-800 border border-slate-700 text-slate-100 hover:border-slate-600 shadow-sm";
    }

    // Default light mode fallback
    return isCompleted
      ? "bg-green-50 border border-green-200 text-green-800"
      : "bg-white border border-gray-200 text-gray-800 hover:shadow-md transition-shadow";
  };

  // Quick helper to tweak text styling inside the quest cards
  const questTitleStyle = (isCompleted) => {
    if (isCompleted) return "line-through opacity-60 font-medium";
    return isMatrixMode
      ? "text-green-400 font-bold"
      : "text-gray-900 dark:text-white font-bold";
  };

  return (
    <div className={appBackground}>
      <div className="max-w-xl mx-auto">
        {/* Top Banner */}
        {/* Update your Top Banner div wrapper to look like this: */}
        {/* Top Banner with Level System */}
        <div
          className={`flex flex-col gap-3 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-lg ${userCardBorder}`}
        >
          {/* Top Row: Name and Gems */}
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              {/* Level Badge */}
              <div className="bg-indigo-600 text-white font-black rounded-full h-10 w-10 flex items-center justify-center border-2 border-indigo-400 shadow-[0_0_10px_rgba(79,70,229,0.5)] text-lg">
                {userData.level || 1}
              </div>

              {/* Dynamic Username */}
              <h2 className={`text-xl ${nameTagStyle}`}>
                {userData.username || "Loading..."}
              </h2>
            </div>

            <h2 className="text-xl font-bold text-yellow-400">
              💎 {userData.gems} Gems
            </h2>
          </div>

          {/* Bottom Row: EXP Progress Bar */}
          <div className="w-full mt-1">
            <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
              <span className="uppercase tracking-widest">EXP Progress</span>
              <span>{userData.exp || 0} / 100</span>
            </div>

            {/* The Bar Background */}
            <div className="w-full bg-gray-800 rounded-full h-3 border border-gray-700 overflow-hidden">
              {/* The Animated Green Fill */}
              <div
                className="bg-green-500 h-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                style={{
                  width: `${Math.min(((userData.exp || 0) / 100) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
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
            type="button"
            onClick={rollGacha}
            disabled={isRolling}
            className="mt-6 px-8 py-3 text-lg font-bold bg-yellow-400 text-black rounded-full hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-[0_4px_15px_rgba(250,204,21,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Pull 1x (50 Gems)
          </button>
        </div>

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
        <div className="space-y-3">
          <div className="space-y-3">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className={`p-4 rounded-xl flex justify-between items-center transition-all duration-300 ${questCardStyle(habit.is_completed)}`}
              >
                <div className="text-left">
                  <h3
                    className={`text-lg tracking-wide ${questTitleStyle(habit.is_completed)}`}
                  >
                    {habit.name}
                  </h3>
                  <p
                    className={`text-sm font-bold mt-1 ${isMatrixMode ? "text-green-500/80" : "text-orange-500"}`}
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
      {overlayVisible && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50">
          {/* STATE: ROLLING */}
          {isRolling && (
            <div className="bg-gray-900 border-2 border-indigo-500 p-8 rounded-2xl max-w-sm w-full text-center mx-4 shadow-[0_0_40px_rgba(99,102,241,0.5)]">
              <span className="text-xs font-black tracking-widest uppercase bg-gray-950 px-3 py-1 rounded-full border border-indigo-500/50 text-indigo-400 animate-pulse">
                TUNING QUANTUM REWARDS...
              </span>
              <h2 className="text-2xl font-black text-white mt-8 mb-8 tracking-wide min-h-[64px] flex items-center justify-center">
                {currentRollItem}
              </h2>
              <div className="flex justify-center gap-2">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* STATE: HASIL */}
          {!isRolling &&
            gachaResult &&
            (() => {
              const isSSR = gachaResult.id?.startsWith("ssr_");
              const isSR = gachaResult.id?.startsWith("sr_");
              const glowColor = isSSR
                ? "border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.6)]"
                : isSR
                  ? "border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.5)]"
                  : "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.4)]";
              const textColor = isSSR
                ? "text-yellow-400"
                : isSR
                  ? "text-purple-400"
                  : "text-blue-400";
              const btnStyle = isSSR
                ? "bg-yellow-500 text-black hover:bg-yellow-400"
                : isSR
                  ? "bg-purple-600 text-white hover:bg-purple-500"
                  : "bg-blue-600 text-white hover:bg-blue-500";

              return (
                <div
                  className={`bg-gray-900 border-2 p-8 rounded-2xl max-w-sm w-full text-center mx-4 ${glowColor}`}
                >
                  <span
                    className={`text-xs font-black tracking-widest uppercase bg-gray-950 px-3 py-1 rounded-full border border-gray-800 ${textColor}`}
                  >
                    {isSSR
                      ? "🏆 SSR RANK UNLOCKED"
                      : isSR
                        ? "✨ SR RANK UNLOCKED"
                        : "🔹 RARE RANK UNLOCKED"}
                  </span>
                  <div className="mt-6 mb-2">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">
                      You obtained
                    </p>
                    <h2
                      className={`text-2xl font-black tracking-wide ${textColor}`}
                    >
                      {currentRollItem}
                    </h2>
                  </div>
                  <p className="text-gray-500 text-sm mb-6 mt-3">
                    Item otomatis masuk ke inventaris kosmetikmu.
                  </p>
                  <button
                    type="button"
                    onClick={closeOverlay}
                    className={`w-full py-2.5 font-bold rounded-xl active:scale-95 transition-all text-sm ${btnStyle}`}
                  >
                    Klaim Hadiah ✓
                  </button>
                </div>
              );
            })()}
        </div>
      )}
    </div>
  );
}

export default App;
