import React, { useState, useEffect, useRef } from "react";

import UserProfile from "./components/UserProfileSection";
import QuestSection from "./components/QuestSection";
import Inventory from "./components/InventorySection";
import ItemIndex from "./components/ItemIndex";
import LeaderboardModal from "./components/LeaderboardModal";
import Sidebar from "./components/Sidebar";
import ShopOverlay from "./components/ShopOverlay";
import BannerOverlay from "./components/BannerOverlay";
import LeaderboardOverlay from "./components/LeaderboardOverlay";
import HabitHeatmap from "./components/HabitHeatmap";
import GachaOverlay from "./components/GachaOverlay";
import { playSound } from "./utils/soundEngine";
import { supabase } from "./supabaseClient";
import AuthPage from "./AuthPage";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  ssr_starforge: "Starforge Celestial Theme",
  ssr_notepad: "Notepad Theme",
  shop_aurora: "Aurora Dream Theme",
  shop_crown: "Diamond Crown Tag",
};

const POOL_ITEMS = [
  { name: "Cyan Border", rarity: "R" },
  { name: "Pink Text Font", rarity: "R" },
  { name: "Obsidian Dark Theme", rarity: "SR" },
  { name: "Golden Name Tag", rarity: "SR" },
  { name: "Animated Cyberpunk Matrix", rarity: "SSR" },
  { name: "Cyan Border", rarity: "R" },
  { name: "Pink Text Font", rarity: "R" },
  { name: "Obsidian Dark Theme", rarity: "SR" },
  { name: "Cyan Border", rarity: "R" },
  { name: "Golden Name Tag", rarity: "SR" },
];

