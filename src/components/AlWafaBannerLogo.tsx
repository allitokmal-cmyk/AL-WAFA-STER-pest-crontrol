import React from 'react';

export const AlWafaBannerLogo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center bg-transparent px-2 py-4 overflow-hidden ${className}`}>
      {/* Red diamond logo on the left */}
      <div className="flex-shrink-0 mr-6 w-24 h-24">
        <svg viewBox="100 150 280 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="diamondGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef1c24" />
              <stop offset="15%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
          </defs>
          <g transform="scale(0.8) translate(50, 60)">
             {/* Left tower */}
            <rect x="119.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 124 291)" fill="url(#diamondGrad2)" />
            <rect x="119.5" y="271.5" width="9" height="9" rx="0.5" transform="rotate(45 124 276)" fill="url(#diamondGrad2)" />
            <rect x="119.5" y="256.5" width="9" height="9" rx="0.5" transform="rotate(45 124 261)" fill="url(#diamondGrad2)" />
            <rect x="119.5" y="241.5" width="9" height="9" rx="0.5" transform="rotate(45 124 246)" fill="url(#diamondGrad2)" />
            <rect x="119.5" y="226.5" width="9" height="9" rx="0.5" transform="rotate(45 124 231)" fill="url(#diamondGrad2)" />
            <rect x="119.5" y="211.5" width="9" height="9" rx="0.5" transform="rotate(45 124 216)" fill="url(#diamondGrad2)" opacity="0.9" />
            
            <rect x="132.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 137 291)" fill="url(#diamondGrad2)" />
            <rect x="132.5" y="271.5" width="9" height="9" rx="0.5" transform="rotate(45 137 276)" fill="url(#diamondGrad2)" />
            <rect x="132.5" y="256.5" width="9" height="9" rx="0.5" transform="rotate(45 137 261)" fill="url(#diamondGrad2)" />
            <rect x="132.5" y="241.5" width="9" height="9" rx="0.5" transform="rotate(45 137 246)" fill="url(#diamondGrad2)" />
            <rect x="132.5" y="226.5" width="9" height="9" rx="0.5" transform="rotate(45 137 231)" fill="url(#diamondGrad2)" />
            <rect x="132.5" y="211.5" width="9" height="9" rx="0.5" transform="rotate(45 137 216)" fill="url(#diamondGrad2)" opacity="0.9" />
            
            <rect x="145.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 150 291)" fill="url(#diamondGrad2)" />
            <rect x="145.5" y="271.5" width="9" height="9" rx="0.5" transform="rotate(45 150 276)" fill="url(#diamondGrad2)" />
            <rect x="145.5" y="256.5" width="9" height="9" rx="0.5" transform="rotate(45 150 261)" fill="url(#diamondGrad2)" />
            <rect x="145.5" y="241.5" width="9" height="9" rx="0.5" transform="rotate(45 150 246)" fill="url(#diamondGrad2)" />
            <rect x="145.5" y="226.5" width="9" height="9" rx="0.5" transform="rotate(45 150 231)" fill="url(#diamondGrad2)" />
            
            <rect x="158.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 163 291)" fill="url(#diamondGrad2)" />
            <rect x="158.5" y="271.5" width="9" height="9" rx="0.5" transform="rotate(45 163 276)" fill="url(#diamondGrad2)" />
            <rect x="158.5" y="256.5" width="9" height="9" rx="0.5" transform="rotate(45 163 261)" fill="url(#diamondGrad2)" />
            <rect x="158.5" y="241.5" width="9" height="9" rx="0.5" transform="rotate(45 163 246)" fill="url(#diamondGrad2)" />
            
            <rect x="171.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 176 291)" fill="url(#diamondGrad2)" />
            <rect x="171.5" y="271.5" width="9" height="9" rx="0.5" transform="rotate(45 176 276)" fill="url(#diamondGrad2)" />
            <rect x="171.5" y="256.5" width="9" height="9" rx="0.5" transform="rotate(45 176 261)" fill="url(#diamondGrad2)" />
            
            <rect x="184.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 189 291)" fill="url(#diamondGrad2)" />
            <rect x="184.5" y="271.5" width="9" height="9" rx="0.5" transform="rotate(45 189 276)" fill="url(#diamondGrad2)" />
            <rect x="184.5" y="256.5" width="9" height="9" rx="0.5" transform="rotate(45 189 261)" fill="url(#diamondGrad2)" opacity="0.9" />
            
            <rect x="197.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 202 291)" fill="url(#diamondGrad2)" />
            <rect x="197.5" y="271.5" width="9" height="9" rx="0.5" transform="rotate(45 202 276)" fill="url(#diamondGrad2)" opacity="0.9" />
            
            <rect x="210.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 215 291)" fill="url(#diamondGrad2)" />
            
            {/* Center tower */}
            <rect x="236.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 241 291)" fill="url(#diamondGrad2)" />
            <rect x="236.5" y="271.5" width="9" height="9" rx="0.5" transform="rotate(45 241 276)" fill="url(#diamondGrad2)" />
            <rect x="236.5" y="256.5" width="9" height="9" rx="0.5" transform="rotate(45 241 261)" fill="url(#diamondGrad2)" />
            <rect x="236.5" y="241.5" width="9" height="9" rx="0.5" transform="rotate(45 241 246)" fill="url(#diamondGrad2)" />
            
            <rect x="249.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 254 291)" fill="url(#diamondGrad2)" />
            <rect x="249.5" y="271.5" width="9" height="9" rx="0.5" transform="rotate(45 254 276)" fill="url(#diamondGrad2)" />
            <rect x="249.5" y="256.5" width="9" height="9" rx="0.5" transform="rotate(45 254 261)" fill="url(#diamondGrad2)" />
            <rect x="249.5" y="241.5" width="9" height="9" rx="0.5" transform="rotate(45 254 246)" fill="url(#diamondGrad2)" />
            
            <rect x="262.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 267 291)" fill="url(#diamondGrad2)" />
            <rect x="262.5" y="271.5" width="9" height="9" rx="0.5" transform="rotate(45 267 276)" fill="url(#diamondGrad2)" />
            <rect x="262.5" y="256.5" width="9" height="9" rx="0.5" transform="rotate(45 267 261)" fill="url(#diamondGrad2)" />
            <rect x="262.5" y="241.5" width="9" height="9" rx="0.5" transform="rotate(45 267 246)" fill="url(#diamondGrad2)" />
            
            <rect x="275.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 280 291)" fill="url(#diamondGrad2)" />
            <rect x="275.5" y="271.5" width="9" height="9" rx="0.5" transform="rotate(45 280 276)" fill="url(#diamondGrad2)" />
            <rect x="275.5" y="256.5" width="9" height="9" rx="0.5" transform="rotate(45 280 261)" fill="url(#diamondGrad2)" />
            
            <rect x="288.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 293 291)" fill="url(#diamondGrad2)" />
            <rect x="288.5" y="271.5" width="9" height="9" rx="0.5" transform="rotate(45 293 276)" fill="url(#diamondGrad2)" />
            
            {/* Right tower */}
            <rect x="314.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 319 291)" fill="url(#diamondGrad2)" />
            <rect x="314.5" y="271.5" width="9" height="9" rx="0.5" transform="rotate(45 319 276)" fill="url(#diamondGrad2)" />
            <rect x="314.5" y="256.5" width="9" height="9" rx="0.5" transform="rotate(45 319 261)" fill="url(#diamondGrad2)" />
            <rect x="314.5" y="241.5" width="9" height="9" rx="0.5" transform="rotate(45 319 246)" fill="url(#diamondGrad2)" />
            
            <rect x="327.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 332 291)" fill="url(#diamondGrad2)" />
            <rect x="327.5" y="271.5" width="9" height="9" rx="0.5" transform="rotate(45 332 276)" fill="url(#diamondGrad2)" />
            <rect x="327.5" y="256.5" width="9" height="9" rx="0.5" transform="rotate(45 332 261)" fill="url(#diamondGrad2)" />
            <rect x="327.5" y="241.5" width="9" height="9" rx="0.5" transform="rotate(45 332 246)" fill="url(#diamondGrad2)" />
            
            <rect x="340.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 345 291)" fill="url(#diamondGrad2)" />
            <rect x="340.5" y="271.5" width="9" height="9" rx="0.5" transform="rotate(45 345 276)" fill="url(#diamondGrad2)" />
            <rect x="340.5" y="256.5" width="9" height="9" rx="0.5" transform="rotate(45 345 261)" fill="url(#diamondGrad2)" />
            
            <rect x="353.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 358 291)" fill="url(#diamondGrad2)" />
            <rect x="353.5" y="271.5" width="9" height="9" rx="0.5" transform="rotate(45 358 276)" fill="url(#diamondGrad2)" />
            
            <rect x="366.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 371 291)" fill="url(#diamondGrad2)" />
            
            {/* Ground dots */}
            <rect x="93.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 98 291)" fill="url(#diamondGrad2)" />
            <rect x="106.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 111 291)" fill="url(#diamondGrad2)" />
            
            <rect x="379.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 384 291)" fill="url(#diamondGrad2)" />
            <rect x="392.5" y="286.5" width="9" height="9" rx="0.5" transform="rotate(45 397 291)" fill="url(#diamondGrad2)" />
          </g>
        </svg>
      </div>
      
      {/* Text Content */}
      <div className="flex flex-col flex-1 pl-4 pt-1">
        {/* Arabic Header */}
        <div className="flex justify-between items-baseline w-full">
          <span className="text-white font-serif font-bold text-2xl tracking-tight leading-tight whitespace-nowrap" dir="rtl" style={{ marginLeft: "auto", display: "flex", width: "100%", justifyContent: "space-between" }}>
            <span style={{ fontSize: "1.6rem" }}>نجمة الوفاء</span>
            <span style={{ fontSize: "1.4rem", marginRight: "1rem", fontWeight: "600" }}>لمكافحة الحشرات</span>
          </span>
        </div>
        
        {/* English Header */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-white font-sans font-black text-2xl tracking-tighter shrink-0" style={{ transform: "scaleY(1.1)" }}>
            AL WAFA STAR
          </span>
          <span className="text-white font-sans font-medium text-[19px] tracking-tight ml-2 shrink-0">
            PEST CONTROL SERVICES
          </span>
        </div>
      </div>
      
      {/* Decorative Red Lines at bottom */}
      <div className="absolute bottom-2 left-6 right-6 flex flex-col gap-[3px]">
        <div className="w-full h-[2px] bg-[#d7242c]" />
        <div className="w-full h-[1px] bg-[#d7242c]" />
      </div>
    </div>
  );
};
