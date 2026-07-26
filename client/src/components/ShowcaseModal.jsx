import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";

const CARD_THEME_STYLES = {
  ssr_matrix:
    "bg-black border-emerald-500 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]",
  ssr_starforge:
    "bg-gradient-to-br from-slate-950 via-amber-950/40 to-slate-900 border-amber-500/60 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.3)]",
  ssr_notepad:
    "bg-[#FFFBF2] border-orange-300 text-stone-800 shadow-[0_0_20px_rgba(251,146,60,0.2)]",
  shop_aurora:
    "bg-gradient-to-br from-slate-950 via-fuchsia-950/40 to-indigo-950 border-fuchsia-500/60 text-fuchsia-300 shadow-[0_0_30px_rgba(217,70,239,0.3)]",
  sr_dark:
    "bg-slate-900 border-slate-700 text-slate-100 shadow-[0_0_25px_rgba(0,0,0,0.5)]",
  default: "bg-white border-gray-300 text-gray-900 shadow-lg",
};

const TITLE_NAMES = {
  shop_crown: "Diamond Crown",
  sr_gold: "Golden Legend",
  r_pink: "Pink Font",
};

// Mapping rarity ke styling nama (sesuai title cosmetic)
const TITLE_STYLES = {
  shop_crown: {
    ssr_matrix:
      "text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)] font-black tracking-widest animate-pulse",
    ssr_starforge:
      "text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-yellow-300 to-cyan-300 font-black tracking-widest drop-shadow-[0_0_12px_rgba(34,211,238,0.6)] animate-pulse",
    ssr_notepad:
      "text-orange-500 drop-shadow-[0_0_10px_rgba(251,146,60,0.6)] font-black tracking-widest animate-pulse",
    shop_aurora:
      "text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-yellow-300 font-black tracking-widest drop-shadow-[0_0_12px_rgba(217,70,239,0.6)] animate-pulse",
    sr_dark:
      "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)] font-black tracking-widest animate-pulse",
    default:
      "text-orange-500 drop-shadow-[0_0_10px_rgba(251,146,60,0.6)] font-black tracking-widest animate-pulse",
  },
  sr_gold: {
    ssr_matrix:
      "text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)] font-bold",
    ssr_starforge:
      "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] font-bold",
    ssr_notepad:
      "text-amber-600 drop-shadow-[0_0_6px_rgba(217,119,6,0.5)] font-bold",
    shop_aurora:
      "text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)] font-bold",
    sr_dark:
      "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] font-bold",
    default:
      "text-amber-600 drop-shadow-[0_0_6px_rgba(217,119,6,0.5)] font-bold",
  },
  r_pink: {
    ssr_matrix: "text-pink-400 font-semibold",
    ssr_starforge: "text-pink-300 font-semibold",
    ssr_notepad: "text-pink-500 font-semibold",
    shop_aurora: "text-pink-400 font-semibold",
    sr_dark: "text-pink-400 font-semibold",
    default: "text-pink-500 font-semibold",
  },
  none: {
    ssr_matrix: "text-emerald-400 font-black",
    ssr_starforge: "text-amber-300 font-black",
    ssr_notepad: "text-stone-800 font-black",
    shop_aurora: "text-fuchsia-300 font-black",
    sr_dark: "text-slate-100 font-black",
    default: "text-gray-900 font-black",
  },
};

