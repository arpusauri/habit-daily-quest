import React, { useState } from "react";

const MASTER_ITEMS = [
  {
    id: "r_blue",
    name: "Cyan Border",
    rarity: "R",
    category: "BORDERS",
    desc: "Border warna cyan yang elegan.",
  },
  {
    id: "r_pink",
    name: "Pink Text Font",
    rarity: "R",
    category: "TITLES",
    desc: "Font dengan warna pink ceria.",
  },
  {
    id: "sr_dark",
    name: "Obsidian Dark Theme",
    rarity: "SR",
    category: "THEMES",
    desc: "Tema gelap yang misterius.",
  },
  {
    id: "sr_gold",
    name: "Golden Name Tag",
    rarity: "SR",
    category: "TITLES",
    desc: "Nametag emas berkilau sultan.",
  },
  {
    id: "ssr_matrix",
    name: "Animated Cyberpunk Matrix",
    rarity: "SSR",
    category: "THEMES",
    limited: true,
    desc: "Animasi hujan kode matrix. Eksklusif Limited Banner!",
  },
  {
    id: "ssr_starforge",
    name: "Starforge Celestial Theme",
    rarity: "SSR",
    category: "THEMES",
    desc: "Langit malam berbintang bertabur cahaya emas.",
  },
  {
    id: "shop_aurora",
    name: "Aurora Dream Theme",
    rarity: "SR",
    category: "THEMES",
    shopOnly: true,
    desc: "Cahaya aurora ungu-fuchsia. Eksklusif Shop!",
  },
  {
    id: "shop_crown",
    name: "Diamond Crown Tag",
    rarity: "SSR",
    category: "TITLES",
    shopOnly: true,
    desc: "Nametag gradient shimmer. Eksklusif Shop!",
  },
];

const CATEGORIES = [
  { id: "ALL", label: "✨ Semua" },
  { id: "THEMES", label: "🖼️ Themes" },
  { id: "BORDERS", label: "🔲 Borders" },
  { id: "TITLES", label: "🏷️ Titles & Fonts" },
];

// 1. Tambahkan hirarki/urutan Rarity di sini
const RARITY_ORDER = {
  SSR: 1,
  SR: 2,
  R: 3,
};

const ItemIndex = ({ userData, onClose }) => {
  const [activeCategory, setActiveCategory] = useState("ALL");

  const checkIsOwned = (itemId) => {
    const userInv = Array.isArray(userData?.inventory)
      ? userData.inventory
      : [];
    return userInv.some((item) => item === itemId || item?.id === itemId);
  };

  const ownedCount = MASTER_ITEMS.filter((i) => checkIsOwned(i.id)).length;

  // 2. Filter item lalu urutkan berdasarkan RARITY_ORDER (SSR -> SR -> R)
  const filteredItems =
    activeCategory === "ALL"
      ? MASTER_ITEMS
      : MASTER_ITEMS.filter((i) => i.category === activeCategory);

  const visibleItems = [...filteredItems].sort(
    (a, b) => (RARITY_ORDER[a.rarity] || 99) - (RARITY_ORDER[b.rarity] || 99),
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
          <div>
            <h2 className="text-xl font-black text-amber-400 tracking-wider flex items-center gap-2">
              📚 ITEM COLLECTION INDEX
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {ownedCount} / {MASTER_ITEMS.length} Unlocked
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-bold p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Kategori */}
        <div className="flex gap-1 p-2 border-b border-slate-800 bg-slate-950/40 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* List Items Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleItems.map((item) => {
            const isOwned = checkIsOwned(item.id);

            const rarityColors = {
              SSR: isOwned
                ? "text-yellow-400 border-yellow-500/50 bg-yellow-500/10"
                : "",
              SR: isOwned
                ? "text-purple-400 border-purple-500/50 bg-purple-500/10"
                : "",
              R: isOwned
                ? "text-blue-400 border-blue-500/50 bg-blue-500/10"
                : "",
            };

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border-2 flex flex-col gap-2 transition-all ${
                  isOwned
                    ? rarityColors[item.rarity]
                    : "bg-slate-800/40 border-slate-700/60 grayscale opacity-60"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded ${
                        isOwned
                          ? "bg-slate-950 shadow-sm"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {item.rarity}
                    </span>
                    {item.limited && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                        LIMITED
                      </span>
                    )}
                    {item.shopOnly && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30">
                        SHOP EXCLUSIVE
                      </span>
                    )}
                  </div>
                  {!isOwned ? (
                    <span className="text-slate-500 text-xs font-semibold shrink-0">
                      🔒 Locked
                    </span>
                  ) : (
                    <span className="text-emerald-400 text-xs font-semibold shrink-0">
                      ✔️ Owned
                    </span>
                  )}
                </div>

                <h3
                  className={`font-bold text-sm ${isOwned ? "text-white" : "text-slate-400"}`}
                >
                  {isOwned ? item.name : "???"}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {isOwned
                    ? item.desc
                    : item.shopOnly
                      ? "Dapatkan item ini dari Shop menggunakan Shards."
                      : item.limited
                        ? "Dapatkan item ini dari Limited Banner."
                        : "Dapatkan item ini dari gacha banner untuk membuka koleksi."}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ItemIndex;
