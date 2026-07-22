import React from "react";

const MASTER_ITEMS = [
  {
    id: "r_blue",
    name: "Cyan Border",
    rarity: "R",
    desc: "Border warna cyan yang elegan.",
  },
  {
    id: "r_pink",
    name: "Pink Text Font",
    rarity: "R",
    desc: "Font dengan warna pink ceria.",
  },
  {
    id: "sr_dark",
    name: "Obsidian Dark Theme",
    rarity: "SR",
    desc: "Tema gelap yang misterius.",
  },
  {
    id: "sr_gold",
    name: "Golden Name Tag",
    rarity: "SR",
    desc: "Nametag emas berkilau sultan.",
  },
  {
    id: "ssr_matrix",
    name: "Animated Cyberpunk Matrix",
    rarity: "SSR",
    desc: "Animasi hujan kode matrix.",
  },
];

const ItemIndex = ({ userData, onClose }) => {
  // Helper aman: Pastikan inventory selalu diperlakukan sebagai Array
  const checkIsOwned = (itemId) => {
    const userInv = Array.isArray(userData?.inventory)
      ? userData.inventory
      : [];
    return userInv.some((item) => item === itemId || item?.id === itemId);
  };

  const ownedCount = MASTER_ITEMS.filter((i) => checkIsOwned(i.id)).length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
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

        {/* List Items Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MASTER_ITEMS.map((item) => {
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
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      isOwned
                        ? "bg-slate-950 shadow-sm"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {item.rarity}
                  </span>
                  {!isOwned ? (
                    <span className="text-slate-500 text-xs font-semibold">
                      🔒 Locked
                    </span>
                  ) : (
                    <span className="text-emerald-400 text-xs font-semibold">
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
