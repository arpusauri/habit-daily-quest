import React from "react";

const Inventory = ({
  userData,
  selectedRarityFilter,
  setSelectedRarityFilter,
  equipItem,
  setShowItemIndex,
}) => {
  if (!userData) return null;

  return (
    <div className="w-full mt-8">
      {/* --- HEADER & FILTER ROW --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-700 pb-4">
        {/* Kiri: Title & Tombol Collection Book */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-wide">
            🎒 Inventory ({userData.inventory?.length || 0})
          </h2>
        </div>

        {/* Kanan: Rarity Filter Controls */}
        <div className="flex gap-1 bg-gray-900/60 p-1 rounded-xl border border-gray-800 self-start sm:self-auto">
          {["ALL", "R", "SR", "SSR"].map((rarity) => (
            <button
              key={`header-${rarity}`}
              type="button"
              onClick={() => setSelectedRarityFilter(rarity)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedRarityFilter === rarity
                  ? "bg-indigo-600 text-white shadow-md border border-indigo-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {rarity === "ALL" ? "✨ SHOW ALL" : rarity}
            </button>
          ))}
        </div>
      </div>

      {/* --- MASTER INVENTORY SECTION --- */}
      <div className="w-full space-y-6">
        <button
          onClick={() => setShowItemIndex(true)}
          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-bold transition-colors shadow-md flex items-center gap-1"
        >
          📚 Collection Book
        </button>
        {userData.inventory?.length === 0 ? (
          <p className="text-gray-500 italic text-center py-6">
            Your inventory is empty. Go pull on banners! 🎰
          </p>
        ) : (
          (() => {
            // 1. Structural blueprint defining our inventory slots
            const categories = [
              {
                id: "THEMES",
                label: "🖼️ Background Themes",
                itemIds: ["sr_dark", "ssr_matrix"],
              },
              {
                id: "BORDERS",
                label: "🔲 Profile Borders",
                itemIds: ["r_blue"],
              },
              {
                id: "TITLES",
                label: "🏷️ Custom Titles & Fonts",
                itemIds: ["r_pink", "sr_gold"],
              },
            ];

            // 2. Rarity filter helper logic
            const matchesRarity = (itemId) => {
              if (selectedRarityFilter === "ALL") return true;
              if (selectedRarityFilter === "R" && itemId.startsWith("r_"))
                return true;
              if (selectedRarityFilter === "SR" && itemId.startsWith("sr_"))
                return true;
              if (selectedRarityFilter === "SSR" && itemId.startsWith("ssr_"))
                return true;
              return false;
            };

            // 3. Count total visible matches across all slots to check for blank filters
            const totalVisible =
              userData.inventory.filter(matchesRarity).length;
            if (totalVisible === 0) {
              return (
                <p className="text-gray-500 italic text-center py-6">
                  No {selectedRarityFilter} items currently unlocked.
                </p>
              );
            }

            // 4. Render separated groups
            return categories.map((cat) => {
              const itemsToRender = userData.inventory.filter(
                (itemId) =>
                  cat.itemIds.includes(itemId) && matchesRarity(itemId),
              );

              // Hide the whole card if no unlocked items in this category fit the active filter
              if (itemsToRender.length === 0) return null;

              return (
                <div
                  key={cat.id}
                  className="bg-gray-900/30 p-5 rounded-2xl border border-gray-800 shadow-sm text-left"
                >
                  {/* Group Label Banner */}
                  <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 border-l-4 border-indigo-500 pl-2">
                    {cat.label}
                  </h4>

                  {/* Grid for this specific category's items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {itemsToRender.map((itemId) => {
                      let cleanName = "";
                      if (itemId === "r_blue") cleanName = "Cyan Border";
                      if (itemId === "r_pink") cleanName = "Pink Text Font";
                      if (itemId === "sr_dark")
                        cleanName = "Obsidian Dark Theme";
                      if (itemId === "sr_gold") cleanName = "Golden Name Tag";
                      if (itemId === "ssr_matrix")
                        cleanName = "Animated Cyberpunk Matrix";

                      const isEquipped =
                        userData.equipped_border === itemId ||
                        userData.equipped_font === itemId ||
                        userData.equipped_theme === itemId;

                      const rank = itemId.startsWith("ssr_")
                        ? "SSR"
                        : itemId.startsWith("sr_")
                          ? "SR"
                          : "R";

                      const rankBadgeClass =
                        rank === "SSR"
                          ? "text-yellow-400 bg-yellow-400/10 border-yellow-500/20"
                          : rank === "SR"
                            ? "text-purple-400 bg-purple-400/10 border-purple-500/20"
                            : "text-blue-400 bg-blue-400/10 border-blue-500/20";

                      return (
                        <div
                          key={itemId}
                          className="bg-gray-800 text-white p-4 rounded-xl flex justify-between items-center shadow-md border border-gray-700/40 hover:border-gray-600 transition-all"
                        >
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-semibold tracking-wide text-left">
                              {cleanName}
                            </span>
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded border mt-1.5 ${rankBadgeClass}`}
                            >
                              {rank} RANK
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => equipItem(itemId)}
                            disabled={isEquipped}
                            className={`text-xs px-4 py-2 font-bold rounded-lg transition-all ${
                              isEquipped
                                ? "bg-green-600/20 text-green-400 border border-green-500/40 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-500 active:scale-95 shadow-sm"
                            }`}
                          >
                            {isEquipped ? "Equipped ✓" : "Equip"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            });
          })()
        )}
      </div>
    </div>
  );
};

export default Inventory;
