import React, { useState } from "react";

const BannerSection = ({ rollGacha, isRolling }) => {
  const [activeBanner, setActiveBanner] = useState("beginner"); // 'beginner' | 'standard'

  return (
    <div className="mt-6 bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-6 rounded-2xl border border-slate-700 shadow-2xl relative overflow-hidden">
      {/* Selector Tab Banner */}
      <div className="flex gap-2 mb-4 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveBanner("beginner")}
          className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
            activeBanner === "beginner"
              ? "bg-yellow-400 text-black shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          ✨ BEGINNER
        </button>
        <button
          onClick={() => setActiveBanner("standard")}
          className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
            activeBanner === "standard"
              ? "bg-purple-600 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          🔮 STANDARD
        </button>
      </div>

      {/* Isi Content Banner */}
      {activeBanner === "beginner" ? (
        <div className="text-center py-2 animate-fade-in">
          <span className="inline-block px-3 py-1 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-[10px] font-black rounded-full mb-2">
            RATE UP 5% SSR
          </span>
          <h3 className="text-xl font-black tracking-wider mb-1 text-slate-100">
            BEGINNER BANNER
          </h3>
          <p className="text-xs text-gray-300 mb-6">
            Diskon khusus pemula! Dapatkan kosmetik SSR Matrix pertama kamu.
          </p>

          <button
            type="button"
            onClick={rollGacha}
            disabled={isRolling}
            className="w-full sm:w-auto px-8 py-3 text-sm font-black bg-yellow-400 text-black rounded-xl hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-[0_4px_20px_rgba(250,204,21,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Pull 1x (50 Gems)
          </button>
        </div>
      ) : (
        <div className="text-center py-2 animate-fade-in">
          <span className="inline-block px-3 py-1 bg-purple-400/10 border border-purple-400/30 text-purple-300 text-[10px] font-black rounded-full mb-2">
            PERMANENT POOL
          </span>
          <h3 className="text-xl font-black tracking-wider mb-1 text-slate-100">
            STANDARD BANNER
          </h3>
          <p className="text-xs text-gray-300 mb-6">
            Koleksi seluruh item cosmetic umum dan font nama eksklusif.
          </p>

          <button
            type="button"
            onClick={rollGacha}
            disabled={isRolling}
            className="w-full sm:w-auto px-8 py-3 text-sm font-black bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all transform hover:scale-105 shadow-[0_4px_20px_rgba(147,51,234,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔮 Pull 1x (50 Gems)
          </button>
        </div>
      )}
    </div>
  );
};

export default BannerSection;
