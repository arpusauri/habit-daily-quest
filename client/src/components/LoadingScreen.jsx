import React from "react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-[#1e720f]/80 flex items-center justify-center z-50 overflow-hidden">
      <style>{`
        @keyframes gambit-loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(250%); }
        }
      `}</style>

      {/* Thin indeterminate progress bar - pojok kiri atas */}
      <div className="absolute top-0 left-0 w-full h-1 bg-black/20">
        <div
          className="h-full w-1/3 bg-[#7ad950]"
          style={{ animation: "gambit-loading-bar 1.2s ease-in-out infinite" }}
        />
      </div>

      {/* Brand mark tengah - ganti jadi <img> icon kalau udah ada */}
      <h1 className="text-white text-3xl sm:text-4xl font-black tracking-[0.3em] select-none opacity-90">
        GAMBIT
      </h1>
    </div>
  );
};

export default LoadingScreen;
