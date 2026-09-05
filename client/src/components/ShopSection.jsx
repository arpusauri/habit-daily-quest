import React, { useEffect, useState } from "react";

import ShardIcon from "../assets/icons/shard.svg?react";

const RARITY_STYLE = {
  R: {
    badge: "bg-sky-100 text-sky-700",
    accent: "border-sky-400",
  },
  SR: {
    badge: "bg-purple-100 text-purple-700",
    accent: "border-purple-400",
  },
  SSR: {
    badge: "bg-amber-100 text-amber-700",
    accent: "border-amber-400",
  },
};

const ITEM_ICON = {
  r_blue: "🔵",
  r_pink: "🌸",
  sr_dark: "🌙",
  sr_gold: "👑",
  ssr_matrix: "👾",
  shop_aurora: "🌌",
  shop_crown: "💎",
};

const ShopSection = ({
  apiUrl,
  authFetch,
  userData,
  onRedeemSuccess,
  onBuyTicket,
}) => {
  const [activeTab, setActiveTab] = useState("cosmetics"); // 'cosmetics' | 'boosters'

  const [selectedRarities, setSelectedRarities] = useState(["All"]);
  const [searchQuery, setSearchQuery] = useState("");

  const [shards, setShards] = useState(0);
  const [items, setItems] = useState([]);
  const [ticketPrice, setTicketPrice] = useState(150);
  const [shieldPrice, setShieldPrice] = useState(200);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [buyingShield, setBuyingShield] = useState(false);

  const shieldOwned = userData?.streak_shield || 0;

  useEffect(() => {
    setLoading(true);
    authFetch(`${apiUrl}/api/shop/items`)
      .then((res) => res.json())
      .then((data) => {
        setShards(data.shards || 0);
        setItems(data.items || []);
        if (data.ticketPrice) setTicketPrice(data.ticketPrice);
        if (data.shieldPrice) setShieldPrice(data.shieldPrice);
      })
      .catch((err) => console.error("Shop fetch error:", err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  const handleToggleRarity = (rarity) => {
    if (rarity === "All") {
      if (selectedRarities.includes("All")) {
        setSelectedRarities([]);
      } else {
        setSelectedRarities(["All"]);
      }
    } else {
      let updated = selectedRarities.filter((r) => r !== "All");

      if (updated.includes(rarity)) {
        updated = updated.filter((r) => r !== rarity);
      } else {
        updated.push(rarity);
      }

      setSelectedRarities(updated);
    }
  };

  const handleRedeem = (item) => {
    setRedeeming(item.id);
    authFetch(`${apiUrl}/api/shop/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setShards((prev) => prev - item.price);
        if (onRedeemSuccess) onRedeemSuccess(data.user);
      })
      .catch((err) => console.error("Redeem error:", err))
      .finally(() => setRedeeming(null));
  };

  const handleBuyShield = () => {
    if (shards < shieldPrice || buyingShield) return;
    setBuyingShield(true);
    authFetch(`${apiUrl}/api/shop/buy-shield`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setShards((prev) => prev - shieldPrice);
        if (onRedeemSuccess) onRedeemSuccess(data.user);
      })
      .catch((err) => console.error("Buy shield error:", err))
      .finally(() => setBuyingShield(false));
  };

  const handleBuyTicket = () => {
    if (shards < ticketPrice) return;
    if (onBuyTicket) onBuyTicket();
  };

  // Filter Cosmetics
  const filteredItems = items.filter((item) => {
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;

    if (selectedRarities.includes("All") || selectedRarities.length === 0) {
      return true;
    }

    return selectedRarities.includes(item.rarity);
  });

  // Data & Filter Boosters / Consumables
  const boosterList = [
    {
      id: "ticket",
      name: "Gacha Ticket",
      icon: "🎟️",
      description: "1x pull gratis tanpa Gems",
      price: ticketPrice,
      priceLabel: ticketPrice,
      borderColor: "border-indigo-400",
      disabled: shards < ticketPrice,
      onClick: handleBuyTicket,
    },
    {
      id: "shield",
      name: "Streak Shield",
      icon: "🛡️",
      description: "Menahan reset 1x miss",
      price: shieldPrice,
      priceLabel: buyingShield ? "..." : shieldPrice,
      borderColor: "border-cyan-400",
      disabled: shards < shieldPrice || buyingShield,
      onClick: handleBuyShield,
    },
  ];

  const filteredBoosters = boosterList.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="flex flex-1 bg-white">
        {/* ── SIDEBAR (DESKTOP) ── */}
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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">
            Filters
          </p>

          {activeTab === "cosmetics" ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-800 mb-2 mt-4">
                Rarity
              </p>
              {["All", "R", "SR", "SSR"].map((rarity) => {
                const isSelected = selectedRarities.includes(rarity);
                return (
                  <button
                    key={rarity}
                    type="button"
                    onClick={() => handleToggleRarity(rarity)}
                    className="flex items-center gap-2.5 w-full text-left py-1 cursor-pointer group"
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
          ) : (
            <p className="text-xs text-gray-400 font-medium">
              Filter not available for this category.
            </p>
          )}
        </aside>

        {/* ── CONTENT ── */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Top Bar: Tabs & Currency */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-200 px-6 pt-4 bg-gray-50/50">
            <div className="flex overflow-x-auto hide-scrollbar gap-6 -mb-[1px]">
              <button
                onClick={() => {
                  setActiveTab("cosmetics");
                  setSelectedRarities(["All"]);
                }}
                className={`pb-3 text-sm font-bold whitespace-nowrap transition-all cursor-pointer border-b-4 ${
                  activeTab === "cosmetics"
                    ? "border-[#1e720f] text-[#1e720f]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Cosmetics
              </button>
              <button
                onClick={() => setActiveTab("boosters")}
                className={`pb-3 text-sm font-bold whitespace-nowrap transition-all cursor-pointer border-b-4 ${
                  activeTab === "boosters"
                    ? "border-[#1e720f] text-[#1e720f]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Consumables
              </button>
            </div>
          </div>

          {/* Item Grid Area */}
          <div className="p-6 overflow-y-auto flex-1">
            {/* MOBILE SEARCH */}
            <div className="relative mb-6 sm:hidden">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#053b05] focus:border-[#1e720f]"
              />
            </div>

            {/* TAB: COSMETICS */}
            {activeTab === "cosmetics" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {loading ? (
                  <div className="col-span-full py-16 text-center text-gray-400 text-sm animate-pulse">
                    Loading items...
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-gray-200">
                    {items.length === 0
                      ? "Thanks for playing! Wait for more items in the future."
                      : "Item not found."}
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const style = RARITY_STYLE[item.rarity];
                    const canAfford = shards >= item.price;
                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col relative overflow-hidden transition-all hover:shadow-md border-t-4 ${style.accent}`}
                      >
                        <div className="absolute top-2 left-2 flex gap-1">
                          <span
                            className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black ${style.badge}`}
                          >
                            {item.rarity[0]}
                          </span>
                        </div>
                        {item.shopOnly && (
                          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-fuchsia-500"></span>
                        )}

                        <div className="flex-1 flex flex-col items-center justify-center p-4 mt-4">
                          <div className="text-4xl mb-3 drop-shadow-sm">
                            {ITEM_ICON[item.id]}
                          </div>
                          <h4 className="font-bold text-xs text-center text-gray-800 line-clamp-1">
                            {item.name}
                          </h4>
                        </div>

                        <button
                          onClick={() => handleRedeem(item)}
                          disabled={!canAfford || redeeming === item.id}
                          className="w-full bg-[#faf8f2] border-t border-[#f0e8d5] py-2.5 flex justify-center items-center gap-1.5 hover:bg-[#f3ead3] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          <ShardIcon className="w-3 h-3 text-white hover:text-gray-300 transition-colors" />
                          <span className="text-xs font-black text-[#a67c41]">
                            {redeeming === item.id ? "..." : item.price}
                          </span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB: BOOSTERS / CONSUMABLES */}
            {activeTab === "boosters" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredBoosters.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-gray-200">
                    Item not found.
                  </div>
                ) : (
                  filteredBoosters.map((booster) => (
                    <div
                      key={booster.id}
                      className={`bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col relative overflow-hidden transition-all hover:shadow-md border-t-4 ${booster.borderColor}`}
                    >
                      <div className="flex-1 flex flex-col items-center justify-center p-4 mt-2">
                        <div className="text-4xl mb-2 drop-shadow-sm">
                          {booster.icon}
                        </div>
                        <h4 className="font-bold text-xs text-center text-gray-800">
                          {booster.name}
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-1 text-center leading-tight">
                          {booster.description}
                        </p>
                      </div>
                      <button
                        onClick={booster.onClick}
                        disabled={booster.disabled}
                        className="w-full bg-[#faf8f2] border-t border-[#f0e8d5] py-2.5 flex justify-center items-center gap-1.5 hover:bg-[#f3ead3] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        <ShardIcon className="w-3 h-3 text-white hover:text-gray-300 transition-colors" />
                        <span className="text-xs font-black text-[#a67c41]">
                          {booster.priceLabel}
                        </span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopSection;
