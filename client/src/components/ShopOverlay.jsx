import React from "react";

function ShopOverlay({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-6 text-white shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Header Shop */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛍️</span>
            <div>
              <h2 className="text-xl font-black text-emerald-400 tracking-wide">
                ITEM & GEMS SHOP
              </h2>
              <p className="text-xs text-gray-400">
                Beli booster, gems, dan tiket gacha tambahan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white font-bold text-xl p-2 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Item List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-y-auto pr-1 flex-1">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col items-center text-center justify-between hover:border-yellow-500/50 transition-all">
            <div className="text-4xl my-2">💎</div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">
                Small Gem Pouch
              </h4>
              <p className="text-xs text-yellow-400 font-extrabold mt-1">
                +100 Gems
              </p>
            </div>
            <button className="mt-4 px-4 py-2 bg-yellow-400 text-black text-xs font-black rounded-lg hover:bg-yellow-300 w-full">
              Rp 15.000
            </button>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col items-center text-center justify-between hover:border-purple-500/50 transition-all">
            <div className="text-4xl my-2">⚡</div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">
                EXP Booster (24h)
              </h4>
              <p className="text-xs text-purple-400 font-extrabold mt-1">
                Double EXP Quest
              </p>
            </div>
            <button className="mt-4 px-4 py-2 bg-purple-600 text-white text-xs font-black rounded-lg hover:bg-purple-500 w-full">
              50 Gems
            </button>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col items-center text-center justify-between hover:border-emerald-500/50 transition-all">
            <div className="text-4xl my-2">🎟️</div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Gacha Ticket</h4>
              <p className="text-xs text-emerald-400 font-extrabold mt-1">
                1x Free Pull
              </p>
            </div>
            <button className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-black rounded-lg hover:bg-emerald-500 w-full">
              30 Gems
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-center text-xs text-gray-500">
          ⚠️ Fitur transaksi masih dalam mode demonstrasi.
        </div>
      </div>
    </div>
  );
}

export default ShopOverlay;
