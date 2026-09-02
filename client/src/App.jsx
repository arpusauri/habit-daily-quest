import React, { useState, useEffect, useRef, useCallback } from "react";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import UserProfile from "./components/UserProfileSection";
import QuestSection from "./components/QuestSection";
import Inventory from "./components/InventorySection";
import ItemIndex from "./components/ItemIndex";
import Sidebar from "./components/Sidebar";
import ShopSection from "./components/ShopSection";
import BannerOverlay from "./components/BannerOverlay";
import LeaderboardSection from "./components/LearderboardSection";
import HabitHeatmap from "./components/HabitHeatmap";
import GachaOverlay from "./components/GachaOverlay";
import { playSound } from "./utils/soundEngine";
import { supabase } from "./supabaseClient";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ShowcaseModal from "./components/ShowcaseModal";
import NotificationOverlay from "./components/NotificationOverlay";

import Dropdown from "./assets/icons/down.svg?react";
import GachaIcon from "./assets/icons/stars.svg?react";
import GemIcon from "./assets/icons/gem.svg?react";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://habit-daily-quest-server.vercel.app");

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
  // Standard pool items
  { name: "Cyan Border", rarity: "R" },
  { name: "Pink Text Font", rarity: "R" },
  { name: "Obsidian Dark Theme", rarity: "SR" },
  { name: "Golden Name Tag", rarity: "SR" },
  { name: "Starforge Celestial Theme", rarity: "SSR" },
  { name: "Notepad Theme", rarity: "SSR" },
  { name: "Cyan Border", rarity: "R" },
  { name: "Pink Text Font", rarity: "R" },
  { name: "Obsidian Dark Theme", rarity: "SR" },
  { name: "Golden Name Tag", rarity: "SR" },
];

const LIMITED_POOL_ITEMS = [
  { name: "Cyan Border", rarity: "R" },
  { name: "Pink Text Font", rarity: "R" },
  { name: "Obsidian Dark Theme", rarity: "SR" },
  { name: "Golden Name Tag", rarity: "SR" },
  { name: "Starforge Celestial Theme", rarity: "SSR" },
  { name: "Notepad Theme", rarity: "SSR" },
  { name: "Animated Cyberpunk Matrix", rarity: "SSR" },
  { name: "Cyan Border", rarity: "R" },
  { name: "Pink Text Font", rarity: "R" },
  { name: "Obsidian Dark Theme", rarity: "SR" },
  { name: "Golden Name Tag", rarity: "SR" },
];

