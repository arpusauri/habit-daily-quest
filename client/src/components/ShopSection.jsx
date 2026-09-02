import React, { useEffect, useState } from "react";

const RARITY_STYLE = {
  R: {
    border: "hover:border-sky-400",
    badge: "bg-sky-50 text-sky-600 border border-sky-200",
    btn: "bg-sky-600 hover:bg-sky-500 text-white",
  },
  SR: {
    border: "hover:border-purple-400",
    badge: "bg-purple-50 text-purple-600 border border-purple-200",
    btn: "bg-purple-600 hover:bg-purple-500 text-white",
  },
  SSR: {
    border: "hover:border-amber-400",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    btn: "bg-amber-500 hover:bg-amber-400 text-black",
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

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-end justify-between mt-8 mb-4 border-b border-gray-300 pb-2">
        <h2 className="text-2xl font-black text-gray-900">🛍️ Shop</h2>

        {/* Shards Balance */}
        <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 mb-0.5">
          <span className="text-xs">💠</span>
          <span className="font-black text-xs text-cyan-700">{shards}</span>
          {shieldOwned > 0 && (
            <span className="flex items-center gap-0.5 pl-1.5 ml-0.5 border-l border-gray-300 text-cyan-700 text-[10px] font-bold">
              🛡️ {shieldOwned}
            </span>
          )}
        </div>
      </div>

      {/* Background Container */}
      <div className="bg-white border border-gray-200 p-6 shadow-sm">
        <p className="text-xs text-gray-500 mb-4">
          Tukar Shards hasil duplicate gacha
        </p>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("cosmetics")}
            className={`flex-1 py-2.5 text-xs font-black rounded-md transition-all ${
              activeTab === "cosmetics"
                ? "bg-[#51b330] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Cosmetics
          </button>
          <button
            onClick={() => setActiveTab("boosters")}
            className={`flex-1 py-2.5 text-xs font-black rounded-md transition-all ${
              activeTab === "boosters"
                ? "bg-[#51b330] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Boosters
          </button>
        </div>

        {/* TAB: COSMETICS */}
        {activeTab === "cosmetics" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {loading ? (
              <div className="col-span-full text-center text-sm text-gray-500 py-8">
                Loading...
              </div>
            ) : items.length === 0 ? (
              <div className="col-span-full text-center text-sm text-gray-500 py-8">
                🎉 Kamu udah punya semua kosmetik!
              </div>
            ) : (
              items.map((item) => {
                const style = RARITY_STYLE[item.rarity];
                const canAfford = shards >= item.price;
                return (
                  <div
                    key={item.id}
                    className={`bg-white p-2.5 rounded-lg border border-gray-200 flex flex-col items-center text-center justify-between transition-all ${style.border}`}
                  >
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${style.badge}`}
                    >
                      {item.rarity}
                    </span>
                    <div className="text-2xl my-1.5">{ITEM_ICON[item.id]}</div>
                    <h4 className="font-bold text-[11px] leading-tight text-gray-900 line-clamp-2 min-h-[28px] flex items-center">
                      {item.name}
                    </h4>
                    {item.shopOnly && (
                      <span className="text-[8px] text-fuchsia-600 font-bold mt-0.5">
                        ✦ EXCLUSIVE
                      </span>
                    )}
                    <button
                      onClick={() => handleRedeem(item)}
                      disabled={!canAfford || redeeming === item.id}
                      className={`mt-2 px-2 py-1.5 text-[10px] font-black rounded-md w-full transition-all disabled:opacity-40 disabled:cursor-not-allowed ${style.btn}`}
                    >
                      {redeeming === item.id ? "..." : `💠${item.price}`}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB: BOOSTERS */}
        {activeTab === "boosters" && (
          <div className="grid grid-cols-2 gap-3">
            {/* Gacha Ticket */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex flex-col items-center text-center">
              <div className="text-3xl my-1">🎟️</div>
              <h4 className="font-black text-xs text-indigo-700">
                Gacha Ticket
              </h4>
              <p className="text-[10px] text-gray-500 mt-1 mb-2 leading-snug">
                1x pull gratis, gak potong Gems
              </p>
              <button
                onClick={handleBuyTicket}
                disabled={shards < ticketPrice}
                className="w-full mt-auto py-1.5 font-black rounded-md active:scale-95 transition-all text-[10px] bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                💠 {ticketPrice}
              </button>
            </div>

            {/* Streak Shield */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 flex flex-col items-center text-center">
              <div className="text-3xl my-1">🛡️</div>
              <h4 className="font-black text-xs text-cyan-700">
                Streak Shield
              </h4>
              <p className="text-[10px] text-gray-500 mt-1 mb-1 leading-snug">
                Streak gak reset walau kelewat 1 hari
              </p>
              {shieldOwned > 0 && (
                <span className="text-[9px] text-cyan-700 font-bold mb-1">
                  Dimiliki: {shieldOwned}
                </span>
              )}
              <button
                onClick={handleBuyShield}
                disabled={shards < shieldPrice || buyingShield}
                className="w-full mt-auto py-1.5 font-black rounded-md active:scale-95 transition-all text-[10px] bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {buyingShield ? "..." : `💠 ${shieldPrice}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopSection;
