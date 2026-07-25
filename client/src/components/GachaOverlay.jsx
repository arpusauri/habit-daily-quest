import React from "react";

const RARITY_STYLE = {
  SSR: {
    text: "text-yellow-400",
    border: "border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.6)]",
    badge: "bg-yellow-500 text-black hover:bg-yellow-400 shadow-yellow-500/30",
    ring: "border-yellow-500/70 shadow-[0_0_15px_rgba(234,179,8,0.4)]",
  },
  SR: {
    text: "text-purple-400",
    border: "border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.5)]",
    badge: "bg-purple-600 text-white hover:bg-purple-500 shadow-purple-500/30",
    ring: "border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.3)]",
  },
  R: {
    text: "text-blue-400",
    border: "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.4)]",
    badge: "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/30",
    ring: "border-blue-500/70 shadow-[0_0_12px_rgba(59,130,246,0.3)]",
  },
  default: {
    text: "text-slate-200",
    ring: "border-slate-700",
  },
};

const GachaOverlay = ({
  isRolling = false,
  isRevealing = false,
  currentRollItem = { name: "???", rarity: null },
  gachaResult = null,
  closeOverlay = () => {},
  skipRoll = null,
}) => {
  // Overlay tetep tampil selama rolling ATAU revealing ATAU ada hasil
  if (!isRolling && !isRevealing && !gachaResult) return null;

  const resultId =
    typeof gachaResult === "object" ? gachaResult?.id : gachaResult;
  const resultName =
    typeof gachaResult === "object"
      ? gachaResult?.name || resultId
      : gachaResult;
  const resultRarity =
    typeof gachaResult === "object" ? gachaResult?.rarity : null;

  const style = RARITY_STYLE[resultRarity] || RARITY_STYLE.default;

  // Style buat item yang lagi spin (biar rarity keliatan sebelum reveal)
  const spinRarity =
    typeof currentRollItem === "object" ? currentRollItem?.rarity : null;
  const spinName =
    typeof currentRollItem === "object"
      ? currentRollItem?.name
      : currentRollItem;
  const spinStyle = RARITY_STYLE[spinRarity] || RARITY_STYLE.default;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[60] p-4 transition-all animate-fade-in">
      {/* STATE 1: ANIMASI ROLLING */}
      {isRolling && !isRevealing && (
        <div className="bg-gray-900 border-2 border-indigo-500 p-6 rounded-2xl max-w-sm w-full text-center shadow-[0_0_40px_rgba(99,102,241,0.5)] relative">
          {/* Header row: badge + skip sejajar, gak overlap */}
          <div className="flex items-center justify-between gap-2 mb-8">
            <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase bg-gray-950 px-3 py-1.5 rounded-full border border-indigo-500/50 text-indigo-400 animate-pulse whitespace-nowrap">
              TUNING REWARDS...
            </span>
            {skipRoll && (
              <button
                type="button"
                onClick={skipRoll}
                className="text-xs font-bold text-indigo-300 hover:text-white transition-colors bg-indigo-500/20 hover:bg-indigo-500/40 px-3 py-1.5 rounded-lg border border-indigo-500/40 hover:border-indigo-500/70 active:scale-95 whitespace-nowrap shrink-0"
              >
                SKIP ⏭️
              </button>
            )}
          </div>

          {/* Item name dengan ring warna sesuai rarity */}
          <div
            className={`mx-auto mb-8 px-4 py-3 rounded-xl border-2 transition-all duration-150 ${spinStyle.ring}`}
          >
            <h2
              className={`text-2xl font-black tracking-wide min-h-[40px] flex items-center justify-center transition-colors duration-150 ${spinStyle.text}`}
            >
              {spinName || "Spinning..."}
            </h2>
          </div>

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

      {/* STATE 2: REVEALING (setelah skip, nunggu response server) */}
      {isRevealing && (
        <div className="bg-gray-900 border-2 border-indigo-500 p-8 rounded-2xl max-w-sm w-full text-center shadow-[0_0_40px_rgba(99,102,241,0.5)]">
          <span className="text-xs font-black tracking-widest uppercase bg-gray-950 px-3 py-1 rounded-full border border-indigo-500/50 text-indigo-400">
            MEMBUKA HASIL...
          </span>
          <div className="mt-8 mb-8 flex justify-center">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* STATE 3: REVEAL HASIL GACHA */}
      {!isRolling && !isRevealing && gachaResult && (
        <div
          className={`bg-gray-900 border-2 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl transition-all duration-300 ${style.border}`}
        >
          <span
            className={`text-xs font-black tracking-widest uppercase bg-gray-950 px-3 py-1 rounded-full border border-gray-800 ${style.text}`}
          >
            {resultRarity === "SSR"
              ? "🏆 SSR RANK UNLOCKED"
              : resultRarity === "SR"
                ? "✨ SR RANK UNLOCKED"
                : "🔹 RARE RANK UNLOCKED"}
          </span>

          <div className="mt-6 mb-2">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">
              You obtained
            </p>
            <h2 className={`text-2xl font-black tracking-wide ${style.text}`}>
              {resultName}
            </h2>
          </div>

          {/* 🔥 Badge 50/50 Win/Lose */}
          {gachaResult?.bannerResult === "limited_win" && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/40 text-yellow-300 text-xs font-bold px-3 py-1.5 rounded-full">
              🎉 Menang 50/50!
            </div>
          )}
          {gachaResult?.bannerResult === "limited_lose" && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-bold px-3 py-1.5 rounded-full">
              😔 Kalah 50/50 — SSR berikutnya dijamin!
            </div>
          )}
          {gachaResult?.isPityReward && !gachaResult?.bannerResult && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/40 text-purple-300 text-xs font-bold px-3 py-1.5 rounded-full">
              🌟 Pity Reward!
            </div>
          )}

          {/* Badge Duplicate + Shards */}
          {gachaResult?.isDuplicate ? (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-xs font-bold px-3 py-1.5 rounded-full">
              🔁 Duplicate! +{gachaResult.shardsEarned} 💠 Shards
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-2 mt-3">
              Item otomatis masuk ke inventaris kosmetikmu.
            </p>
          )}

          <button
            type="button"
            onClick={closeOverlay}
            className={`w-full mt-6 py-2.5 font-bold rounded-xl active:scale-95 transition-all text-sm shadow-lg ${style.badge}`}
          >
            Klaim Hadiah ✓
          </button>
        </div>
      )}
    </div>
  );
};

export default GachaOverlay;
