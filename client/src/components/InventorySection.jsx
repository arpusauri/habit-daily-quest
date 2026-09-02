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

  // ─────────────────────────────────────────────────────────
  // THEME CONFIG - tambahin key baru di sini (misal "wireframe")
  // buat bikin varian tema baru tanpa nyentuh JSX di bawah
  // ─────────────────────────────────────────────────────────
  const themeConfig = {
    matrix: {
      headerBorderClass: "border-green-600/30",
      title: "INVENTORY_CACHE",
      titleClass:
        "text-green-400 font-mono drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]",
      itemIndexButtonClass:
        "bg-green-900/30 text-green-400 border border-green-400 hover:bg-green-400 hover:text-black font-mono",
      filterContainerClass: "bg-black border-green-600/30",
      filterActiveClass:
        "bg-green-500 text-black shadow-md border border-green-400 font-mono",
      filterInactiveClass: "text-green-600 hover:text-green-300 font-mono",
      emptyStateClass:
        "text-green-600 bg-black border-green-600/30 font-mono not-italic",
      emptyStateText: "> NO_DATA_FOUND. Selesaikan mission dulu.",
      categoryCardClass: "bg-black border-green-600/30",
      categoryLabelClass: "text-green-400 border-green-500 font-mono",
      itemNameClass: "text-green-300",
      itemCardClass:
        "bg-black border-green-600/40 text-green-400 hover:border-green-400 font-mono",
      rankBadgeClass: () =>
        "text-green-400 bg-green-400/10 border-green-500/30 font-mono",
      bannerBadgeClass: (type) =>
        type === "LIMITED"
          ? "bg-green-400 text-black border-green-400 font-mono shadow-[0_0_5px_rgba(74,222,128,0.4)]"
          : "bg-green-950/20 text-green-500 border-green-700/50 font-mono",
      bannerBadgeText: (type) =>
        type === "LIMITED" ? "◆ LIMITED" : "▤ STANDARD",
      exclusiveBadgeClass:
        "text-green-300 bg-green-400/10 border-green-500/30 font-mono",
      equipButtonClass: (isEquipped) =>
        isEquipped
          ? "bg-green-950/40 text-green-400 border border-green-500/50 hover:bg-red-950/40 hover:text-red-400 hover:border-red-500/50 active:scale-95 font-mono"
          : "bg-green-900/30 text-green-400 border border-green-400 hover:bg-green-400 hover:text-black active:scale-95 font-mono",
      equipButtonText: (isEquipped) => (isEquipped ? "[UNEQUIP]" : "[EQUIP]"),
    },
    aurora: {
      headerBorderClass: "border-purple-800/40",
      title: "Inventory",
      titleClass: "text-fuchsia-100",
      itemIndexButtonClass:
        "bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white",
      filterContainerClass: "bg-indigo-950/60 border-purple-800/40",
      filterActiveClass:
        "bg-fuchsia-600 text-white shadow-md border border-fuchsia-500",
      filterInactiveClass: "text-purple-300 hover:text-white",
      emptyStateClass: "text-purple-300 bg-indigo-950/30 border-purple-800/40",
      emptyStateText: "Inventory kamu masih kosong. Yuk pull banner gacha! 🎰",
      categoryCardClass: "bg-indigo-950/40 border-purple-800/40",
      categoryLabelClass: "text-fuchsia-300 border-fuchsia-500",
      itemNameClass: "",
      itemCardClass:
        "bg-indigo-900/40 border-purple-700/40 text-white hover:border-fuchsia-500/50",
      rankBadgeClass: (rank) =>
        rank === "SSR"
          ? "text-yellow-400 bg-yellow-400/10 border-yellow-500/20"
          : rank === "SR"
            ? "text-purple-400 bg-purple-400/10 border-purple-500/20"
            : "text-green-400 bg-green-400/10 border-green-500/20",
      bannerBadgeClass: (type) =>
        type === "LIMITED"
          ? "text-blue-400 bg-blue-400/10 border-blue-500/20"
          : "text-orange-400 bg-orange-400/10 border-orange-500/30",
      bannerBadgeText: (type) => `${type === "LIMITED" ? "🔹" : "🎫"} ${type}`,
      exclusiveBadgeClass:
        "text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-500/20",
      equipButtonClass: (isEquipped) =>
        isEquipped
          ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40 active:scale-95"
          : "bg-fuchsia-600 text-white hover:bg-fuchsia-500 active:scale-95 shadow-sm",
      equipButtonText: (isEquipped) => (isEquipped ? "Unequip" : "Equip"),
    },
    starforge: {
      headerBorderClass: "border-amber-700/40",
      title: "Inventory",
      titleClass: "text-amber-100",
      itemIndexButtonClass:
        "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black",
      filterContainerClass: "bg-slate-900/60 border-amber-700/40",
      filterActiveClass:
        "bg-amber-500 text-black shadow-md border border-amber-400",
      filterInactiveClass: "text-amber-300/70 hover:text-amber-100",
      emptyStateClass: "text-amber-300/80 bg-slate-900/40 border-amber-700/40",
      emptyStateText: "Inventory kamu masih kosong. Yuk pull banner gacha! 🎰",
      categoryCardClass: "bg-slate-900/40 border-amber-700/30",
      categoryLabelClass: "text-amber-300 border-amber-500",
      itemNameClass: "",
      itemCardClass:
        "bg-slate-800/60 border-amber-700/40 text-amber-50 hover:border-yellow-500/50",
      rankBadgeClass: (rank) =>
        rank === "SSR"
          ? "text-yellow-400 bg-yellow-400/10 border-yellow-500/20"
          : rank === "SR"
            ? "text-purple-400 bg-purple-400/10 border-purple-500/20"
            : "text-green-400 bg-green-400/10 border-green-500/20",
      bannerBadgeClass: (type) =>
        type === "LIMITED"
          ? "text-blue-400 bg-blue-400/10 border-blue-500/20"
          : "text-orange-400 bg-orange-400/10 border-orange-500/30",
      bannerBadgeText: (type) => `${type === "LIMITED" ? "🔹" : "🎫"} ${type}`,
      exclusiveBadgeClass:
        "text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-500/20",
      equipButtonClass: (isEquipped) =>
        isEquipped
          ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40 active:scale-95"
          : "bg-amber-500 text-black hover:bg-amber-400 active:scale-95 shadow-sm",
      equipButtonText: (isEquipped) => (isEquipped ? "Unequip" : "Equip"),
    },
    notepad: {
      headerBorderClass: "border-stone-200",
      title: "Inventory",
      titleClass: "text-stone-800",
      itemIndexButtonClass: "bg-orange-500 hover:bg-orange-600 text-white",
      filterContainerClass: "bg-amber-50 border-stone-200",
      filterActiveClass:
        "bg-orange-500 text-white shadow-md border border-orange-500",
      filterInactiveClass: "text-stone-400 hover:text-stone-700",
      emptyStateClass: "text-stone-400 bg-white border-stone-200",
      emptyStateText: "Inventory kamu masih kosong. Yuk pull banner gacha! 🎰",
      categoryCardClass: "bg-white border-stone-200",
      categoryLabelClass: "text-orange-600 border-orange-400",
      itemNameClass: "",
      itemCardClass:
        "bg-amber-50/40 border-stone-200 text-stone-800 hover:border-orange-300",
      rankBadgeClass: (rank) =>
        rank === "SSR"
          ? "text-yellow-400 bg-yellow-400/10 border-yellow-500/20"
          : rank === "SR"
            ? "text-purple-400 bg-purple-400/10 border-purple-500/20"
            : "text-green-400 bg-green-400/10 border-green-500/20",
      bannerBadgeClass: (type) =>
        type === "LIMITED"
          ? "text-blue-400 bg-blue-400/10 border-blue-500/20"
          : "text-orange-400 bg-orange-400/10 border-orange-500/30",
      bannerBadgeText: (type) => `${type === "LIMITED" ? "🔹" : "🎫"} ${type}`,
      exclusiveBadgeClass:
        "text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-500/20",
      equipButtonClass: (isEquipped) =>
        isEquipped
          ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40 active:scale-95"
          : "bg-orange-500 text-white hover:bg-orange-600 active:scale-95 shadow-sm",
      equipButtonText: (isEquipped) => (isEquipped ? "Unequip" : "Equip"),
    },
    dark: {
      headerBorderClass: "border-gray-800",
      title: "Inventory",
      titleClass: "text-white",
      itemIndexButtonClass: "bg-indigo-600 hover:bg-indigo-500 text-white",
      filterContainerClass: "bg-gray-900/60 border-gray-800",
      filterActiveClass:
        "bg-indigo-600 text-white shadow-md border border-indigo-500",
      filterInactiveClass: "text-gray-400 hover:text-white",
      emptyStateClass: "text-gray-400 bg-gray-50 border-gray-300",
      emptyStateText: "Inventory kamu masih kosong. Yuk pull banner gacha! 🎰",
      categoryCardClass: "bg-gray-900/40 border-gray-800/80",
      categoryLabelClass: "text-indigo-400 border-indigo-500",
      itemNameClass: "",
      itemCardClass:
        "bg-gray-800/80 border-gray-700/50 text-white hover:border-gray-600",
      rankBadgeClass: (rank) =>
        rank === "SSR"
          ? "text-yellow-400 bg-yellow-400/10 border-yellow-500/20"
          : rank === "SR"
            ? "text-purple-400 bg-purple-400/10 border-purple-500/20"
            : "text-green-400 bg-green-400/10 border-green-500/20",
      bannerBadgeClass: (type) =>
        type === "LIMITED"
          ? "text-blue-400 bg-blue-400/10 border-blue-500/20"
          : "text-orange-400 bg-orange-400/10 border-orange-500/30",
      bannerBadgeText: (type) => `${type === "LIMITED" ? "🔹" : "🎫"} ${type}`,
      exclusiveBadgeClass:
        "text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-500/20",
      equipButtonClass: (isEquipped) =>
        isEquipped
          ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40 active:scale-95"
          : "bg-blue-600 text-white hover:bg-blue-500 active:scale-95 shadow-sm",
      equipButtonText: (isEquipped) => (isEquipped ? "Unequip" : "Equip"),
    },
    // ─────────────────────────────────────────────────────
    // DEFAULT - mengikuti visual LeaderboardSection (hijau)
    // ganti key ini jadi "wireframe" (dan bikin key baru
    // "light" terpisah) kalau nanti mau pisah 2 varian
    // ─────────────────────────────────────────────────────
    light: {
      headerBorderClass: "border-gray-300",
      title: "Inventory",
      titleClass: "text-gray-900",
      itemIndexButtonClass:
        "bg-[#51b330] text-white hover:bg-[#409228] active:scale-95 shadow-sm",
      filterContainerClass: "bg-gray-100 border border-gray-200",
      filterActiveClass: "bg-[#51b330] text-white shadow-sm",
      filterInactiveClass: "text-gray-500 hover:text-gray-900",
      emptyStateClass: "text-gray-400 bg-gray-50 border-gray-300",
      emptyStateText: "Inventory kamu masih kosong. Yuk pull banner gacha! 🎰",
      categoryCardClass: "bg-white border-gray-200 shadow-sm",
      categoryLabelClass: "text-gray-500 border-[#51b330]",
      itemNameClass: "text-gray-900",
      itemCardClass:
        "bg-white border-gray-200 text-gray-900 hover:border-[#51b330] hover:bg-green-50/50",
      rankBadgeClass: (rank) =>
        rank === "SSR"
          ? "text-[#1e720f] bg-green-50 border-green-200"
          : rank === "SR"
            ? "text-purple-600 bg-purple-50 border-purple-200"
            : "text-gray-600 bg-gray-50 border-gray-200",
      bannerBadgeClass: (type) =>
        type === "LIMITED"
          ? "text-blue-600 bg-blue-50 border-blue-200"
          : "text-orange-600 bg-orange-50 border-orange-200",
      bannerBadgeText: (type) => `${type === "LIMITED" ? "🔹" : "🎫"} ${type}`,
      exclusiveBadgeClass: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200",
      equipButtonClass: (isEquipped) =>
        isEquipped
          ? "bg-white text-red-600 border border-red-200 hover:bg-red-50 active:scale-95"
          : "bg-[#51b330] text-white hover:bg-[#409228] active:scale-95 shadow-sm",
      equipButtonText: (isEquipped) => (isEquipped ? "Unequip" : "Equip"),
    },
  };

  const getTheme = () => {
    if (isMatrixMode) return themeConfig.matrix;
    if (isAuroraMode) return themeConfig.aurora;
    if (isStarforgeMode) return themeConfig.starforge;
    if (isNotepadMode) return themeConfig.notepad;
    if (isDarkMode) return themeConfig.dark;
    return themeConfig.light;
  };

  const theme = getTheme();

  return (
    <div className="w-full mt-8">
      {/* HEADER & FILTER ROW */}
      <div
        className={`w-full min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b ${theme.headerBorderClass}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <h2
            className={`text-xl font-bold tracking-wide truncate ${theme.titleClass}`}
          >
            {theme.title} ({userInventory.length})
          </h2>
          <button
            type="button"
            onClick={() => setShowItemIndex(true)}
            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all shadow-md flex items-center gap-1 active:scale-95 whitespace-nowrap shrink-0 ${theme.itemIndexButtonClass}`}
          >
            Item Index
          </button>
        </div>

        <div
          className={`flex gap-1 p-1 rounded-lg self-start sm:self-auto ${theme.filterContainerClass}`}
        >
          {["ALL", "R", "SR", "SSR"].map((rarity) => (
            <button
              key={`header-${rarity}`}
              type="button"
              onClick={() => setSelectedRarityFilter(rarity)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap shrink-0 ${
                selectedRarityFilter === rarity
                  ? theme.filterActiveClass
                  : theme.filterInactiveClass
              }`}
            >
              {rarity}
            </button>
          ))}
        </div>
      </div>

      {/* MASTER INVENTORY LIST */}
      <div className="w-full space-y-6">
        {userInventory.length === 0 ? (
          <p
            className={`italic text-center py-8 rounded-lg border ${theme.emptyStateClass}`}
          >
            {theme.emptyStateText}
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
                <p className="italic text-center py-6 text-gray-400">
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
                  className={`p-5 rounded-lg border text-left ${theme.categoryCardClass}`}
                >
                  <h4
                    className={`text-xs font-black uppercase tracking-widest mb-4 border-l-4 pl-2 ${theme.categoryLabelClass}`}
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

                      const BANNER_TYPE = {
                        ssr_matrix: "LIMITED",
                        ssr_starforge: "STANDARD",
                        ssr_notepad: "STANDARD",
                        shop_crown: "LIMITED",
                      };

                      const rank =
                        SPECIAL_RARITY[itemId] ||
                        (itemId.startsWith("ssr_")
                          ? "SSR"
                          : itemId.startsWith("sr_")
                            ? "SR"
                            : "R");

                      const bannerType = BANNER_TYPE[itemId];
                      const isExclusive =
                        itemId === "shop_aurora" || itemId === "shop_crown";

                      return (
                        <div
                          key={itemId}
                          className={`p-4 rounded-lg flex justify-between items-center shadow-sm border transition-all ${theme.itemCardClass}`}
                        >
                          <div className="flex flex-col items-start">
                            <span
                              className={`text-sm font-semibold tracking-wide text-left ${theme.itemNameClass}`}
                            >
                              {cleanName}
                            </span>

                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded border ${theme.rankBadgeClass(rank)}`}
                              >
                                {rank} RANK
                              </span>

                              {bannerType && (
                                <span
                                  className={`text-[9px] font-black px-2 py-0.5 rounded border transition-all ${theme.bannerBadgeClass(bannerType)}`}
                                >
                                  {theme.bannerBadgeText(bannerType)}
                                </span>
                              )}

                              {isExclusive && (
                                <span
                                  className={`text-[9px] font-black px-2 py-0.5 rounded border ${theme.exclusiveBadgeClass}`}
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
                            className={`text-xs px-4 py-2 font-bold rounded-md transition-all ${theme.equipButtonClass(isEquipped)}`}
                          >
                            {theme.equipButtonText(isEquipped)}
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
