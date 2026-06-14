import React from "react";

const UserProfile = ({ userData, userCardBorder, nameTagStyle }) => {
  // Kalau data belum ada, jangan render apa-apa (atau bisa kasih loading)
  if (!userData) return null;

  return (
    <div
      className={`flex flex-col gap-3 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-lg ${userCardBorder}`}
    >
      {/* Top Row: Name and Gems */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          {/* Level Badge */}
          <div className="bg-indigo-600 text-white font-black rounded-full h-10 w-10 flex items-center justify-center border-2 border-indigo-400 shadow-[0_0_10px_rgba(79,70,229,0.5)] text-lg">
            {userData.level || 1}
          </div>

          {/* Dynamic Username */}
          <h2 className={`text-xl ${nameTagStyle}`}>
            {userData.username || "Loading..."}
          </h2>
        </div>

        <h2 className="text-xl font-bold text-yellow-400">
          💎 {userData.gems} Gems
        </h2>
      </div>

      {/* Bottom Row: EXP Progress Bar */}
      <div className="w-full mt-1">
        <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
          <span className="uppercase tracking-widest">EXP Progress</span>
          <span>{userData.exp || 0} / 100</span>
        </div>

        {/* The Bar Background */}
        <div className="w-full bg-gray-800 rounded-full h-3 border border-gray-700 overflow-hidden">
          {/* The Animated Green Fill */}
          <div
            className="bg-green-500 h-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(34,197,94,0.8)]"
            style={{
              width: `${Math.min(((userData.exp || 0) / 100) * 100, 100)}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