function App() {
  const [userData, setUserData] = useState({
    username: "",
    gems: 0,
    inventory: [],
  });

  const [habits, setHabits] = useState([]);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [gachaResult, setGachaResult] = useState(null);
  const [newHabitName, setNewHabitName] = useState("");
  const [selectedRarityFilter, setSelectedRarityFilter] = useState("ALL");
  const [isRolling, setIsRolling] = useState(false);
  const [currentRollItem, setCurrentRollItem] = useState("???");
  const [showItemIndex, setShowItemIndex] = useState(false);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activityTrigger, setActivityTrigger] = useState(0);

  const rollIntervalRef = useRef(null);
  const rollTimeoutRef = useRef(null);
  const skipRef = useRef(false);
  const deletedHabitRef = useRef(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    fetch(`${API_URL}/api/dashboard`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserData(data.user);
        setHabits(data.habits);
      })
      .catch((err) => console.error("Error:", err));
  }, [session]);

  const authFetch = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${session.access_token}`,
      },
    });
  };

  const completeHabit = (habitId) => {
    if (typeof habitId === "string" && habitId.startsWith("temp_")) {
      alert("Sabar ya, quest ini sedang disimpan ke server...");
      return;
    }

    playSound("complete");
    setActivityTrigger((prev) => prev + 1);

    const oldLevel = userData.level || 1;

    const completedToday = habits.filter((h) => h.is_completed).length;
    let earnedExp = 50;
    let earnedGems = 30;

    if (completedToday >= 10) {
      earnedExp = 5;
      earnedGems = 3;
    } else if (completedToday >= 5) {
      earnedExp = 25;
      earnedGems = 15;
    }

    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, is_completed: true, streak: h.streak + 1 }
          : h,
      ),
    );

    const currentExp = userData.exp || 0;
    const currentLevel = userData.level || 1;
    const newExp = currentExp + earnedExp;
    const levelUp = newExp >= 100;

    setUserData((prev) => ({
      ...prev,
      gems: prev.gems + earnedGems,
      exp: levelUp ? newExp - 100 : newExp,
      level: levelUp ? currentLevel + 1 : currentLevel,
    }));

    if (levelUp) setTimeout(() => playSound("level_up"), 100);

    authFetch(`${API_URL}/api/habits/${habitId}/complete`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          authFetch(`${API_URL}/api/dashboard`)
            .then((r) => r.json())
            .then((d) => {
              setUserData(d.user);
              setHabits(d.habits);
            });
          return;
        }
        setUserData(data.user);
        setHabits(data.habits);

        if (data.user.level > oldLevel) {
          setTimeout(() => playSound("level_up"), 100);
        }
      })
      .catch(() => {
        authFetch(`${API_URL}/api/dashboard`)
          .then((r) => r.json())
          .then((d) => {
            setUserData(d.user);
            setHabits(d.habits);
          });
      });
  };

  const rollGacha = async (options = {}) => {
    const {
      endpoint = "/api/gacha/pull",
      requireGems = true,
      body = {},
    } = options;

    if (requireGems && userData.gems < 50) {
      alert("Gems tidak cukup! Selesaikan quest dulu.");
      return;
    }

    skipRef.current = false;
    setGachaResult(null);
    setCurrentRollItem({ name: "???", rarity: null });
    setIsRolling(true);
    setIsRevealing(false);
    setOverlayVisible(true);
    playSound("pull_click");

    try {
      const fetchPromise = authFetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((res) => res.json());

      let delay = 30;
      for (let i = 0; i < 30; i++) {
        if (skipRef.current) break;

        setCurrentRollItem(POOL_ITEMS[i % POOL_ITEMS.length]);
        playSound("gacha_tick");
        await sleep(delay);
        if (i > 20) delay += 55;
        else delay += 4;
      }

      if (skipRef.current) {
        setIsRevealing(true);
      }

      const data = await fetchPromise;
      setIsRevealing(false);

      if (data.error) {
        setIsRolling(false);
        setOverlayVisible(false);
        alert(data.error);
        return;
      }

      const resultItem = data.pulledItem;
      const resultName =
        ITEM_NAME_MAP[resultItem?.id] || resultItem?.name || "???";
      const resultDisplay = { name: resultName, rarity: resultItem?.rarity };

      if (!skipRef.current) {
        for (let i = 0; i < 6; i++) {
          if (skipRef.current) break;

          setCurrentRollItem(
            i % 2 === 0 ? POOL_ITEMS[i % POOL_ITEMS.length] : resultDisplay,
          );
          playSound("gacha_tick");
          await sleep(300 + i * 100);
        }

        if (!skipRef.current) {
          setCurrentRollItem(resultDisplay);
          await sleep(100);
        }
      }

      setCurrentRollItem(resultDisplay);
      setGachaResult({
        ...resultItem,
        isDuplicate: data.isDuplicate,
        shardsEarned: data.shardsEarned,
        isPityReward: data.isPityReward,
        bannerResult: data.bannerResult,
      });
      setUserData(data.user);
      setIsRolling(false);

      if (resultItem?.rarity === "SSR") playSound("ssr_drop");
      else playSound("complete");
    } catch (err) {
      console.error("Error Gacha:", err);
      setIsRolling(false);
      setIsRevealing(false);
      setOverlayVisible(false);
    }
  };

  const closeOverlay = () => {
    setOverlayVisible(false);
    setGachaResult(null);
  };

  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const tempId = `temp_${Date.now()}`;
    const tempHabit = {
      id: tempId,
      name: newHabitName,
      streak: 0,
      is_completed: false,
    };
    setHabits((prev) => [...prev, tempHabit]);
    setNewHabitName("");

    authFetch(`${API_URL}/api/habits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newHabitName }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          setHabits((prev) => prev.filter((h) => h.id !== tempId));
          return;
        }
        setHabits(data.habits);
      })
      .catch((err) => {
        console.error("Error adding habit:", err);
        setHabits((prev) => prev.filter((h) => h.id !== tempId));
      });
  };

  const deleteHabit = (habitId) => {
    if (!window.confirm("Are you sure you want to delete this quest?")) return;

    setHabits((prev) => {
      const deleted = prev.find((h) => h.id === habitId);
      deletedHabitRef.current = deleted;
      return prev.filter((h) => h.id !== habitId);
    });

    authFetch(`${API_URL}/api/habits/${habitId}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          setHabits((prev) => [...prev, deletedHabitRef.current]);
          return;
        }
        setHabits(data.habits);
      })
      .catch((err) => {
        console.error("Error deleting habit:", err);
        setHabits((prev) => [...prev, deletedHabitRef.current]);
      });
  };

  const THEME_ITEMS = [
    "sr_dark",
    "ssr_matrix",
    "shop_aurora",
    "ssr_starforge",
    "ssr_notepad",
  ];
  const FONT_ITEMS = ["r_pink", "sr_gold", "shop_crown"];

  const equipItem = (itemId) => {
    setUserData((prev) => {
      const isTheme = THEME_ITEMS.includes(itemId);
      const isBorder = itemId === "r_blue";
      const isFont = FONT_ITEMS.includes(itemId);
      return {
        ...prev,
        equipped_theme: isTheme ? itemId : prev.equipped_theme,
        equipped_border: isBorder ? itemId : prev.equipped_border,
        equipped_font: isFont ? itemId : prev.equipped_font,
      };
    });

    authFetch(`${API_URL}/api/gacha/equip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          setUserData((prev) => ({ ...prev }));
        }
      })
      .catch((err) => console.error("Error equipping:", err));
  };

  const unequipItem = (itemId) => {
    setUserData((prev) => {
      const isTheme = THEME_ITEMS.includes(itemId);
      const isBorder = itemId === "r_blue";
      const isFont = FONT_ITEMS.includes(itemId);
      return {
        ...prev,
        equipped_theme: isTheme ? null : prev.equipped_theme,
        equipped_border: isBorder ? null : prev.equipped_border,
        equipped_font: isFont ? null : prev.equipped_font,
      };
    });

    authFetch(`${API_URL}/api/gacha/unequip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) alert(data.error);
      })
      .catch((err) => console.error("Error unequipping:", err));
  };

  const handleQuestSuccess = () => {
    setActivityTrigger((prev) => prev + 1);
  };

  // ── THEME DETECTION ──────────────────────────────────────────────────────
  const isDarkMode = userData?.equipped_theme === "sr_dark";
  const isMatrixMode = userData?.equipped_theme === "ssr_matrix";
  const isAuroraMode = userData?.equipped_theme === "shop_aurora";
  const isStarforgeMode = userData?.equipped_theme === "ssr_starforge";
  const isNotepadMode = userData?.equipped_theme === "ssr_notepad";

  // ── STYLING ──────────────────────────────────────────────────────────────
  const appBackground = isMatrixMode
    ? "bg-black text-green-400 border-2 border-green-500 min-h-screen py-10 px-4 font-mono shadow-[0_0_30px_rgba(34,197,94,0.2)]"
    : isAuroraMode
      ? "bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-slate-100 min-h-screen py-10 px-4 font-sans"
      : isStarforgeMode
        ? "bg-gradient-to-b from-slate-950 via-amber-950/50 to-slate-950 text-amber-50 min-h-screen py-10 px-4 font-sans"
        : isNotepadMode
          ? "bg-amber-50 text-stone-800 min-h-screen py-10 px-4 font-sans"
          : isDarkMode
            ? "bg-slate-900 text-slate-100 min-h-screen py-10 px-4 font-sans"
            : "bg-white text-gray-900 min-h-screen py-10 px-4 font-sans";

  const userCardBorder =
    userData.equipped_border === "r_blue"
      ? "border-4 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
      : "border border-transparent";

  const nameTagStyle =
    userData?.equipped_font === "shop_crown"
      ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-yellow-300 font-black tracking-widest drop-shadow-[0_2px_10px_rgba(217,70,239,0.6)] animate-pulse"
      : userData?.equipped_font === "sr_gold"
        ? "text-yellow-400 font-extrabold tracking-widest drop-shadow-[0_2px_8px_rgba(234,179,8,0.6)] animate-bounce"
        : userData?.equipped_font === "r_pink"
          ? "text-pink-400 font-serif italic font-bold tracking-wide"
          : "text-white font-bold";

  const questCardStyle = (isCompleted) => {
    if (isMatrixMode) {
      return isCompleted
        ? "bg-black border-2 border-green-400 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.4)] font-mono"
        : "bg-black border border-green-600/50 text-green-500 hover:border-green-400 shadow-[0_0_5px_rgba(34,197,94,0.1)] font-mono";
    }

    if (isAuroraMode) {
      return isCompleted
        ? "bg-purple-950/40 border border-fuchsia-500/40 text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.2)]"
        : "bg-indigo-900/50 border border-purple-500/30 text-slate-100 hover:border-fuchsia-400/50 shadow-sm";
    }

    if (isStarforgeMode) {
      return isCompleted
        ? "bg-amber-950/30 border border-yellow-500/40 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
        : "bg-slate-900/60 border border-amber-600/30 text-amber-50 hover:border-yellow-400/50 shadow-sm";
    }

    if (isNotepadMode) {
      return isCompleted
        ? "bg-orange-50 border border-orange-200 text-orange-800"
        : "bg-white border border-stone-200 text-stone-800 hover:shadow-md transition-shadow";
    }

    if (isDarkMode) {
      return isCompleted
        ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 shadow-inner"
        : "bg-slate-800 border border-slate-700 text-slate-100 hover:border-slate-600 shadow-sm";
    }

    // 🖤 DEFAULT: wireframe hitam-putih minimalis
    return isCompleted
      ? "bg-gray-50 border border-gray-300 text-gray-400"
      : "bg-white border border-gray-300 text-gray-900 hover:border-gray-500 transition-colors";
  };

  const questTitleStyle = (isCompleted) => {
    if (isCompleted) return "line-through opacity-60 font-medium";
    if (isMatrixMode) return "text-green-400 font-bold";
    if (isAuroraMode) return "text-fuchsia-100 font-bold";
    if (isStarforgeMode) return "text-amber-100 font-bold";
    if (isNotepadMode) return "text-stone-900 font-bold";
    if (isDarkMode) return "text-slate-100 font-bold";
    return "text-gray-900 font-bold"; // default wireframe
  };

  // ── AUTH GUARD ────────────────────────────────────────────────────────────
  if (authLoading)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );

  if (!session) return <AuthPage onLogin={setSession} apiUrl={API_URL} />;

  const closeGachaOverlay = () => {
    setGachaResult(null);
    setIsRolling(false);
  };

  const skipRoll = () => {
    skipRef.current = true;
  };

  return (
    <div
      className={`${appBackground} min-h-screen-mobile p-4 relative overflow-x-hidden`}
    >
      {/* 🌌 Aurora Glow Blobs */}
      {isAuroraMode && (
        <>
          <div className="absolute top-[-8%] left-[-10%] w-72 h-72 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-[15%] right-[-12%] w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[15%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* ✨ Starforge Glow Blobs */}
      {isStarforgeMode && (
        <>
          <div className="absolute top-[-8%] right-[-10%] w-72 h-72 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-[20%] left-[-12%] w-80 h-80 bg-yellow-300/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[10%] w-96 h-96 bg-orange-400/15 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <Sidebar
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenBanner={() => setShowBanner(true)}
        onOpenShop={() => setShowShop(true)}
      />

      <div className="max-w-xl mx-auto space-y-4">
        <UserProfile
          userData={userData}
          userCardBorder={userCardBorder}
          nameTagStyle={nameTagStyle}
          onLogout={() => supabase.auth.signOut()}
        />

        <QuestSection
          habits={habits}
          newHabitName={newHabitName}
          setNewHabitName={setNewHabitName}
          addHabit={addHabit}
          completeHabit={completeHabit}
          deleteHabit={deleteHabit}
          isMatrixMode={isMatrixMode}
          isDarkMode={isDarkMode}
          isAuroraMode={isAuroraMode}
          isStarforgeMode={isStarforgeMode}
          isNotepadMode={isNotepadMode}
          questCardStyle={questCardStyle}
          questTitleStyle={questTitleStyle}
        />

        <HabitHeatmap
          apiUrl={API_URL}
          equippedTheme={userData?.equipped_theme}
          refreshTrigger={activityTrigger}
          unlockedCosmeticsCount={userData?.inventory?.length || 0}
        />

        <Inventory
          userData={userData}
          selectedRarityFilter={selectedRarityFilter}
          setSelectedRarityFilter={setSelectedRarityFilter}
          equipItem={equipItem}
          unequipItem={unequipItem}
          setShowItemIndex={setShowItemIndex}
          isAuroraMode={isAuroraMode}
          isMatrixMode={isMatrixMode}
          isStarforgeMode={isStarforgeMode}
          isNotepadMode={isNotepadMode}
          isDarkMode={isDarkMode}
        />
      </div>

      <LeaderboardOverlay
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      <BannerOverlay
        isOpen={showBanner}
        onClose={() => setShowBanner(false)}
        rollGacha={rollGacha}
        isRolling={isRolling}
        userData={userData}
      />

      <ShopOverlay
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        apiUrl={API_URL}
        authFetch={authFetch}
        userData={userData}
        onRedeemSuccess={(updatedUser) => setUserData(updatedUser)}
        onBuyTicket={() => {
          rollGacha({ endpoint: "/api/shop/buy-ticket", requireGems: false });
        }}
      />

      {showItemIndex && (
        <ItemIndex
          userData={userData}
          onClose={() => setShowItemIndex(false)}
        />
      )}

      <GachaOverlay
        isRolling={isRolling}
        isRevealing={isRevealing}
        currentRollItem={currentRollItem}
        gachaResult={gachaResult}
        closeOverlay={closeGachaOverlay}
        skipRoll={skipRoll}
      />
    </div>
  );
}

export default App;
