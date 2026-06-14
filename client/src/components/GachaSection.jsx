import React from "react";

const GachaSection = ({ rollGacha, isRolling }) => {
  return (
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
  );
};

export default GachaSection;
