import React, { useState, useEffect } from "react";

const HARD_PITY = 20;

function BannerOverlay({
  isOpen,
  onClose,
  rollGacha,
  isRolling,
  userData,
  apiUrl,
}) {
  const [activeBanner, setActiveBanner] = useState("standard"); // 'standard' | 'limited'
  const [bannerStatus, setBannerStatus] = useState({
    isActive: false,
    daysRemaining: 0,
    hoursRemaining: 0,
  });
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchBannerStatus = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/banner/limited-status`);
        const data = await res.json();

        if (data.isActive) {
          setBannerStatus({ ...data.currentBanner, isActive: true });
        } else {
          setBannerStatus({ isActive: false });
          setActiveBanner("standard");

          if (data.nextBanner) {
            alert(
              `Limited banner berakhir.\nBanner berikutnya: ${data.nextBanner.name}`,
            );
          }
        }
      } catch (err) {
        console.error("Error fetching banner status:", err);
      } finally {
        setLoadingStatus(false);
      }
    };

    fetchBannerStatus();
    const interval = setInterval(fetchBannerStatus, 60000);
    return () => clearInterval(interval);
  }, [isOpen, apiUrl]);

  if (!isOpen) return null;

  const standardPity = userData?.standard_pity || 0;
  const limitedPity = userData?.limited_pity || 0;
  const limitedGuaranteed = userData?.limited_guaranteed || false;

  const handlePull = () => {
    if (activeBanner === "limited" && !bannerStatus.isActive) {
      alert("Limited Banner sudah berakhir!");
      setActiveBanner("standard");
      return;
    }

    rollGacha({
      endpoint: "/api/gacha/pull",
      bannerType: activeBanner,
      body: { bannerType: activeBanner },
    });
  };

  const PityBar = ({ pity, color }) => (
    <div className="w-full max-w-xs mx-auto mb-4">
      <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-bold">
        <span>PITY</span>
        <span>
          {pity} / {HARD_PITY}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min((pity / HARD_PITY) * 100, 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-gray-200 w-full max-w-2xl rounded-lg text-gray-900 shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-black text-[#1e720f] tracking-wide">
                GACHA BANNERS
              </h2>
              <p className="text-xs text-gray-500">
                Choose your banner and pull for cosmetic items!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 font-bold text-xl p-2 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Body: Tab kiri + Preview kanan */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tab - Kiri */}
          <div className="w-32 sm:w-36 shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col p-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveBanner("standard")}
              className={`flex flex-col items-center gap-1 py-4 px-2 text-xs font-black rounded-md transition-all ${
                activeBanner === "standard"
                  ? "bg-[#51b330] text-white shadow-md"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white"
              }`}
            >
              STANDARD
            </button>

            <button
              type="button"
              onClick={() =>
                bannerStatus.isActive && setActiveBanner("limited")
              }
              disabled={!bannerStatus.isActive}
              className={`relative flex flex-col items-center gap-1 py-4 px-2 text-xs font-black rounded-md transition-all ${
                activeBanner === "limited"
                  ? "bg-amber-400 text-black shadow-md"
                  : bannerStatus.isActive
                    ? "text-gray-500 hover:text-gray-900 hover:bg-white"
                    : "text-gray-300 cursor-not-allowed opacity-60"
              }`}
            >
              LIMITED
              {bannerStatus.isActive && limitedGuaranteed && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[7px] px-1.5 py-0.5 rounded-full font-black">
                  GUARANTEED
                </span>
              )}
              {!bannerStatus.isActive && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[7px] px-1.5 py-0.5 rounded-full font-black">
                  ENDED
                </span>
              )}
            </button>
          </div>

          {/* Preview Banner - Kanan, full lebar */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center">
            {activeBanner === "standard" ? (
              <div className="bg-gradient-to-br from-green-50 via-white to-white p-8 rounded-md border border-[#51b330]/30 text-center shadow-sm">
                <span className="inline-block px-3 py-1 bg-[#51b330]/10 border border-[#51b330]/30 text-[#1e720f] text-[10px] font-black rounded-full mb-3">
                  PERMANENT POOL
                </span>
                <h3 className="text-3xl font-black text-[#1e720f] mb-2">
                  STANDARD BANNER
                </h3>
                <p className="text-xs text-gray-600 mb-5 max-w-sm mx-auto">
                  Echoes That Remain!
                </p>

                <PityBar pity={standardPity} color="bg-[#51b330]" />

                <button
                  type="button"
                  onClick={handlePull}
                  disabled={isRolling}
                  className="px-8 py-3 text-sm font-black bg-[#51b330] text-white rounded-xl hover:bg-[#409228] transition-all transform hover:scale-105 shadow-[0_4px_20px_rgba(81,179,48,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pull 1x (50 Gems)
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-amber-50 via-white to-white p-8 rounded-md border border-amber-300 text-center shadow-sm relative">
                {/* MINI COUNTDOWN / ENDED BADGE — pojok kanan atas */}
                {!loadingStatus && bannerStatus.isActive && (
                  <span className="absolute top-3 right-3 px-2 py-1 bg-amber-100 border border-amber-300 text-amber-700 text-[9px] font-black rounded-full whitespace-nowrap">
                    {bannerStatus.daysRemaining}d {bannerStatus.hoursRemaining}h
                  </span>
                )}
                {!loadingStatus && !bannerStatus.isActive && (
                  <span className="absolute top-3 right-3 px-2 py-1 bg-red-50 border border-red-300 text-red-600 text-[9px] font-black rounded-full whitespace-nowrap">
                    BANNER ENDED
                  </span>
                )}

                <span className="inline-block px-3 py-1 bg-amber-400/10 border border-amber-400/40 text-amber-600 text-[10px] font-black rounded-full mb-3">
                  RATE UP CYBERPUNK MATRIX
                </span>
                <h3 className="text-3xl font-black text-amber-600 mb-2">
                  LIMITED BANNER
                </h3>
                <p className="text-xs text-gray-600 mb-5 max-w-sm mx-auto">
                  Fractured Reality!
                </p>

                <PityBar pity={limitedPity} color="bg-amber-400" />

                <button
                  type="button"
                  onClick={handlePull}
                  disabled={isRolling || !bannerStatus.isActive}
                  className="px-8 py-3 text-sm font-black bg-amber-400 text-black rounded-xl hover:bg-amber-300 transition-all transform hover:scale-105 shadow-[0_4px_20px_rgba(251,191,36,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pull 1x (50 Gems)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BannerOverlay;
