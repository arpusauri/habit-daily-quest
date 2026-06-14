import React from "react";

// 1. TAMBAHKAN onLogout di dalam parameter props di bawah ini
const UserProfile = ({ userData, userCardBorder, nameTagStyle, onLogout }) => {
  return (
    <div
      className={`bg-gray-900 border-2 p-4 rounded-2xl flex items-center justify-between gap-3 ${userCardBorder}`}
    >
      {/* 1. SISI KIRI: LEVEL + USERNAME */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Level Circle */}
        <div className="w-10 h-10 rounded-full bg-purple-600 border border-purple-400 flex items-center justify-center font-black text-sm text-white shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
          {userData?.level || 49}
        </div>

        {/* Username */}
        <h2
          className={`font-black text-lg text-white truncate ${nameTagStyle}`}
        >
          {userData?.username || "LegendaryGachaKing"}
        </h2>
      </div>

      {/* 2. SISI KANAN: GEMS INDICATOR */}
      <div className="flex flex-col items-end shrink-0 text-right pl-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm animate-bounce">💎</span>
          <span className="text-xl font-black text-white tracking-wide">
            {userData?.gems || 0}
          </span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500 -mt-1">
          Gems
        </span>
      </div>

      {/* 3. TOMBOL LOGOUT */}
      {/* 2. UBAH onClick agar memanggil props onLogout */}
      <button
        type="button"
        onClick={onLogout}
        className="text-xs text-gray-500 hover:text-red-400 transition-colors ml-2 shrink-0 font-bold"
      >
        Logout
      </button>
    </div>
  );
};

export default UserProfile;
