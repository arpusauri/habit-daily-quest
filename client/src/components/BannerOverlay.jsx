import React, { useState } from "react";

const HARD_PITY = 20;

function BannerOverlay({ isOpen, onClose, rollGacha, isRolling, userData }) {
  const [activeBanner, setActiveBanner] = useState("standard"); // 'standard' | 'limited'

  if (!isOpen) return null;

  const standardPity = userData?.standard_pity || 0;
  const limitedPity = userData?.limited_pity || 0;
  const limitedGuaranteed = userData?.limited_guaranteed || false;

 const handlePull = () => {
   rollGacha({
     endpoint: "/api/gacha/pull",
     bannerType: activeBanner,
     body: { bannerType: activeBanner },
   });
 };

  const PityBar = ({ pity, color }) => (
    <div className="w-full max-w-xs mx-auto mb-4">
      <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-bold">
        <span>PITY</span>
        <span>
          {pity} / {HARD_PITY}
        </span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min((pity / HARD_PITY) * 100, 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl p-6 text-white shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✨</span>
            <div>
              <h2 className="text-xl font-black text-amber-400 tracking-wide">
                GACHA BANNERS
              </h2>
              <p className="text-xs text-gray-400">
                Pilih banner & dapatkan koleksi cosmetic eksklusif!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white font-bold text-xl p-2 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Sub-tab Pilihan Banner */}
        <div className="flex gap-2 mb-4 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveBanner("standard")}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
              activeBanner === "standard"
                ? "bg-purple-600 text-white shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🔮 STANDARD
          </button>
          <button
            type="button"
            onClick={() => setActiveBanner("limited")}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all relative ${
              activeBanner === "limited"
                ? "bg-yellow-400 text-black shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🌟 LIMITED
            {limitedGuaranteed && (
              <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black">
                GUARANTEED
              </span>
            )}
          </button>
        </div>

        {/* Display Banner */}
        <div className="flex-1 flex flex-col justify-center my-auto overflow-y-auto">
          {activeBanner === "standard" ? (
            <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black p-6 rounded-2xl border border-purple-500/30 text-center shadow-inner">
              <span className="inline-block px-3 py-1 bg-purple-400/10 border border-purple-400/30 text-purple-300 text-[10px] font-black rounded-full mb-2">
                PERMANENT POOL
              </span>
              <h3 className="text-2xl font-black text-purple-400 mb-1">
                STANDARD BANNER
              </h3>
              <p className="text-xs text-gray-300 mb-3 max-w-sm mx-auto">
                Koleksi cosmetic dasar. Pity terjamin setiap {HARD_PITY} pull!
              </p>

              <PityBar pity={standardPity} color="bg-purple-500" />

              <button
                type="button"
                onClick={handlePull}
                disabled={isRolling}
                className="px-8 py-3 text-sm font-black bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all transform hover:scale-105 shadow-[0_4px_20px_rgba(147,51,234,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔮 Pull 1x (50 Gems)
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black p-6 rounded-2xl border border-yellow-500/30 text-center shadow-inner">
              <span className="inline-block px-3 py-1 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-[10px] font-black rounded-full mb-2">
                50/50 · RATE UP 👾 CYBERPUNK MATRIX
              </span>
              <h3 className="text-2xl font-black text-yellow-400 mb-1">
                LIMITED BANNER
              </h3>
              <p className="text-xs text-gray-300 mb-3 max-w-sm mx-auto">
                {limitedGuaranteed
                  ? "🎯 Pull SSR berikutnya DIJAMIN dapet Matrix BG!"
                  : "Menang 50/50 → dapet Matrix BG. Kalah? Pull SSR berikutnya dijamin!"}
              </p>

              <PityBar pity={limitedPity} color="bg-yellow-400" />

              <button
                type="button"
                onClick={handlePull}
                disabled={isRolling}
                className="px-8 py-3 text-sm font-black bg-yellow-400 text-black rounded-xl hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-[0_4px_20px_rgba(250,204,21,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🚀 Pull 1x (50 Gems)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BannerOverlay;
