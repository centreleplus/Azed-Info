import React from "react";
import { AppLogo } from "./Logo";
import { AuthHeroImageConfig, DEFAULT_AUTH_HERO_CONFIG } from "../types";
import { useBrandIdentity } from "../context/BrandIdentityContext";

interface AuthHeroBannerProps {
  config?: AuthHeroImageConfig | null;
  imageUrl?: string;
  isRegistering?: boolean;
  className?: string;
  showDetails?: boolean;
}

export const AuthHeroBanner: React.FC<AuthHeroBannerProps> = ({
  config,
  imageUrl,
  isRegistering = false,
  className = "",
  showDetails = true
}) => {
  const { identity } = useBrandIdentity();
  let effectiveBrandName = identity.brandName || identity.logoText || "A-Zed Info";
  if (effectiveBrandName === "A-Zedinfo" || effectiveBrandName === "A-zedinfo") effectiveBrandName = "A-Zed Info";
  const effectiveLogoUrl = identity.logoUrl;

  const cfg: AuthHeroImageConfig = {
    ...DEFAULT_AUTH_HERO_CONFIG,
    ...config
  };

  const activeImg = imageUrl || cfg.imageUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400";

  const bgColor = cfg.backgroundColor || "#133F85";
  const frameWidth = cfg.width ? `${cfg.width}%` : "85%";
  const frameHeight = cfg.height ? `${cfg.height}px` : "480px";
  const scale = (cfg.scale || 100) / 100;
  const objectFitClass = cfg.objectFit === "object-contain" ? "object-contain" : "object-cover";
  const shapeClass = cfg.shapeClass || "rounded-3xl";
  const borderWidth = cfg.borderWidth !== undefined ? `${cfg.borderWidth}px` : "4px";
  const borderColor = cfg.borderColor || "rgba(255, 255, 255, 0.2)";

  return (
    <div
      className={`relative flex flex-col justify-between p-8 md:p-12 overflow-hidden select-none transition-all duration-300 min-h-full w-full ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Background ultra-sparse delicate glowing red stars pattern (10 stars) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {[
          { top: "6%", left: "80%", size: "18px", opacity: 0.9 },
          { top: "14%", left: "18%", size: "16px", opacity: 0.85 },
          { top: "22%", left: "88%", size: "15px", opacity: 0.8 },
          { top: "35%", left: "6%", size: "19px", opacity: 0.85 },
          { top: "45%", left: "92%", size: "20px", opacity: 0.9 },
          { top: "58%", left: "5%", size: "15px", opacity: 0.8 },
          { top: "68%", left: "90%", size: "18px", opacity: 0.85 },
          { top: "82%", left: "12%", size: "16px", opacity: 0.8 },
          { top: "88%", left: "82%", size: "17px", opacity: 0.85 },
          { top: "94%", left: "45%", size: "15px", opacity: 0.75 },
        ].map((item, idx) => (
          <div
            key={idx}
            aria-hidden="true"
            className="absolute pointer-events-none select-none flex items-center justify-center"
            style={{
              top: item.top,
              left: item.left,
              opacity: item.opacity,
              filter: "drop-shadow(0px 0px 4px rgba(239, 68, 68, 0.75))",
            }}
          >
            <svg
              width={item.size}
              height={item.size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 0 C12 6.627, 17.373 12, 24 12 C17.373 12, 12 17.373, 12 24 C12 17.373, 6.627 12, 0 12 C6.627 12, 12 6.627, 12 0 Z"
                fill="#EF4444"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Header inside the pane */}
      {showDetails && (
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <AppLogo className="w-12 h-12 shadow-sm" src={effectiveLogoUrl} alt={effectiveBrandName} />
            <div>
              <span className="font-extrabold text-white text-sm tracking-tight block">{effectiveBrandName}</span>
              <span className="text-emerald-400 text-[9px] font-black uppercase tracking-widest block">Plateforme Algorithmique</span>
            </div>
          </div>
        </div>
      )}

      {/* Receptive Card / Image centerpiece */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-6 w-full">
        <div
          className={`relative overflow-hidden shadow-2xl transition-all duration-300 ${shapeClass}`}
          style={{
            width: frameWidth,
            height: frameHeight,
            maxWidth: "100%",
            borderWidth: borderWidth,
            borderColor: borderColor,
            borderStyle: "solid"
          }}
        >
          <img
            src={activeImg}
            alt="Illustration Inscription"
            referrerPolicy="no-referrer"
            className={`w-full h-full transition-all duration-300 ${objectFitClass}`}
            style={{
              transform: `scale(${scale})`
            }}
          />
          {/* Subtle dark gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Footer quote inside the pane */}
      {showDetails && (
        <div className="relative z-10 text-white/90">
          <blockquote className="font-medium text-xs italic leading-relaxed text-slate-100 max-w-xs">
            "Excellence et réussite garanties pour l'épreuve pratique et théorique d'informatique au baccalauréat tunisien."
          </blockquote>
          <p className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 mt-1.5">A-Zed Info Academy</p>
        </div>
      )}
    </div>
  );
};

export default AuthHeroBanner;
