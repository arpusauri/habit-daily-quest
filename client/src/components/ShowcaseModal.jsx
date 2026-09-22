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
  default:
    "bg-gradient-to-br from-green-50 via-white to-white border-[#51b330]/40 text-[#1e720f] shadow-[0_0_30px_rgba(81,179,48,0.2)]",
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
          : isDefault
            ? "text-[#1e720f] font-black"
            : "text-white font-bold";

  const handleCopyUID = () => {
    navigator.clipboard.writeText(userData?.id?.toString() || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      <div className="flex flex-col items-center max-w-md w-full">
        {/* ================= AREA KARTU ================= */}
        <div className="relative w-full">
          {/* Tombol Close — pojok kanan atas, di luar area export PNG */}
          <button
            type="button"
            onClick={onClose}
            className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-white/10 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-lg"
            aria-label="Tutup"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div
            ref={cardRef}
            className={`w-full p-6 rounded-3xl border-2 transition-all relative overflow-hidden ${themeStyle}`}
          >
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-current opacity-10 blur-3xl pointer-events-none" />

            {/* HEADER */}
            <div className="flex justify-between items-start mb-5 border-b border-current/20 pb-3">
              <span
                className={`font-black tracking-widest text-xs uppercase opacity-80 ${textStyleNotepad}`}
              >
                PLAYER CARD
              </span>
              <div className="text-right">
                {userData?.leaderboardRank && (
                  <span className={`text-sm font-black ${textStyleNotepad}`}>
                    Level Rank #{userData.leaderboardRank}/
                    {userData.totalPlayers}
                  </span>
                )}
              </div>
            </div>

            {/* USER INFO: Avatar + Name + Level + UID */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl border-2 shadow-md ${
                    equippedCosmetics?.border === "r_blue"
                      ? "border-cyan-400 bg-cyan-950/50 text-cyan-300"
                      : isDefault
                        ? "border-[#51b330] bg-[#51b330]/10 text-[#1e720f]"
                        : "border-current bg-current/10"
                  }`}
                >
                  {userData?.username?.[0]?.toUpperCase() || "P"}
                </div>
                <div
                  className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-lg border-2 ${
                    isDefault
                      ? "bg-[#51b330] text-white border-[#7ad950]"
                      : "bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-current/30"
                  }`}
                >
                  {userData?.level || 1}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3
                    className={`text-2xl truncate tracking-wide ${nameStyle}`}
                  >
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

                <div
                  className={`text-xs font-mono mb-1 ${
                    isDefault ? "text-[#1e720f]/60" : "opacity-60"
                  }`}
                >
                  UID : {userData?.id || "0000"}
                </div>
                {userData?.created_at && (
                  <div
                    className={`text-xs font-mono ${
                      isDefault ? "text-[#1e720f]/60" : "opacity-60"
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
                    ? "bg-[#51b330]/10"
                    : "bg-black/20"
              }`}
            >
              <div
                className={`p-2 rounded-lg text-left border ${
                  isNotepad
                    ? "bg-white border-orange-200 text-stone-700"
                    : isDefault
                      ? "bg-white border-[#51b330]/30 text-[#1e720f]"
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

              <div
                className={`p-2 rounded-lg text-left border ${
                  isNotepad
                    ? "bg-white border-orange-200 text-stone-700"
                    : isDefault
                      ? "bg-white border-[#51b330]/30 text-[#1e720f]"
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

              <div
                className={`p-2 rounded-lg text-left border ${
                  isNotepad
                    ? "bg-white border-orange-200 text-stone-700"
                    : isDefault
                      ? "bg-white border-[#51b330]/30 text-[#1e720f]"
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

              <div
                className={`p-2 rounded-lg text-left border ${
                  isNotepad
                    ? "bg-white border-orange-200 text-stone-700"
                    : isDefault
                      ? "bg-white border-[#51b330]/30 text-[#1e720f]"
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
                    ? "bg-[#51b330]/10 border-[#51b330]/30"
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
                      isDefault ? "text-[#1e720f]" : "text-current"
                    }`}
                  >
                    🏆 Perfect Week — 7+ active days
                  </div>
                )}
                {userData?.cosmeticsCount >= 10 && (
                  <div
                    className={`text-xs font-bold ${
                      isDefault ? "text-[#1e720f]" : "text-current"
                    }`}
                  >
                    💎 Collector — 10+ items owned
                  </div>
                )}
                {userData?.totalPulls >= 100 && (
                  <div
                    className={`text-xs font-bold ${
                      isDefault ? "text-[#1e720f]" : "text-current"
                    }`}
                  >
                    🎰 Gacha Addict — 100+ total pulls
                  </div>
                )}
                {equippedCosmetics?.theme === "ssr_matrix" && (
                  <div
                    className={`text-xs font-bold ${
                      isDefault ? "text-[#1e720f]" : "text-current"
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
                        isDefault ? "text-[#1e720f]/70" : "text-current"
                      }`}
                    >
                      Keep grinding to unlock achievements!
                    </div>
                  )}
              </div>
            </div>

            {/* FOOTER */}
            <div
              className={`flex justify-between items-center text-[10px] font-mono pt-3 mt-3 border-t ${borderStyleNotepad} opacity-50`}
            >
              <span>HABIT_GACHA_APP</span>
              <span>VER {import.meta.env?.VITE_APP_VERSION || "v0.7.1"}</span>
            </div>
          </div>
        </div>

        {/* ================= ACTION: Share PNG — pill kecil, mengambang di bawah kartu ================= */}
        <button
          type="button"
          onClick={handleDownloadPNG}
          disabled={isExporting}
          className="mt-4 flex items-center gap-2 px-5 py-2 bg-[#51b330] hover:bg-[#409228] text-white font-bold rounded-full text-xs transition-all shadow-lg shadow-[#51b330]/30 disabled:opacity-50 active:scale-95 cursor-pointer"
        >
          {isExporting ? (
            "Menyimpan..."
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Share as PNG
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ShowcaseModal;
