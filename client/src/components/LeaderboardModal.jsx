import React, { useState, useEffect } from "react";

export default function LeaderboardModal({ onClose, authFetch, apiUrl }) {
  const [activeTab, setActiveTab] = useState("level"); // 'level' atau 'streak'
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  const fetchLeaderboard = (tab) => {
    setLoading(true);
    authFetch(`${apiUrl}/api/leaderboard/${tab}`)
      .then((res) => res.json())
      .then((data) => {
        setLeaderboardData(data.leaderboard || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching leaderboard:", err);
        setLoading(false);
      });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        {/* Header & Close Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            🏆 HALL OF FAME
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-800 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab("level")}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
              activeTab === "level"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            👑 TOP LEVEL
          </button>
          <button
            onClick={() => setActiveTab("streak")}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
              activeTab === "streak"
                ? "bg-orange-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🔥 TOP STREAK
          </button>
        </div>

        {/* List Content */}
        {loading ? (
          <p className="text-center text-gray-500 py-8 text-sm">
            Memuat Juara...
          </p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {leaderboardData.map((item, index) => {
              // Highlight Top 3
              let rankBadge = `#${index + 1}`;
              let rankStyle = "text-gray-400";
              if (index === 0) {
                rankBadge = "🥇";
                rankStyle = "text-yellow-400 text-lg";
              }
              if (index === 1) {
                rankBadge = "🥈";
                rankStyle = "text-slate-300 text-lg";
              }
              if (index === 2) {
                rankBadge = "🥉";
                rankStyle = "text-amber-600 text-lg";
              }

              return (
                <div
                  key={item.id}
                  className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-black w-6 text-center ${rankStyle}`}>
                      {rankBadge}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {item.username}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Level {item.level}
                      </p>
                    </div>
                  </div>

                  {/* Right Score Info */}
                  <div className="text-right">
                    {activeTab === "level" ? (
                      <span className="text-xs font-black text-indigo-400">
                        Lv. {item.level} ({item.exp} EXP)
                      </span>
                    ) : (
                      <span className="text-xs font-black text-orange-400 flex items-center gap-1">
                        🔥 {item.max_streak} Days
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
