import React from "react";

const Inventory = ({
  userData,
  selectedRarityFilter,
  setSelectedRarityFilter,
  equipItem,
  unequipItem,
  setShowItemIndex,
  isAuroraMode,
  isMatrixMode,
  isStarforgeMode,
  isNotepadMode,
  isDarkMode,
}) => {
  if (!userData) return null;

  const userInventory = Array.isArray(userData.inventory)
    ? userData.inventory
    : [];

  return (
    <div className="w-full mt-8">
      {/* HEADER & FILTER ROW */}
      <div
        className={`w-full min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b ${
          isMatrixMode
            ? "border-green-600/30"
            : isAuroraMode
              ? "border-purple-800/40"
              : isStarforgeMode
                ? "border-amber-700/40"
                : isNotepadMode
                  ? "border-stone-200"
                  : isDarkMode
                    ? "border-gray-800"
                    : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <h2
            className={`text-xl font-bold tracking-wide truncate ${
              isMatrixMode
                ? "text-green-400 font-mono drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                : isAuroraMode
                  ? "text-fuchsia-100"
                  : isStarforgeMode
                    ? "text-amber-100"
                    : isNotepadMode
                      ? "text-stone-800"
                      : isDarkMode
                        ? "text-white"
                        : "text-gray-900"
            }`}
          >
            {isMatrixMode ? "INVENTORY_CACHE" : "Inventory"} (
            {userInventory.length})
          </h2>
          <button
            type="button"
            onClick={() => setShowItemIndex(true)}
            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all shadow-md flex items-center gap-1 active:scale-95 whitespace-nowrap shrink-0 ${
              isMatrixMode
                ? "bg-green-950/40 text-green-400 border border-green-400 hover:bg-green-400 hover:text-black font-mono"
                : isAuroraMode
                  ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white"
                  : isStarforgeMode
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black"
                    : isNotepadMode
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : isDarkMode
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                        : "border border-gray-900 text-gray-900 bg-white hover:bg-gray-900 hover:text-white"
            }`}
          >
            📚 Collection Book
          </button>
        </div>

        <div
          className={`flex gap-1 p-1 rounded-xl border self-start sm:self-auto ${
            isMatrixMode
              ? "bg-black border-green-600/30"
              : isAuroraMode
                ? "bg-indigo-950/60 border-purple-800/40"
                : isStarforgeMode
                  ? "bg-slate-900/60 border-amber-700/40"
                  : isNotepadMode
                    ? "bg-amber-50 border-stone-200"
                    : isDarkMode
                      ? "bg-gray-900/60 border-gray-800"
                      : "bg-white border-gray-300"
          }`}
        >
          {["ALL", "R", "SR", "SSR"].map((rarity) => (
            <button
              key={`header-${rarity}`}
              type="button"
              onClick={() => setSelectedRarityFilter(rarity)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                selectedRarityFilter === rarity
                  ? isMatrixMode
                    ? "bg-green-500 text-black shadow-md border border-green-400 font-mono"
                    : isAuroraMode
                      ? "bg-fuchsia-600 text-white shadow-md border border-fuchsia-500"
                      : isStarforgeMode
                        ? "bg-amber-500 text-black shadow-md border border-amber-400"
                        : isNotepadMode
                          ? "bg-orange-500 text-white shadow-md border border-orange-500"
                          : isDarkMode
                            ? "bg-indigo-600 text-white shadow-md border border-indigo-500"
                            : "bg-gray-900 text-white shadow-md border border-gray-900"
                  : isMatrixMode
                    ? "text-green-600 hover:text-green-300 font-mono"
                    : isAuroraMode
                      ? "text-purple-300 hover:text-white"
                      : isStarforgeMode
                        ? "text-amber-300/70 hover:text-amber-100"
                        : isNotepadMode
                          ? "text-stone-400 hover:text-stone-700"
                          : isDarkMode
                            ? "text-gray-400 hover:text-white"
                            : "text-gray-400 hover:text-gray-900"
              }`}
            >
              {rarity === "ALL" ? "ALL" : rarity}
            </button>
          ))}
        </div>
      </div>

      {/* MASTER INVENTORY LIST */}
      <div className="w-full space-y-6">
        {userInventory.length === 0 ? (
          <p
            className={`italic text-center py-8 rounded-2xl border ${
              isMatrixMode
                ? "text-green-600 bg-black border-green-600/30 font-mono not-italic"
                : isAuroraMode
                  ? "text-purple-300 bg-indigo-950/30 border-purple-800/40"
                  : isStarforgeMode
                    ? "text-amber-300/80 bg-slate-900/40 border-amber-700/40"
                    : isNotepadMode
                      ? "text-stone-400 bg-white border-stone-200"
                      : "text-gray-400 bg-gray-50 border-gray-300"
            }`}
          >
            {isMatrixMode
              ? "> NO_DATA_FOUND. Selesaikan mission dulu."
              : "Inventory kamu masih kosong. Yuk pull banner gacha! 🎰"}
          </p>
        ) : (
          (() => {
            const categories = [
              {
                id: "THEMES",
                label: "🖼️ Background Themes",
                itemIds: [
                  "sr_dark",
                  "ssr_matrix",
                  "shop_aurora",
                  "ssr_starforge",
                  "ssr_notepad",
                ],
              },
              {
                id: "BORDERS",
                label: "🔲 Profile Borders",
                itemIds: ["r_blue"],
              },
              {
                id: "TITLES",
                label: "🏷️ Custom Titles & Fonts",
                itemIds: ["r_pink", "sr_gold", "shop_crown"],
              },
            ];

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

            const totalVisible = userInventory.filter(matchesRarity).length;

            if (totalVisible === 0) {
              return (
                <p
                  className={`italic text-center py-6 ${
                    isMatrixMode
                      ? "text-green-600 font-mono not-italic"
                      : isAuroraMode
                        ? "text-purple-300"
                        : isStarforgeMode
                          ? "text-amber-300/80"
                          : isNotepadMode
                            ? "text-stone-400"
                            : "text-gray-400"
                  }`}
                >
                  Tidak ada item {selectedRarityFilter} yang sudah dimiliki.
                </p>
              );
            }

            return categories.map((cat) => {
              const itemsToRender = userInventory.filter(
                (itemId) =>
                  cat.itemIds.includes(itemId) && matchesRarity(itemId),
              );

              if (itemsToRender.length === 0) return null;

              return (
                <div
                  key={cat.id}
                  className={`p-5 rounded-2xl border shadow-sm text-left ${
                    isMatrixMode
                      ? "bg-black border-green-600/30"
                      : isAuroraMode
                        ? "bg-indigo-950/40 border-purple-800/40"
                        : isStarforgeMode
                          ? "bg-slate-900/40 border-amber-700/30"
                          : isNotepadMode
                            ? "bg-white border-stone-200"
                            : isDarkMode
                              ? "bg-gray-900/40 border-gray-800/80"
                              : "bg-white border-gray-200"
                  }`}
                >
                  <h4
                    className={`text-xs font-black uppercase tracking-widest mb-4 border-l-4 pl-2 ${
                      isMatrixMode
                        ? "text-green-400 border-green-500 font-mono"
                        : isAuroraMode
                          ? "text-fuchsia-300 border-fuchsia-500"
                          : isStarforgeMode
                            ? "text-amber-300 border-amber-500"
                            : isNotepadMode
                              ? "text-orange-600 border-orange-400"
                              : isDarkMode
                                ? "text-indigo-400 border-indigo-500"
                                : "text-gray-500 border-gray-900"
                    }`}
                  >
                    {cat.label}
                  </h4>

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
                      if (itemId === "shop_aurora")
                        cleanName = "Aurora Dream Theme";
                      if (itemId === "shop_crown")
                        cleanName = "Diamond Crown Tag";
                      if (itemId === "ssr_starforge")
                        cleanName = "Starforge Celestial Theme";
                      if (itemId === "ssr_notepad") cleanName = "Notepad Theme";

                      const isEquipped =
                        userData.equipped_border === itemId ||
                        userData.equipped_font === itemId ||
                        userData.equipped_theme === itemId;

                      const SPECIAL_RARITY = {
                        shop_aurora: "SR",
                        shop_crown: "SSR",
                        ssr_starforge: "SSR",
                        ssr_notepad: "SSR",
                      };

                      // Konfigurasi tipe Banner/Tipe Item
                      const BANNER_TYPE = {
                        ssr_matrix: "LIMITED",
                        ssr_starforge: "STANDARD",
                        ssr_notepad: "STANDARD",
                        shop_crown: "LIMITED",
                        // Anda bisa menambahkan item lain ke sini
                      };

                      const rank =
                        SPECIAL_RARITY[itemId] ||
                        (itemId.startsWith("ssr_")
                          ? "SSR"
                          : itemId.startsWith("sr_")
                            ? "SR"
                            : "R");

                      const bannerType = BANNER_TYPE[itemId]; // Cek apakah item ini LIMITED / STANDARD

                      // ===== PERUBAHAN DI SINI: R Rank Menjadi Hijau =====
                      const rankBadgeClass = isMatrixMode
                        ? "text-green-400 bg-green-400/10 border-green-500/30 font-mono"
                        : rank === "SSR"
                          ? "text-yellow-400 bg-yellow-400/10 border-yellow-500/20"
                          : rank === "SR"
                            ? "text-purple-400 bg-purple-400/10 border-purple-500/20"
                            : "text-green-400 bg-green-400/10 border-green-500/20"; // R = Green

                      const isExclusive =
                        itemId === "shop_aurora" || itemId === "shop_crown";

                      return (
                        <div
                          key={itemId}
                          className={`p-4 rounded-xl flex justify-between items-center shadow-md border transition-all ${
                            isMatrixMode
                              ? "bg-black border-green-600/40 text-green-400 hover:border-green-400 font-mono"
                              : isAuroraMode
                                ? "bg-indigo-900/40 border-purple-700/40 text-white hover:border-fuchsia-500/50"
                                : isStarforgeMode
                                  ? "bg-slate-800/60 border-amber-700/40 text-amber-50 hover:border-yellow-500/50"
                                  : isNotepadMode
                                    ? "bg-amber-50/40 border-stone-200 text-stone-800 hover:border-orange-300"
                                    : isDarkMode
                                      ? "bg-gray-800/80 border-gray-700/50 text-white hover:border-gray-600"
                                      : "bg-white border-gray-300 text-gray-900 hover:border-gray-500"
                          }`}
                        >
                          <div className="flex flex-col items-start">
                            <span
                              className={`text-sm font-semibold tracking-wide text-left ${
                                isMatrixMode ? "text-green-300" : ""
                              }`}
                            >
                              {cleanName}
                            </span>

                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                              {/* Rarity Badge */}
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded border ${rankBadgeClass}`}
                              >
                                {rank} RANK
                              </span>

                              {/* Banner Type Badge (LIMITED / STANDARD) */}
                              {bannerType && (
                                <span
                                  className={`text-[9px] font-black px-2 py-0.5 rounded border transition-all ${
                                    isMatrixMode
                                      ? bannerType === "LIMITED"
                                        ? "bg-green-400 text-black border-green-400 font-mono shadow-[0_0_5px_rgba(74,222,128,0.4)]"
                                        : "bg-green-950/20 text-green-500 border-green-700/50 font-mono"
                                      : bannerType === "LIMITED"
                                        ? "text-blue-400 bg-blue-400/10 border-blue-500/20"
                                        : "text-orange-400 bg-orange-400/10 border-orange-500/30"
                                  }`}
                                >
                                  {isMatrixMode
                                    ? bannerType === "LIMITED"
                                      ? "◆ LIMITED"
                                      : "▤ STANDARD"
                                    : `${bannerType === "LIMITED" ? "🔹" : "🎫"} ${bannerType}`}
                                </span>
                              )}

                              {/* Exclusive Badge */}
                              {isExclusive && (
                                <span
                                  className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                                    isMatrixMode
                                      ? "text-green-300 bg-green-400/10 border-green-500/30 font-mono"
                                      : "text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-500/20"
                                  }`}
                                >
                                  ✦ EXCLUSIVE
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              isEquipped
                                ? unequipItem(itemId)
                                : equipItem(itemId)
                            }
                            className={`text-xs px-4 py-2 font-bold rounded-lg transition-all ${
                              isEquipped
                                ? isMatrixMode
                                  ? "bg-green-950/40 text-green-400 border border-green-500/50 hover:bg-red-950/40 hover:text-red-400 hover:border-red-500/50 active:scale-95 font-mono"
                                  : "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40 active:scale-95"
                                : isMatrixMode
                                  ? "bg-green-900/30 text-green-400 border border-green-400 hover:bg-green-400 hover:text-black active:scale-95 font-mono"
                                  : isAuroraMode
                                    ? "bg-fuchsia-600 text-white hover:bg-fuchsia-500 active:scale-95 shadow-sm"
                                    : isStarforgeMode
                                      ? "bg-amber-500 text-black hover:bg-amber-400 active:scale-95 shadow-sm"
                                      : isNotepadMode
                                        ? "bg-orange-500 text-white hover:bg-orange-600 active:scale-95 shadow-sm"
                                        : isDarkMode
                                          ? "bg-blue-600 text-white hover:bg-blue-500 active:scale-95 shadow-sm"
                                          : "bg-gray-900 text-white hover:bg-gray-700 active:scale-95 shadow-sm"
                            }`}
                          >
                            {isEquipped
                              ? isMatrixMode
                                ? "[UNEQUIP]"
                                : "Unequip"
                              : isMatrixMode
                                ? "[EQUIP]"
                                : "Equip"}
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