function App() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(
    (title, message, type = "success", duration = 3000) => {
      const id = Date.now();
      const notification = { id, title, message, type };
      setNotifications((prev) => [...prev, notification]);
      if (duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
      }
      return id;
    },
    [],
  );

  const showSuccess = useCallback(
    (title, message, duration = 3000) => {
      return addNotification(title, message, "success", duration);
    },
    [addNotification],
  );

  const showWarning = useCallback(
    (title, message, duration = 3000) => {
      return addNotification(title, message, "warning", duration);
    },
    [addNotification],
  );

  const showLevelUp = useCallback(
    (level) => {
      return addNotification(
        "Level Up!",
        `You reached level ${level}!`,
        "levelup",
        3000,
      );
    },
    [addNotification],
  );

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
  const [authPage, setAuthPage] = useState(() => {
    // Deteksi link reset password dari email (Supabase kirim hash #type=recovery)
    if (
      typeof window !== "undefined" &&
      window.location.hash.includes("type=recovery")
    ) {
      return "reset-password";
    }
    return "login";
  });

  const rollIntervalRef = useRef(null);
  const rollTimeoutRef = useRef(null);
  const skipRef = useRef(false);
  const deletedHabitRef = useRef(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showShowcase, setShowShowcase] = useState(false);
  const [viewingPlayer, setViewingPlayer] = useState(null);
  const [activeTab, setActiveTab] = useState("quests");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      showWarning("Saving", "Quest sedang disimpan ke server...", 2000);
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

    // Show notification dengan gems dan exp
    const notificationMessage = levelUp
      ? `+${earnedGems} Gems, +${earnedExp} XP, Level Up!`
      : `+${earnedGems} Gems, +${earnedExp} XP`;

    showSuccess("Quest Complete!", notificationMessage, 3000);

    authFetch(`${API_URL}/api/habits/${habitId}/complete`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          showWarning("Error", data.error, 3000);
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
          showSuccess(
            "Level Up!",
            `You reached level ${data.user.level}!`,
            3000,
          );
        }
      })
      .catch(() => {
        showWarning("Error", "Failed to complete quest", 2000);
        authFetch(`${API_URL}/api/dashboard`)
          .then((r) => r.json())
          .then((d) => {
            setUserData(d.user);
            setHabits(d.habits);
          });
      });
  };

  // const handleReorderHabits = (reorderedHabits) => {
  //   setHabits(reorderedHabits);
  // Optional: save ke database
  // authFetch(`${API_URL}/api/habits/reorder`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ habits: reorderedHabits }),
  // });
  // };

  const handleReorderHabits = (reorderedHabits) => {
    setHabits(reorderedHabits);
    // Optional: save ke database
    // await updateHabitsOrder(reorderedHabits);
  };

  const rollGacha = async (options = {}) => {
    const {
      endpoint = "/api/gacha/pull",
      requireGems = true,
      body = {},
      bannerType = "standard",
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
      const animationPool =
        bannerType === "limited" ? LIMITED_POOL_ITEMS : POOL_ITEMS;

      for (let i = 0; i < 30; i++) {
        if (skipRef.current) break;

        setCurrentRollItem(animationPool[i % animationPool.length]);
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
        const isPityOrSSR = data.isPityReward || resultItem?.rarity === "SSR";

        if (isPityOrSSR) {
          setCurrentRollItem(resultDisplay);
          await sleep(400);
        } else {
          for (let i = 0; i < 6; i++) {
            if (skipRef.current) break;

            const animationPool =
              bannerType === "limited" ? LIMITED_POOL_ITEMS : POOL_ITEMS;
            setCurrentRollItem(
              i % 2 === 0
                ? animationPool[i % animationPool.length]
                : resultDisplay,
            );
            playSound("gacha_tick");
            await sleep(300 + i * 100);
          }

          if (!skipRef.current) {
            setCurrentRollItem(resultDisplay);
            await sleep(100);
          }
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
    ? "bg-black text-green-400 border-2 border-green-500 min-h-screen font-mono shadow-[0_0_30px_rgba(34,197,94,0.2)]"
    : isAuroraMode
      ? "bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-slate-100 min-h-screen font-sans"
      : isStarforgeMode
        ? "bg-gradient-to-b from-slate-950 via-amber-950/50 to-slate-950 text-amber-50 min-h-screen font-sans"
        : isNotepadMode
          ? "bg-amber-50 text-stone-800 min-h-screen font-sans"
          : isDarkMode
            ? "bg-slate-900 text-slate-100 min-h-screen font-sans"
            : "bg-white text-gray-900 min-h-[120vh] font-sans";

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
    return "text-gray-900 font-bold";
  };

  // ── PREPARE SHOWCASE DATA & COSMETICS ──────────────────────────────────
  const currentStreak =
    habits.length > 0 ? Math.max(...habits.map((h) => h.streak || 0)) : 0;

  const completedToday = habits.filter((h) => h.is_completed).length;

  // SESUDAH
  const showcaseUserData = {
    ...userData,
    id: userData?.id || "0000",
    username: userData?.username || "Player",
    streak: currentStreak,
  };

  const equippedCosmetics = {
    theme: userData?.equipped_theme,
    border: userData?.equipped_border,
    title: userData?.equipped_font,
  };

  // ── AUTH GUARD ────────────────────────────────────────────────────────────
  if (authLoading)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (authPage === "reset-password") {
    return (
      <ResetPasswordPage
        onSuccess={() => {
          setAuthPage("login");
          window.location.hash = "";
        }}
      />
    );
  }

  if (!session) {
    if (authPage === "forgot-password") {
      return (
        <ForgotPasswordPage onSwitchToLogin={() => setAuthPage("login")} />
      );
    }

    if (authPage === "register") {
      return (
        <RegisterPage
          onLogin={(session) => setSession(session)}
          apiUrl={API_URL}
          onSwitchToLogin={() => setAuthPage("login")}
        />
      );
    }

    return (
      <LoginPage
        onLogin={(session) => setSession(session)}
        apiUrl={API_URL}
        onSwitchToRegister={() => setAuthPage("register")}
        onSwitchToForgotPassword={() => setAuthPage("forgot-password")}
      />
    );
  }

  const closeGachaOverlay = () => {
    setGachaResult(null);
    setIsRolling(false);
  };

  const skipRoll = () => {
    skipRef.current = true;
  };

  const handleViewPlayer = async (playerId) => {
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, username, level, exp, created_at, last_login, equipped_theme, equipped_border, equipped_font",
      )
      .eq("id", playerId)
      .single();
    if (error || !data) return;

    const [
      { data: activityData },
      { data: inventoryData },
      { count: totalPulls },
    ] = await Promise.all([
      supabase
        .from("daily_activity")
        .select("completed_count")
        .eq("user_id", playerId),
      supabase.from("inventory").select("item_id").eq("user_id", playerId),
      supabase
        .from("gacha_history")
        .select("id", { count: "exact", head: true })
        .eq("user_id", playerId),
    ]);

    const totalQuestsCompleted = (activityData || []).reduce(
      (sum, row) => sum + (row.completed_count || 0),
      0,
    );
    const activeDays = (activityData || []).filter(
      (row) => row.completed_count > 0,
    ).length;

    setViewingPlayer({
      ...data,
      totalQuestsCompleted,
      activeDays,
      cosmeticsCount: (inventoryData || []).length,
      totalPulls: totalPulls || 0,
    });
  };

  const closeViewingPlayer = () => setViewingPlayer(null);

  // bentuk data biar sesuai shape yang ShowcaseModal harapin
  const viewingPlayerData = viewingPlayer; // udah lengkap dari handleViewPlayer

  const viewingPlayerCosmetics = viewingPlayer && {
    theme: viewingPlayer.equipped_theme,
    border: viewingPlayer.equipped_border,
    title: viewingPlayer.equipped_font,
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-between">
      {/* 🌌 AREA UTAMA: Warna Tema (appBackground) Full Lebar Kiri-Kanan */}
      <div
        className={`w-full flex-1 ${appBackground} relative overflow-x-hidden`}
      >
        {/* 🌌 Aurora Glow Blobs */}
        {isAuroraMode && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-8%] left-[-10%] w-72 h-72 bg-fuchsia-500/20 rounded-full blur-3xl" />
            <div className="absolute top-[15%] right-[-12%] w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] left-[15%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          </div>
        )}

        {/* Starforge Glow Blobs */}
        {isStarforgeMode && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-8%] right-[-10%] w-72 h-72 bg-amber-400/20 rounded-full blur-3xl" />
            <div className="absolute top-[20%] left-[-12%] w-80 h-80 bg-yellow-300/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] right-[10%] w-96 h-96 bg-orange-400/15 rounded-full blur-3xl" />
          </div>
        )}

        {/*  TOP NAVIGATION HEADER - FULL WIDTH */}
        <header className="w-full bg-[#1e720f]/80 shadow-xl relative z-30">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 flex items-stretch justify-between gap-4 flex-wrap sm:flex-nowrap">
            {/* SISI KIRI: Title + Tabs */}
            <div className="flex items-stretch gap-4 min-w-0">
              {/* Title */}
              <div className="flex items-center py-3 shrink-0">
                <h1 className="text-lg font-black text-white tracking-wider cursor-pointer select-none">
                  Gambit
                </h1>
              </div>

              {/* Tabs Placeholder - edit sesuai kebutuhan */}
              <nav className="hidden md:flex items-stretch gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("quests")}
                  className={`relative flex items-center px-3 text-sm text-white font-bold transition-colors cursor-pointer ${
                    activeTab === "quests" ? "" : "hover:bg-[#51b330]"
                  }`}
                >
                  Quests
                  <span
                    className={`absolute left-0 right-0 bottom-0 h-[4px] ${
                      activeTab === "quests" ? "bg-[#7ad950]" : "bg-transparent"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("heatmap")}
                  className={`relative flex items-center px-3 text-sm text-white font-bold transition-colors cursor-pointer ${
                    activeTab === "heatmap" ? "" : "hover:bg-[#51b330]"
                  }`}
                >
                  Activity
                  <span
                    className={`absolute left-0 right-0 bottom-0 h-[3px] ${
                      activeTab === "heatmap"
                        ? "bg-[#7ad950]"
                        : "bg-transparent"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("inventory")}
                  className={`relative flex items-center px-3 text-sm text-white font-bold transition-colors cursor-pointer ${
                    activeTab === "inventory" ? "" : "hover:bg-[#51b330]"
                  }`}
                >
                  Inventory
                  <span
                    className={`absolute left-0 right-0 bottom-0 h-[3px] ${
                      activeTab === "inventory"
                        ? "bg-[#7ad950]"
                        : "bg-transparent"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("leaderboard")}
                  className={`relative flex items-center px-3 text-sm text-white font-bold transition-colors cursor-pointer ${
                    activeTab === "leaderboard" ? "" : "hover:bg-[#51b330]"
                  }`}
                >
                  Leaderboard
                  <span
                    className={`absolute left-0 right-0 bottom-0 h-[3px] ${
                      activeTab === "leaderboard"
                        ? "bg-[#7ad950]"
                        : "bg-transparent"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("shop")}
                  className={`relative flex items-center px-3 text-sm text-white font-bold transition-colors cursor-pointer ${
                    activeTab === "shop" ? "" : "hover:bg-[#51b330]"
                  }`}
                >
                  Shop
                  <span
                    className={`absolute left-0 right-0 bottom-0 h-[3px] ${
                      activeTab === "shop" ? "bg-[#7ad950]" : "bg-transparent"
                    }`}
                  />
                </button>
              </nav>
            </div>

            {/* SISI KANAN: Gems, Action Buttons, Menu, Profile */}
            <div className="flex items-center gap-6 shrink-0 py-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5">
                <GemIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-md font-black text-white">
                  {userData?.gems || 0}
                </span>
              </div>

              {/* Gacha Icon - berdiri sendiri, ada jarak lega dari grup dropdown+profile */}
              <button
                type="button"
                onClick={() => setShowBanner(true)}
                className="flex items-center justify-center transition-all active:scale-95 cursor-pointer text-sm"
                title="Gacha Banner"
              >
                <GachaIcon className="w-7 h-7 text-white hover:text-gray-300 transition-colors" />
              </button>

              {/* Grup Dropdown Menu + Profile - dirapatkan karena saling terkait */}
              <div className="flex items-center gap-2">
                {/* DROPDOWN MENU (titik tiga) */}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="flex items-center justify-center transition-all active:scale-95 cursor-pointer text-sm"
                    aria-label="Menu"
                  >
                    <Dropdown className="w-6 h-5 text-white hover:text-gray-300 transition-colors" />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-gray-200 shadow-xl overflow-hidden z-10 animate-fade-in">
                      {/* Item biasa — copy-paste blok ini buat nambah menu lain */}
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          // aksi kamu di sini
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-[#7ad950]/20 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        Settings
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          // aksi kamu di sini
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-[#7ad950]/20 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        Help
                      </button>

                      {/* Divider — opsional, buat misahin aksi destruktif */}
                      <div className="border-t border-gray-200" />

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          supabase.auth.signOut();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-[#7ad950]/20 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile - dekat dengan dropdown */}
                <button
                  type="button"
                  onClick={() => setShowShowcase(true)}
                  title="Lihat Player Card"
                  className="flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <div className="min-w-0 hidden sm:block text-left">
                    <h2
                      className={`font-black text-md truncate leading-tight ${nameTagStyle}`}
                    >
                      {userData?.username || "Player"}
                    </h2>
                    <p className="text-[9px] text-gray-400 font-semibold truncate leading-tight">
                      {userData?.exp || 0}/100 EXP
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 border border-purple-400/60 flex flex-col items-center justify-center shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                    <span className="text-[6px] font-bold text-purple-200 uppercase leading-none">
                      Lv
                    </span>
                    <span className="font-black text-[11px] text-white leading-none">
                      {userData?.level || 1}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-10 sm:px-6 relative z-10 py-6">
          <div className="rounded-lg p-4 sm:p-6 space-y-6 bg-white">
            {/* 🖼️ KONTEN UTAMA */}
            <main className="w-full space-y-6">
              {activeTab === "quests" && (
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
                  onReorderHabits={handleReorderHabits}
                />
              )}

              {activeTab === "heatmap" && (
                <HabitHeatmap
                  apiUrl={API_URL}
                  equippedTheme={userData?.equipped_theme}
                  refreshTrigger={activityTrigger}
                  unlockedCosmeticsCount={userData?.inventory?.length || 0}
                />
              )}

              {activeTab === "inventory" && (
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
              )}

              {activeTab === "leaderboard" && (
                <LeaderboardSection onViewPlayer={handleViewPlayer} />
              )}

              {activeTab === "shop" && (
                <ShopSection
                  apiUrl={API_URL}
                  authFetch={authFetch}
                  userData={userData}
                  onRedeemSuccess={(updatedUser) => setUserData(updatedUser)}
                  onBuyTicket={() => {
                    rollGacha({
                      endpoint: "/api/shop/buy-ticket",
                      requireGems: false,
                    });
                  }}
                />
              )}
            </main>
          </div>
        </div>
      </div>

      {/* ⚪ STRIP / FOOTER BAWAH (WARNA PUTIH) */}
      <div className="w-full bg-white h-4 sm:h-6 shrink-0" />

      {/* MODALS & OVERLAYS */}
      <NotificationOverlay notifications={notifications} />
      {viewingPlayer && (
        <ShowcaseModal
          isOpen={!!viewingPlayer}
          onClose={closeViewingPlayer}
          userData={viewingPlayerData}
          equippedCosmetics={viewingPlayerCosmetics}
        />
      )}
      <BannerOverlay
        isOpen={showBanner}
        onClose={() => setShowBanner(false)}
        rollGacha={rollGacha}
        isRolling={isRolling}
        userData={userData}
        apiUrl={API_URL}
      />
      {showItemIndex && (
        <ItemIndex
          userData={userData}
          onClose={() => setShowItemIndex(false)}
        />
      )}
      <ShowcaseModal
        isOpen={showShowcase}
        onClose={() => setShowShowcase(false)}
        userData={userData}
        equippedCosmetics={{
          theme: userData?.equipped_theme,
          border: userData?.equipped_border,
          title: userData?.equipped_font,
        }}
      />
      <GachaOverlay
        isRolling={isRolling}
        isRevealing={isRevealing}
        currentRollItem={currentRollItem}
        gachaResult={gachaResult}
        closeOverlay={closeGachaOverlay}
        skipRoll={skipRoll}
      />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;
