import React from "react";

interface AlWafaLogoProps {
  variant?: "star" | "tower" | "symbol-only" | "avatar" | "app-icon";
  className?: string;
  size?: number | string;
  dark?: boolean;
  showSubtitle?: boolean;
}

export default function AlWafaLogo({
  variant = "tower",
  className = "",
  size,
  dark = true,
  showSubtitle = true,
}: AlWafaLogoProps) {
  
  // ----------------------------------------------------
  // DIAMOND SKYLINE (Representing the signature logo tower)
  // ----------------------------------------------------
  const renderSkylineSvg = (customWidth?: number) => {
    const cols = [
      { height: 1, maxOpacity: 1 },  // ground point
      { height: 10, maxOpacity: 1 }, // Tower 1 tallest (Left)
      { height: 9, maxOpacity: 1 },
      { height: 8, maxOpacity: 0.9 },
      { height: 7, maxOpacity: 0.8 },
      { height: 6, maxOpacity: 0.7 },
      { height: 5, maxOpacity: 0.6 },
      { height: 4, maxOpacity: 0.5 },
      { height: 3, maxOpacity: 0.4 },
      { height: 2, maxOpacity: 0.3 },
      { height: 6, maxOpacity: 1 },  // Tower 2 (Middle)
      { height: 7, maxOpacity: 1 },
      { height: 6, maxOpacity: 0.9 },
      { height: 5, maxOpacity: 0.7 },
      { height: 4, maxOpacity: 0.5 },
      { height: 3, maxOpacity: 0.3 },
      { height: 5, maxOpacity: 1 },  // Tower 3 (Right)
      { height: 6, maxOpacity: 1 },
      { height: 7, maxOpacity: 0.9 },
      { height: 5, maxOpacity: 0.7 },
      { height: 3, maxOpacity: 0.4 },
      { height: 1, maxOpacity: 1 },  // ground point
    ];

    const colWidth = 14;
    const rowHeight = 14;
    const gridWidth = cols.length * colWidth + 20;
    const gridHeight = 12 * rowHeight + 10;

    return (
      <div className="flex flex-col items-center">
        <svg 
          viewBox={`0 0 ${gridWidth} ${gridHeight}`} 
          style={{ width: customWidth || 52, height: "auto" }}
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {cols.map((col, colIdx) => {
            const x = colIdx * colWidth + 10;
            const diamonds = [];
            for (let rowIdx = 0; rowIdx < col.height; rowIdx++) {
              const y = gridHeight - (rowIdx + 1) * rowHeight - 5;
              const isTop = rowIdx >= col.height - 3;
              const dSize = isTop ? 5.5 : 7.5;
              const opacity = isTop 
                ? col.maxOpacity * (1 - (rowIdx - (col.height - 3)) * 0.25)
                : col.maxOpacity;

              const cx = x + colWidth / 2;
              const cy = y + rowHeight / 2;

              diamonds.push(
                <rect
                  key={rowIdx}
                  x={cx - dSize / 2}
                  y={cy - dSize / 2}
                  width={dSize}
                  height={dSize}
                  rx={0.5}
                  transform={`rotate(45 ${cx} ${cy})`}
                  fill="#ED1C24" 
                  opacity={Math.max(opacity, 0.12)}
                />
              );
            }
            return <g key={colIdx}>{diamonds}</g>;
          })}
        </svg>

        {/* Text indicators underneath corresponding to the skyscraper */}
        <div className="flex items-center justify-between gap-2.5 mt-1 border-t border-rose-600/10 pt-0.5 w-[72px] select-none">
          <span className={`text-[8.5px] font-black tracking-tighter ${dark ? "text-slate-350" : "text-slate-700"} font-sans lowercase`}>
            al wafa
          </span>
          <span className={`text-[9.5px] font-extrabold ${dark ? "text-slate-300" : "text-slate-850"} leading-none`} style={{ fontFamily: "serif" }}>
            الوفاء
          </span>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // VARIANT: "app-icon" & "avatar" (The Gorgeous Rounded Square app icon exactly matching uploaded image)
  // ----------------------------------------------------
  if (variant === "app-icon" || variant === "avatar") {
    const numSize = size ? Number(size) : (variant === "avatar" ? 36 : 120);
    return (
      <div 
        className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
        style={{ width: numSize, height: numSize }}
        id={`al-wafa-logo-${variant}`}
      >
        <svg 
          viewBox="0 0 512 512" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_10px_rgba(15,23,42,0.15)]"
        >
          <defs>
            <radialGradient id="bgGlowReact" cx="50%" cy="30%" r="80%" fx="50%" fy="20%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#fafafa" />
              <stop offset="100%" stopColor="#f3f4f6" />
            </radialGradient>
            <linearGradient id="redBaseReact" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#ef1c24" />
            </linearGradient>
            <linearGradient id="diamondGradReact" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef1c24" />
              <stop offset="15%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
            <linearGradient id="redStarGradReact" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF4D4D" />
              <stop offset="100%" stopColor="#B90000" />
            </linearGradient>
          </defs>

          {/* Outer 3D Gloss Red Base Lip */}
          <rect x="20" y="32" width="472" height="460" rx="104" fill="url(#redBaseReact)" />
          {/* White Inner Body Rounded Container */}
          <rect x="20" y="20" width="472" height="452" rx="100" fill="url(#bgGlowReact)" />

          {/* Red Bottom lip bevel shadow effect */}
          <path d="M 20,380 A 100,100 0 0,0 120,472 L 392,472 A 100,100 0 0,0 492,380 L 492,425 A 100,100 0 0,1 392,492 L 120,492 A 100,100 0 0,1 20,425 Z" fill="#9f1239" opacity="0.18" />
          
          {/* Red Accent Rim Reflection Stripe at the bottom edge */}
          <path d="M 40,432 C 80,458 160,468 256,468 C 352,468 432,458 472,432 L 472,438 C 432,468 352,472 256,472 C 160,472 80,468 40,438 Z" fill="#ef1c24" />

          {/* Premium Red Star (Main Emblem) replacing the old skyline */}
          <g>
            {/* 3D shadow offset underneath for a premium debossed feel */}
            <polygon 
              points="256,106 307,211 422,228 339,309 359,423 256,369 153,423 173,309 90,228 205,211" 
              fill="#7a0000" 
              opacity="0.22"
            />
            {/* Real Al Wafa Star (Main 5-pointed Star) */}
            <polygon 
              points="256,100 307,205 422,222 339,303 359,417 256,363 153,417 173,303 90,222 205,205" 
              fill="url(#redStarGradReact)"
            />
          </g>
        </svg>
      </div>
    );
  }

  // ----------------------------------------------------
  // VARIANT: "symbol-only" (Red Star Emblem Icon)
  // ----------------------------------------------------
  if (variant === "symbol-only") {
    return (
      <div 
        className={`relative shrink-0 flex items-center justify-center p-1 bg-rose-500/5 border border-rose-500/20 rounded-xl ${className}`} 
        style={{ width: size || "32px", height: size || "32px" }} 
        id="al-wafa-symbol-only"
      >
        <svg viewBox="0 0 100 100" className="w-5 h-5">
          <polygon
            points="50,5 64,36 98,36 71,57 81,91 50,70 19,91 29,57 2,36 36,36"
            fill="#ED1C24"
          />
        </svg>
      </div>
    );
  }

  // ----------------------------------------------------
  // DEFAULT VARIANT: COMBINATION LOGO (Halftone Skyline + Calligraphy + Underlines + Subtitle)
  // ----------------------------------------------------
  // This will render the complete corporate identity exactly matching the user's uploaded banner
  // If variant equals "star" or "tower" it renders the corresponding emblem on the left.
  const isStarCombo = variant === "star";
  const numSize = size ? Number(size) : 32;

  // Render the left emblem as our premium 3D rounded square app-icon
  const renderLeftEmblem = () => {
    if (isStarCombo) {
      return (
        <div style={{ width: numSize ? `${numSize * 1.5}px` : "48px" }} className="flex justify-center select-none shrink-0">
          <svg 
            viewBox="0 0 512 512" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 drop-shadow-[0_2px_5px_rgba(15,23,42,0.15)] overflow-visible"
          >
            <defs>
              <linearGradient id="redStarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF4D4D" />
                <stop offset="100%" stopColor="#B90000" />
              </linearGradient>
            </defs>
            <g>
              {/* 3D shadow offset underneath for a premium debossed feel */}
              <polygon 
                points="256,81 307,186 422,203 339,284 359,398 256,344 153,398 173,284 90,203 205,186" 
                fill="#7a0000" 
                opacity="0.2"
              />
              {/* Real Al Wafa Star (Main 5-pointed Star) */}
              <polygon 
                points="256,75 307,180 422,197 339,278 359,392 256,338 153,392 173,278 90,197 205,180" 
                fill="url(#redStarGrad)"
              />
            </g>
          </svg>
        </div>
      );
    }
    return renderSkylineSvg(size ? Number(size) * 1.5 : 44);
  };

  return (
    <div 
      className={`flex flex-col font-sans select-none ${className}`} 
      id="al-wafa-corporate-logo"
    >
      <div className="flex items-center gap-3 flex-nowrap px-1">
        {/* Left emblem: Halftone diamond sky tower OR Red Star logo exactly matching uploaded PDF */}
        <div className="shrink-0">
          {renderLeftEmblem()}
        </div>

        {/* Right emblem: Combined Corporate Headings */}
        <div className="flex flex-col text-left justify-center flex-1 min-w-0 mb-0.5">
          {/* 1. Arabic Classical Text Calligraphy representation - Single Line */}
          <h2 
            className={`text-[9.5px] sm:text-[10.5px] md:text-[11.5px] font-extrabold tracking-wide leading-none ${dark ? "text-white" : "text-slate-950"} block pt-0.5 whitespace-nowrap`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            نجمة الوفاء
          </h2>

          {/* 2. English Brand Name - Middle Line */}
          <h1 className="text-[13px] sm:text-sm md:text-base font-black tracking-wider uppercase leading-none mt-1 whitespace-nowrap text-[#ED1C24]">
            AL WAFA STAR
          </h1>
        </div>
      </div>
      
      {/* 4. Subtitle disabled for this matched variant */}
      {showSubtitle && (
        <div className="mt-2.5 flex items-center justify-start gap-1.5 pl-1 sm:pl-[64px] flex-wrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className={`text-[10px] sm:text-[11px] font-extrabold tracking-[0.22em] ${dark ? "text-emerald-400" : "text-emerald-700"} uppercase font-mono`}>
            PEST CONTROL SERVICES
          </span>
        </div>
      )}
    </div>
  );
}
