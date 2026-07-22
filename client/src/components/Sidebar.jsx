import React, { useState, useEffect } from "react";

function Sidebar({ onOpenLeaderboard, onOpenBanner, onOpenShop }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* TOMBOL MENU POJOK KIRI ATAS */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 bg-slate-800/90 hover:bg-slate-700 text-white p-3 rounded-xl border border-slate-700 shadow-xl backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group"
      >
        <span className="text-xl group-hover:rotate-12 transition-transform">
          ☰
        </span>
        <span className="font-bold text-sm hidden sm:inline">Menu</span>
      </button>

      {/* OVERLAY BACKDROP */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        />
      )}

      {/* SLIDING SIDEBAR PANEL */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 sm:w-80 bg-slate-900 border-r border-slate-800 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
          <h2 className="font-black text-lg text-yellow-400 tracking-wide flex items-center gap-2">
            ⚙️ GAME NAVIGATION
          </h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-3">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenLeaderboard();
            }}
            className="w-full p-3.5 rounded-xl font-bold flex items-center justify-between bg-slate-800/50 border border-slate-700/50 text-gray-200 hover:bg-slate-800 hover:border-purple-500/50 group transition-all"
          >
            <span className="flex items-center gap-3 text-sm">
              <span className="text-xl">🏆</span> Leaderboard
            </span>
            <span className="text-xs bg-purple-500/20 px-2.5 py-1 rounded-lg text-purple-300 group-hover:bg-purple-600 group-hover:text-white font-black transition-colors">
              Open
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenBanner();
            }}
            className="w-full p-3.5 rounded-xl font-bold flex items-center justify-between bg-slate-800/50 border border-slate-700/50 text-gray-200 hover:bg-slate-800 hover:border-yellow-500/50 group transition-all"
          >
            <span className="flex items-center gap-3 text-sm">
              <span className="text-xl">✨</span> Gacha Banners
            </span>
            <span className="text-xs bg-yellow-500/20 px-2.5 py-1 rounded-lg text-yellow-300 group-hover:bg-yellow-500 group-hover:text-black font-black transition-colors">
              Pull
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenShop();
            }}
            className="w-full p-3.5 rounded-xl font-bold flex items-center justify-between bg-slate-800/50 border border-slate-700/50 text-gray-200 hover:bg-slate-800 hover:border-emerald-500/50 group transition-all"
          >
            <span className="flex items-center gap-3 text-sm">
              <span className="text-xl">🛍️</span> Item & Gems Shop
            </span>
            <span className="text-xs bg-emerald-500/20 px-2.5 py-1 rounded-lg text-emerald-300 group-hover:bg-emerald-500 group-hover:text-black font-black transition-colors">
              Buy
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
