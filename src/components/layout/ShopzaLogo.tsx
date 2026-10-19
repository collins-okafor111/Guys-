import React from "react";

interface ShopzaLogoProps {
  variant?: "full" | "compact" | "icon" | "hero";
  className?: string;
  onClick?: () => void;
}

export const ShopzaLogo: React.FC<ShopzaLogoProps> = ({
  variant = "full",
  className = "",
  onClick,
}) => {
  // Pure vector SVG faithfully replicating the official Shopza logo:
  // - 3D angled blue-purple shopping bag with handle
  // - Motion speed streaks on left
  // - Cart wheels at bottom
  // - Clean origami folded 'S' ribbon in center
  const renderIcon = (size: number = 40) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0 drop-shadow-[0_4px_12px_rgba(0,102,255,0.35)]"
    >
      <defs>
        {/* Main bag gradient */}
        <linearGradient id="shopzaBagGrad" x1="20" y1="20" x2="140" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#007DFE" />
          <stop offset="45%" stopColor="#0066FF" />
          <stop offset="85%" stopColor="#5E17EB" />
          <stop offset="100%" stopColor="#7928CA" />
        </linearGradient>

        {/* Bag side depth shadow */}
        <linearGradient id="shopzaDepthGrad" x1="100" y1="40" x2="140" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#311075" />
        </linearGradient>

        {/* Speed streak cyan-blue */}
        <linearGradient id="shopzaStreak1" x1="10" y1="0" x2="60" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00C2FF" />
          <stop offset="100%" stopColor="#0066FF" />
        </linearGradient>

        {/* Speed streak purple */}
        <linearGradient id="shopzaStreak2" x1="20" y1="0" x2="60" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0066FF" />
          <stop offset="100%" stopColor="#7928CA" />
        </linearGradient>

        {/* Ribbon S shadow */}
        <linearGradient id="sRibbonGrad1" x1="60" y1="45" x2="105" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id="sRibbonGrad2" x1="75" y1="65" x2="95" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>

      {/* Speed Lines on the left */}
      <rect x="18" y="52" width="28" height="6.5" rx="3.25" fill="url(#shopzaStreak1)" />
      <rect x="24" y="64" width="22" height="6.5" rx="3.25" fill="url(#shopzaStreak2)" />
      <rect x="15" y="76" width="30" height="6.5" rx="3.25" fill="url(#shopzaStreak1)" />

      {/* Bag Handle */}
      <path
        d="M62 48 V34 C62 20 98 20 98 34 V48"
        stroke="#0066FF"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bag 3D Right Side Flap for Perspective Depth */}
      <path
        d="M108 48 L122 52 L116 114 L98 120 Z"
        fill="url(#shopzaDepthGrad)"
      />

      {/* Main Bag Body */}
      <path
        d="M56 46 H112 L102 118 H46 Z"
        fill="url(#shopzaBagGrad)"
      />

      {/* Shopping Cart Shelf Runner below bag */}
      <rect x="42" y="117" width="68" height="7.5" rx="3.75" fill="#0066FF" />

      {/* Cart Wheels */}
      <circle cx="56" cy="133" r="7" fill="#0B0F19" stroke="#1E293B" strokeWidth="2" />
      <circle cx="94" cy="133" r="7" fill="#0B0F19" stroke="#1E293B" strokeWidth="2" />
      <circle cx="56" cy="133" r="2.5" fill="#64748B" />
      <circle cx="94" cy="133" r="2.5" fill="#64748B" />

      {/* 3D Folded White Ribbon "S" */}
      {/* Top curve */}
      <path
        d="M93 59 C93 59 78 54 69 61 C61 68 64 78 77 82 L86 85 C97 89 97 99 90 104 C82 109 67 106 63 99"
        fill="none"
        stroke="url(#sRibbonGrad1)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ribbon inner fold highlight */}
      <path
        d="M74 74 C78 75 84 78 87 81 C90 84 91 88 90 92"
        fill="none"
        stroke="url(#sRibbonGrad2)"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );

  if (variant === "icon") {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center ${onClick ? "cursor-pointer" : ""} ${className}`}
      >
        {renderIcon(40)}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2.5 ${onClick ? "cursor-pointer select-none" : ""} ${className}`}
      >
        {renderIcon(36)}
        <div className="flex flex-col">
          <div className="text-xl font-black tracking-tight leading-none text-white flex items-center">
            <span>Shop</span>
            <span className="bg-gradient-to-r from-[#0066FF] to-[#7928CA] bg-clip-text text-transparent">
              za
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div
        onClick={onClick}
        className={`flex flex-col items-center text-center ${onClick ? "cursor-pointer select-none" : ""} ${className}`}
      >
        {renderIcon(84)}
        <div className="mt-3 text-4xl sm:text-5xl font-black tracking-tight leading-none text-white flex items-center justify-center">
          <span>Shop</span>
          <span className="bg-gradient-to-r from-[#0066FF] via-[#4F46E5] to-[#7928CA] bg-clip-text text-transparent">
            za
          </span>
        </div>
        <p className="mt-2 text-xs sm:text-sm font-semibold tracking-wider text-slate-300 uppercase">
          Shop Smarter, Live Better
        </p>
      </div>
    );
  }

  // Default "full" variant (as shown on the logo asset)
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 ${onClick ? "cursor-pointer select-none" : ""} ${className}`}
    >
      {renderIcon(42)}
      <div className="flex flex-col justify-center">
        <div className="text-2xl font-black tracking-tight leading-none text-white flex items-center">
          <span>Shop</span>
          <span className="bg-gradient-to-r from-[#0066FF] via-[#4F46E5] to-[#7928CA] bg-clip-text text-transparent">
            za
          </span>
        </div>
        <span className="text-[9.5px] font-semibold tracking-wider text-slate-400 mt-1 uppercase whitespace-nowrap">
          Shop Smarter, Live Better
        </span>
      </div>
    </div>
  );
};
