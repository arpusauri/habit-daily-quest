import React, { useState, useRef, useEffect } from "react";

const UserProfile = ({ userData, userCardBorder, nameTagStyle, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Tutup dropdown kalau klik di luar area menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`bg-gray-900 border-2 p-4 rounded-2xl flex items-center justify-between gap-3 relative ${userCardBorder}`}
    >
      {/* SISI KIRI: LEVEL + USERNAME */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Level Circle */}
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border-2 border-purple-400/60 flex flex-col items-center justify-center shrink-0 shadow-[0_0_12px_rgba(168,85,247,0.5)]">
          <span className="text-[8px] font-bold text-purple-200 -mb-0.5 uppercase tracking-wide">
            Lv
          </span>
          <span className="font-black text-sm text-white leading-none">
            {userData?.level || 1}
          </span>
        </div>

        {/* Username */}
        <div className="min-w-0">
          <h2 className={`font-black text-lg truncate ${nameTagStyle}`}>
            {userData?.username || "LegendaryGachaKing"}
          </h2>
          <p className="text-[10px] text-gray-500 font-semibold truncate">
            {userData?.exp || 0} / 100 EXP
          </p>
        </div>
      </div>

      {/* SISI KANAN: GEMS + MENU */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col items-end text-right">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">💎</span>
            <span className="text-xl font-black text-white tracking-wide">
              {userData?.gems || 0}
            </span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500 -mt-1">
            Gems
          </span>
        </div>

        {/* KEBAB MENU */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-gray-400 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-colors active:scale-95"
            aria-label="Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-36 bg-slate-950 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-10 animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
