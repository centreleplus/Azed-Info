import React from "react";

/**
 * Permanent Base64 / Inline Vector Data URI for the A-Zedinfo Logo.
 * Renders the silver sphere, blue metallic AZ monogram, red "A-ZED" and green "Info".
 */
export const LOGO_AZED_BASE64 = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <!-- Background Circle Radial Gradient -->
    <radialGradient id="bgGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="65%" stop-color="#EAF0F6" />
      <stop offset="100%" stop-color="#CCD5E0" />
    </radialGradient>

    <!-- Metallic Blue Gradient for A and Z -->
    <linearGradient id="blueMetal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B40B5" />
      <stop offset="45%" stop-color="#00298B" />
      <stop offset="85%" stop-color="#0D5EE0" />
      <stop offset="100%" stop-color="#003198" />
    </linearGradient>

    <!-- Metallic Silver Ribbon Gradient -->
    <linearGradient id="silverSwoosh" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E2E8F0" />
      <stop offset="50%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#CBD5E1" />
    </linearGradient>

    <!-- Red Gradient for A-ZED -->
    <linearGradient id="redGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E11D48" />
      <stop offset="100%" stop-color="#B91C1C" />
    </linearGradient>

    <!-- Green Gradient for Info -->
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
  </defs>

  <!-- Background Sphere -->
  <circle cx="250" cy="250" r="238" fill="url(#bgGrad)" stroke="#B0BEC5" stroke-width="1.5" />

  <!-- Monogram Group (Shifted up slightly for visual centering) -->
  <g transform="translate(10, -10)">
    <!-- Letter A -->
    <path d="M 120 280 L 175 125 L 210 125 L 265 280 L 225 280 L 210 235 L 175 235 L 162 280 Z M 182 200 L 203 200 L 192.5 160 Z" fill="url(#blueMetal)" />

    <!-- Letter Z -->
    <path d="M 245 125 L 350 125 L 350 155 L 285 248 L 355 248 L 355 280 L 245 280 L 245 250 L 310 157 L 245 157 Z" fill="url(#blueMetal)" />

    <!-- Metallic Ribbon Swoosh crossing A and Z -->
    <path d="M 145 210 C 180 225, 230 180, 285 185 C 240 198, 190 220, 155 220 Z" fill="url(#silverSwoosh)" opacity="0.95" />
  </g>

  <!-- Text Section: A-ZED Info -->
  <g transform="translate(250, 355)">
    <!-- A-ZED (Red) -->
    <text x="-12" y="0" text-anchor="end" font-family="'Arial Black', 'Impact', sans-serif" font-weight="900" font-size="62" fill="url(#redGrad)" letter-spacing="-1">A-ZED</text>
    
    <!-- Info (Green) -->
    <text x="12" y="0" text-anchor="start" font-family="'Arial', 'Helvetica', sans-serif" font-weight="800" font-size="62" fill="url(#greenGrad)">Info</text>
  </g>
</svg>
`)}`;

export interface AppLogoProps {
  className?: string;
  imgClassName?: string;
  alt?: string;
  src?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = "w-10 h-10",
  imgClassName = "scale-[1.25]",
  alt = "A-Zedinfo Logo",
  src,
}) => {
  const logoSrc = src && src.trim() && src !== "/logo-azed.jpg" ? src : LOGO_AZED_BASE64;

  return (
    <div className={`relative rounded-full overflow-hidden flex-shrink-0 select-none ${className}`}>
      <img
        src={logoSrc}
        alt={alt}
        className={`w-full h-full object-cover transform ${imgClassName}`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default AppLogo;
