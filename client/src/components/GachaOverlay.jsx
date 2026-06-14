import React from "react";

const GachaOverlay = ({
  isRolling,
  currentRollItem,
  gachaResult,
  closeOverlay,
}) => {
  if (!isRolling && !gachaResult) return null;

  const isSSR = gachaResult?.id?.startsWith("ssr_");
  const isSR = gachaResult?.id?.startsWith("sr_");

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
      {!isRolling && gachaResult && (
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
            <h2 className={`text-2xl font-black tracking-wide ${textColor}`}>
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
      )}
    </div>
  );
};

export default GachaOverlay;
