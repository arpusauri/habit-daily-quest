import React, { useState } from "react";

const RARITY_STYLE = {
  R: { badge: "bg-sky-100 text-sky-700", accent: "border-sky-400" },
  SR: { badge: "bg-purple-100 text-purple-700", accent: "border-purple-400" },
  SSR: { badge: "bg-amber-100 text-amber-700", accent: "border-amber-400" },
};

const ITEM_NAME_MAP = {
  r_blue: "Cyan Border",
  r_pink: "Pink Text Font",
  sr_dark: "Obsidian Dark Theme",
  sr_gold: "Golden Name Tag",
  ssr_matrix: "Animated Cyberpunk Matrix",
  shop_aurora: "Aurora Dream Theme",
  shop_crown: "Diamond Crown Tag",
  ssr_starforge: "Starforge Celestial Theme",
  ssr_notepad: "Notepad Theme",
};

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

const CATEGORIES = [
  {
    id: "THEMES",
    label: "Themes",
    itemIds: [
      "sr_dark",
      "ssr_matrix",
      "shop_aurora",
      "ssr_starforge",
      "ssr_notepad",
    ],
  },
  { id: "BORDERS", label: "Borders", itemIds: ["r_blue"] },
  {
    id: "TITLES",
    label: "Titles & Fonts",
    itemIds: ["r_pink", "sr_gold", "shop_crown"],
  },
];

const Inventory = ({ userData, equipItem, unequipItem, setShowItemIndex }) => {
  const [activeTab, setActiveTab] = useState("THEMES");
  const [selectedRarities, setSelectedRarities] = useState(["All"]);
  const [searchQuery, setSearchQuery] = useState("");

  if (!userData) return null;

  const userInventory = Array.isArray(userData.inventory)
    ? userData.inventory
    : [];

  const handleToggleRarity = (rarity) => {
    if (rarity === "All") {
      setSelectedRarities(selectedRarities.includes("All") ? [] : ["All"]);
      return;
    }
    let updated = selectedRarities.filter((r) => r !== "All");
    updated = updated.includes(rarity)
      ? updated.filter((r) => r !== rarity)
      : [...updated, rarity];
    setSelectedRarities(updated);
  };

  const getRank = (itemId) =>
    SPECIAL_RARITY[itemId] ||
    (itemId.startsWith("ssr_") ? "SSR" : itemId.startsWith("sr_") ? "SR" : "R");

  const matchesRarity = (itemId) => {
    if (selectedRarities.includes("All") || selectedRarities.length === 0)
      return true;
    return selectedRarities.includes(getRank(itemId));
  };

  const matchesSearch = (itemId) => {
    if (!searchQuery.trim()) return true;
    const name = ITEM_NAME_MAP[itemId] || itemId;
    return name.toLowerCase().includes(searchQuery.trim().toLowerCase());
  };

  const activeCategory = CATEGORIES.find((c) => c.id === activeTab);
  const visibleItems = userInventory.filter(
    (itemId) =>
      activeCategory.itemIds.includes(itemId) &&
      matchesRarity(itemId) &&
      matchesSearch(itemId),
  );

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="flex flex-1 bg-white">
        {/* ── SIDEBAR ── */}
        <aside className="w-64 shrink-0 border-r border-gray-200 bg-gray-50 p-4 hidden sm:block">
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-[#1e720f]/30 rounded-sm px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#053b05] focus:border-[#1e720f] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>

          <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">
            Rarity
          </p>
          <div className="space-y-1">
            {["All", "R", "SR", "SSR"].map((rarity) => {
              const isSelected = selectedRarities.includes(rarity);
              return (
                <button
                  key={rarity}
                  type="button"
                  onClick={() => handleToggleRarity(rarity)}
                  className="flex items-center gap-2.5 w-full cursor-pointer text-left py-1 group"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-[#1e720f] border-[#1e720f] text-white"
                        : "bg-white border-gray-300 group-hover:border-gray-400"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      isSelected
                        ? "font-bold text-gray-900"
                        : "font-medium text-gray-600 group-hover:text-gray-900"
                    }`}
                  >
                    {rarity === "All" ? "All" : `Rarity ${rarity}`}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── CONTENT ── */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Top Bar: Title */}
          <div className="border-b border-gray-200 px-6 pt-4 bg-gray-50/50">
            <h2 className="text-xl font-black text-gray-900 mb-3">
              Inventory ({userInventory.length})
            </h2>

            {/* Tabs + Item Index */}
            <div className="flex items-end justify-between gap-4">
              <div className="flex overflow-x-auto gap-6 -mb-[1px]">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveTab(cat.id)}
                    className={`pb-3 text-sm font-bold whitespace-nowrap cursor-pointer transition-all border-b-4 ${
                      activeTab === cat.id
                        ? "border-[#1e720f] text-[#1e720f]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowItemIndex(true)}
                className="shrink-0 mb-2 text-xs px-3 py-1.5 rounded-md font-bold bg-[#51b330] text-white hover:bg-[#409228] cursor-pointer transition-all"
              >
                Item Index
              </button>
            </div>
          </div>

          {/* Mobile Search + Rarity Filter */}
          <div className="sm:hidden px-6 pt-4">
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#053b05] focus:border-[#1e720f]"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {["All", "R", "SR", "SSR"].map((rarity) => {
                const isSelected = selectedRarities.includes(rarity);
                return (
                  <button
                    key={rarity}
                    type="button"
                    onClick={() => handleToggleRarity(rarity)}
                    className={`shrink-0 px-3 py-1.5 text-xs font-black rounded-md transition-all ${
                      isSelected
                        ? "bg-[#1e720f] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {rarity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Item Grid */}
          <div className="p-6 flex-1">
            {visibleItems.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-gray-200">
                {searchQuery
                  ? `Item "${searchQuery}" not found.`
                  : "No items found in this category."}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {visibleItems.map((itemId) => {
                  const rank = getRank(itemId);
                  const style = RARITY_STYLE[rank];
                  const bannerType = BANNER_TYPE[itemId];
                  const isExclusive =
                    itemId === "shop_aurora" || itemId === "shop_crown";
                  const isEquipped =
                    userData.equipped_border === itemId ||
                    userData.equipped_font === itemId ||
                    userData.equipped_theme === itemId;

                  return (
                    <div
                      key={itemId}
                      className={`bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col relative overflow-hidden transition-all hover:shadow-md border-t-4 ${style.accent}`}
                    >
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black ${style.badge}`}
                        >
                          {rank[0]}
                        </span>
                      </div>
                      {isEquipped && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#51b330]" />
                      )}

                      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-8 text-center">
                        <h4 className="font-bold text-xs text-gray-800 mb-1.5">
                          {ITEM_NAME_MAP[itemId] || itemId}
                        </h4>
                        <div className="flex flex-wrap justify-center gap-1">
                          {bannerType && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                              {bannerType}
                            </span>
                          )}
                          {isExclusive && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-fuchsia-50 text-fuchsia-600">
                              Exclusive
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          isEquipped ? unequipItem(itemId) : equipItem(itemId)
                        }
                        className={`w-full border-t py-2.5 text-xs font-black cursor-pointer transition-colors ${
                          isEquipped
                            ? "bg-white border-gray-200 text-red-600 hover:bg-red-50"
                            : "bg-[#51b330] border-[#51b330] text-white hover:bg-[#409228]"
                        }`}
                      >
                        {isEquipped ? "Unequip" : "Equip"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
