import React from "react";
import { AuthHeroImageConfig, DEFAULT_AUTH_HERO_CONFIG } from "../types";

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
      {/* Background abstract decoration elements */}
      <div className="absolute top-10 left-10 w-16 h-16 rounded-full border-2 border-white/10 pointer-events-none" />
      <div className="absolute top-1/4 -left-12 w-28 h-28 rounded-full bg-pink-500/20 blur-xl pointer-events-none" />
      <div className="absolute top-1/3 -left-8 w-20 h-20 rounded-full bg-[#EC4899] pointer-events-none opacity-90" />
      <div className="absolute bottom-1/4 -right-8 w-24 h-24 rounded-full bg-[#EC4899] pointer-events-none opacity-95" />
      <div className="absolute bottom-1/3 left-1/4 w-32 h-32 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />

      {/* Header inside the pane */}
      {showDetails && (
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white text-[#133F85] rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
              A
            </div>
            <div>
              <span className="font-extrabold text-white text-sm tracking-tight block">A-Zed Info</span>
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