const ShowcaseModal = ({ isOpen, onClose, userData, equippedCosmetics }) => {
  const cardRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const themeStyle =
    CARD_THEME_STYLES[equippedCosmetics?.theme] || CARD_THEME_STYLES.default;
  const isNotepad = equippedCosmetics?.theme === "ssr_notepad";
  const isDefault = !equippedCosmetics?.theme;

  const textStyleNotepad = isNotepad ? "text-orange-600" : "text-current";
  const borderStyleNotepad = isNotepad
    ? "border-orange-300"
    : "border-current/20";

  const nameStyle =
    equippedCosmetics?.title === "shop_crown"
      ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-yellow-300 font-black tracking-widest drop-shadow-[0_2px_10px_rgba(217,70,239,0.6)] animate-pulse"
      : equippedCosmetics?.title === "sr_gold"
        ? "text-yellow-400 font-extrabold tracking-widest drop-shadow-[0_2px_8px_rgba(234,179,8,0.6)] animate-bounce"
        : equippedCosmetics?.title === "r_pink"
          ? "text-pink-400 font-serif italic font-bold tracking-wide"
          : "text-white font-bold";

  // Copy UID function
  const handleCopyUID = () => {
    navigator.clipboard.writeText(userData?.id?.toString() || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download PNG
  const handleDownloadPNG = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `${userData?.username || "player"}-showcase.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal mendownload showcase card:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="flex flex-col items-center max-w-md w-full gap-4">
        {/* ================= AREA KARTU ================= */}
        <div
          ref={cardRef}
          className={`w-full p-6 rounded-3xl border-2 transition-all relative overflow-hidden ${themeStyle}`}
        >
          {/* Background Glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-current opacity-10 blur-3xl pointer-events-none" />

          {/* HEADER */}
          <div className="flex justify-between items-start mb-5 border-b border-current/20 pb-3">
            <div>
              <span
                className={`font-black tracking-widest text-xs uppercase opacity-80 ${textStyleNotepad}`}
              >
                PLAYER CARD
              </span>
            </div>
            <div className="text-right">
              {userData?.leaderboardRank && (
                <span className={`text-sm font-black ${textStyleNotepad}`}>
                  Level Rank #{userData.leaderboardRank}/{userData.totalPlayers}
                </span>
              )}
            </div>
          </div>

          {/* USER INFO: Avatar + Name + Level + UID */}
          <div className="flex items-center gap-4 mb-6">
            {/* Avatar + Level Badge */}
            <div className="relative">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl border-2 shadow-md ${
                  equippedCosmetics?.border === "r_blue"
                    ? "border-cyan-400 bg-cyan-950/50 text-cyan-300"
                    : isDefault
                      ? "border-gray-400 bg-gray-100 text-gray-900"
                      : "border-current bg-current/10"
                }`}
              >
                {userData?.username?.[0]?.toUpperCase() || "P"}
              </div>
              <div
                className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-lg border-2 ${
                  isDefault
                    ? "bg-gray-700 text-white border-gray-500"
                    : "bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-current/30"
                }`}
              >
                {userData?.level || 1}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {/* Username dengan style title cosmetic + UID Copy */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className={`text-2xl truncate tracking-wide ${nameStyle}`}>
                  {userData?.username || "Anonymous Player"}
                </h3>
                <button
                  type="button"
                  onClick={handleCopyUID}
                  className={`shrink-0 text-xs transition-all ${
                    copied ? "scale-110" : "hover:scale-105"
                  }`}
                  title="Copy UID"
                >
                  {copied ? "✓" : "Copy UID"}
                </button>
              </div>

              {/* UID Display */}
              <div
                className={`text-xs font-mono mb-1 ${
                  isDefault ? "text-gray-500" : "opacity-60"
                }`}
              >
                UID : {userData?.id || "0000"}
              </div>
              {/* Joined Date */}
              {userData?.created_at && (
                <div
                  className={`text-xs font-mono ${
                    isDefault ? "text-gray-500" : "opacity-60"
                  }`}
                >
                  Joined At{" : "}
                  {new Date(userData.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>
          </div>

          {/* TOTAL STATS SECTION */}
          <div className="mb-4">
            <span
              className={`text-s font-black uppercase opacity-70 ${textStyleNotepad}`}
            >
              Information & Stats
            </span>
          </div>

          {/* STATS GRID (2x2 left-aligned) */}
          <div
            className={`grid grid-cols-2 gap-2 p-3 rounded-xl ${
              isNotepad
                ? "bg-orange-100/50"
                : isDefault
                  ? "bg-gray-100"
                  : "bg-black/20"
            }`}
          >
            {/* Active Days */}
            <div
              className={`p-2 rounded-lg text-left border ${
                isNotepad
                  ? "bg-white border-orange-200 text-stone-700"
                  : isDefault
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-current/5 border-current/10 text-current"
              }`}
            >
              <div className="text-[11px] font-bold uppercase opacity-70">
                Active Days
              </div>
              <div className="text-2xl font-black">
                {userData?.activeDays || 0}
              </div>
            </div>

            {/* Quests */}
            <div
              className={`p-2 rounded-lg text-left border ${
                isNotepad
                  ? "bg-white border-orange-200 text-stone-700"
                  : isDefault
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-current/5 border-current/10 text-current"
              }`}
            >
              <div className="text-[11px] font-bold uppercase opacity-70">
                Quests Done
              </div>
              <div className="text-2xl font-black">
                {userData?.totalQuestsCompleted || 0}
              </div>
            </div>

            {/* Pulls */}
            <div
              className={`p-2 rounded-lg text-left border ${
                isNotepad
                  ? "bg-white border-orange-200 text-stone-700"
                  : isDefault
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-current/5 border-current/10 text-current"
              }`}
            >
              <div className="text-[11px] font-bold uppercase opacity-70">
                Total Pulls
              </div>
              <div className="text-2xl font-black">
                {userData?.totalPulls || 0}
              </div>
            </div>

            {/* Collection */}
            <div
              className={`p-2 rounded-lg text-left border ${
                isNotepad
                  ? "bg-white border-orange-200 text-stone-700"
                  : isDefault
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-current/5 border-current/10 text-current"
              }`}
            >
              <div className="text-[11px] font-bold uppercase opacity-70">
                Items Owned
              </div>
              <div className="text-2xl font-black">
                {userData?.cosmeticsCount || 0}
              </div>
            </div>
          </div>

          {/* ACHIEVEMENTS TAB */}
          <div
            className={`mt-5 p-3 rounded-xl border ${
              isNotepad
                ? "bg-orange-100/50 border-orange-200"
                : isDefault
                  ? "bg-gray-100 border-gray-300"
                  : `bg-black/20 border-current/10`
            }`}
          >
            <div
              className={`text-[10px] font-black uppercase opacity-70 mb-2 ${textStyleNotepad}`}
            >
              ⭐ Achievements
            </div>
            <div className="space-y-1">
              {userData?.activeDays >= 7 && (
                <div
                  className={`text-xs font-bold ${
                    isDefault ? "text-gray-700" : "text-current"
                  }`}
                >
                  🏆 Perfect Week — 7+ active days
                </div>
              )}
              {userData?.cosmeticsCount >= 10 && (
                <div
                  className={`text-xs font-bold ${
                    isDefault ? "text-gray-700" : "text-current"
                  }`}
                >
                  💎 Collector — 10+ items owned
                </div>
              )}
              {userData?.totalPulls >= 100 && (
                <div
                  className={`text-xs font-bold ${
                    isDefault ? "text-gray-700" : "text-current"
                  }`}
                >
                  🎰 Gacha Addict — 100+ total pulls
                </div>
              )}
              {equippedCosmetics?.theme === "ssr_matrix" && (
                <div
                  className={`text-xs font-bold ${
                    isDefault ? "text-gray-700" : "text-current"
                  }`}
                >
                  🔒 Limited Hunter — owns Limited item
                </div>
              )}
              {!userData?.activeDays &&
                !userData?.cosmeticsCount &&
                !userData?.totalPulls && (
                  <div
                    className={`text-xs opacity-60 ${
                      isDefault ? "text-gray-600" : "text-current"
                    }`}
                  >
                    Keep grinding to unlock achievements!
                  </div>
                )}
            </div>
          </div>

          {/* FOOTER */}
          <div
            className={`flex justify-between items-center text-[10px] font-mono pt-3 mt-3 border-t ${
              borderStyleNotepad
            } opacity-50`}
          >
            <span>HABIT_GACHA_APP</span>
            <span>VER {import.meta.env?.VITE_APP_VERSION || "v0.7.1"}</span>
          </div>
        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-transparent border border-slate-700 text-slate-400 hover:bg-slate-800/50 hover:text-white font-bold rounded-xl text-xs transition-all"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleDownloadPNG}
            disabled={isExporting}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50"
          >
            {isExporting ? "..." : "Share as PNG"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowcaseModal;
