import React from "react";

const UserProfile = ({ userData, userCardBorder, nameTagStyle }) => {
  return (
    <div
      className={`bg-gray-900 border-2 p-4 rounded-2xl flex items-center justify-between gap-3 ${userCardBorder}`}
    >
      {/* 1. SISI KIRI: LEVEL + USERNAME */}
      {/* Wajib pakai `min-w-0` agar efek truncate pada teks di dalamnya bisa bekerja */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Level Circle */}
        <div className="w-10 h-10 rounded-full bg-purple-600 border border-purple-400 flex items-center justify-center font-black text-sm text-white shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
          {userData?.level || 49}
        </div>

        {/* Username (Diberikan efek truncate agar berujung ... kalau kepanjangan) */}
        <h2
          className={`font-black text-lg text-white truncate ${nameTagStyle}`}
        >
          {userData?.username || "LegendaryGachaKing"}
        </h2>
      </div>

      {/* 2. SISI KANAN: GEMS INDICATOR */}
      {/* Kuncinya ada di `shrink-0` supaya posisinya tidak akan pernah tergeser atau mengecil */}
      <div className="flex flex-col items-end shrink-0 text-right pl-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm animate-bounce">💎</span>
          <span className="text-xl font-black text-white tracking-wide">
            {userData?.gems || 19}
          </span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500 -mt-1">
          Gems
        </span>
      </div>
    </div>
  );
};

export default UserProfile;
