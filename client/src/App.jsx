// import library
import React, { useState, useEffect, useRef } from "react";

// import components
import UserProfile from "./components/UserProfileSection";
import GachaSection from "./components/GachaSection";
import QuestSection from "./components/QuestSection";
import Inventory from "./components/InventorySection";
import ItemIndex from "./components/ItemIndex";
//import overlays
import GachaOverlay from "./components/GachaOverlay";
// import utils
import { playSound } from "./utils/soundEngine";

// Helper untuk menghentikan kode sementara (jeda waktu)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 1. ADD YOUR LIVE URL HERE (No slash at the end)
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://habit-daily-api.bonto.run";

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
  const [showItemIndex, setShowItemIndex] = useState(false);

  const rollIntervalRef = useRef(null);
  const rollTimeoutRef = useRef(null);

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

  const completeHabit = (habitId) => {
    playSound("complete");
    const oldLevel = userData.level || 1;

    // Optimistic update
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, is_completed: true, streak: h.streak + 1 }
          : h,
      ),
    );

    const currentExp = userData.exp || 0;
    const currentLevel = userData.level || 1;
    const newExp = currentExp + 10;
    const levelUp = newExp >= 100;

    setUserData((prev) => ({
      ...prev,
      gems: prev.gems + 30,
      exp: levelUp ? newExp - 100 : newExp,
      level: levelUp ? currentLevel + 1 : currentLevel,
    }));

    if (levelUp) setTimeout(() => playSound("level_up"), 100);

    // Sync server di belakang
    fetch(`${API_URL}/api/habits/${habitId}/complete`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          fetch(`${API_URL}/api/dashboard`)
            .then((r) => r.json())
            .then((d) => {
              setUserData(d.user);
              setHabits(d.habits);
            });
          return;
        }
        setUserData(data.user);
        setHabits(data.habits);
      })
      .catch(() => {
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

    // Reset state & bendera skip sebelum mulai gacha baru
    skipRef.current = false;
    setGachaResult(null);
    setCurrentRollItem("???");
    setIsRolling(true);
    setOverlayVisible(true);
    playSound("pull_click");

    try {
      const fetchPromise = fetch(`${API_URL}/api/gacha/pull`, {
        method: "POST",
      }).then((res) => res.json());

      // --- LOOP ANIMASI 1 ---
      let delay = 30;
      for (let i = 0; i < 30; i++) {
        // JIKA DISKIP: Berhenti melakukan animasi!
        if (skipRef.current) break;

        setCurrentRollItem(POOL_ITEMS[i % POOL_ITEMS.length]);
        playSound("gacha_tick");
        await sleep(delay);
        if (i > 20) delay += 55;
        else delay += 4;
      }

      // Tunggu server membalas (kalau user skip di detik 1, kita tetap harus nunggu hasil dari server)
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

      // --- LOOP ANIMASI 2 (Perlambatan Akhir) ---
      // Hanya jalankan kalau belum diskip
      if (!skipRef.current) {
        for (let i = 0; i < 6; i++) {
          if (skipRef.current) break; // Cek lagi, barangkali diskip saat animasi lambat

          setCurrentRollItem(
            i % 2 === 0 ? POOL_ITEMS[i % POOL_ITEMS.length] : resultName,
          );
          playSound("gacha_tick");
          await sleep(300 + i * 100);
        }

        // Jeda detik terakhir sebelum jederrr muncul hasilnya (kalau tidak diskip)
        if (!skipRef.current) {
          setCurrentRollItem(resultName);
          await sleep(100);
        }
      }

      // --- FASE AKHIR (HASIL) ---
      // Bagian ini akan langsung dieksekusi jika diskip (karena loop di atas di-break)
      setCurrentRollItem(resultName);
      setGachaResult(resultItem);
      setUserData(data.user);
      setIsRolling(false); // Mematikan animasi, ganti ke mode result

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

  const skipRef = useRef(false);

  // 3. Update fungsi skip ini
  const handleSkipAnimation = () => {
    skipRef.current = true; // Angkat bendera skip!
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
    <div className={`${appBackground} min-h-screen-mobile p-4`}>
      <div className="max-w-xl mx-auto">
        {/* Section User Profile*/}
        <UserProfile
          userData={userData}
          userCardBorder={userCardBorder}
          nameTagStyle={nameTagStyle}
        />

        {/* Section Gacha*/}
        <GachaSection rollGacha={rollGacha} isRolling={isRolling} />

        {/* Quest Quest*/}
        <QuestSection
          habits={habits}
          newHabitName={newHabitName}
          setNewHabitName={setNewHabitName}
          addHabit={addHabit}
          completeHabit={completeHabit}
          deleteHabit={deleteHabit}
          isMatrixMode={isMatrixMode}
          isDarkMode={isDarkMode}
          questCardStyle={questCardStyle}
          questTitleStyle={questTitleStyle}
        />

        <Inventory
          userData={userData}
          selectedRarityFilter={selectedRarityFilter}
          setSelectedRarityFilter={setSelectedRarityFilter}
          equipItem={equipItem}
          setShowItemIndex={setShowItemIndex}
        />
      </div>

      {/* Gacha Overlay*/}
      {overlayVisible && (
        <GachaOverlay
          isRolling={isRolling}
          currentRollItem={currentRollItem}
          gachaResult={gachaResult}
          // 2. MODIFIKASI DI SINI: Set result jadi null DAN matikan overlayVisible agar overlay tertutup
          closeOverlay={() => {
            setGachaResult(null);
            setOverlayVisible(false);
          }}
          skipRoll={handleSkipAnimation}
        />
      )}

      {/* Item Index Overlay */}
      {showItemIndex && (
        <ItemIndex
          userData={userData}
          onClose={() => setShowItemIndex(false)}
        />
      )}
    </div>
  );
}

export default App;
