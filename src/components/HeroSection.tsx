import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useBrandIdentity } from '../context/BrandIdentityContext';

interface HeroSectionProps {
  onRegisterClick?: () => void;
  heroImageUrl?: string;
  brandName?: string;
  subTitle?: string;
  heroTitle?: string;
  heroHighlight?: string;
  heroParagraph?: string;
  ctaText?: string;
  isRtl?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onRegisterClick,
  heroImageUrl,
  brandName: propBrandName,
  subTitle = "LE SPÉCIALISTE EN INFORMATIQUE",
  heroTitle,
  heroHighlight,
  heroParagraph,
  ctaText = "Commencer gratuitement",
  isRtl = false
}) => {
  const { identity } = useBrandIdentity();
  let rawBrandName = propBrandName || identity.brandName || identity.logoText || "A-Zed Info";
  if (rawBrandName === "A-Zedinfo" || rawBrandName === "A-zedinfo") rawBrandName = "A-Zed Info";
  const effectiveBrandName = rawBrandName;
  const effectiveHeroImage = heroImageUrl || identity.heroImageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500";

  const cleanHeroTitle = heroTitle ? heroTitle.replace(/A-Zedinfo/gi, "A-Zed Info") : "";
  let cleanHighlight = heroHighlight;
  if (cleanHighlight && !cleanHighlight.includes("«") && cleanHighlight.includes("L'informatique dépasse")) {
    cleanHighlight = `« ${cleanHighlight} »`;
  }

  return (
    <section className="w-full bg-[#f1f8f6] dark:bg-slate-950 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className={`max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-emerald-100/80 dark:border-slate-800 shadow-sm shadow-emerald-900/5 flex flex-col md:flex-row items-center justify-between gap-8 ${isRtl ? "md:flex-row-reverse" : ""}`}>
        
        {/* Texte du Hero */}
        <div className={`flex-1 space-y-5 ${isRtl ? "text-center md:text-right" : "text-center md:text-left"}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-black uppercase tracking-wider rounded-full">
            <Sparkles className="w-3.5 h-3.5"/>
            <span>{subTitle}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
            {cleanHeroTitle || (
              <>
                {isRtl ? "مرحباً بكم في " : "Bienvenue sur "}<span className="text-[#1A2B6D] dark:text-blue-400">{effectiveBrandName}</span>
              </>
            )}
            {cleanHighlight && (
              <span className="block mt-2 text-emerald-600 dark:text-emerald-400 text-xl sm:text-2xl font-bold leading-snug">
                {cleanHighlight}
              </span>
            )}
          </h1>

          <p className="text-gray-800 dark:text-slate-200 text-sm sm:text-base font-semibold max-w-xl">
            {heroParagraph || (isRtl ? "الأستاذ نبيل شاوش" : "M. Nabil Chaouch")}
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={onRegisterClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#00b87c] hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>{ctaText}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}/>
            </button>
          </div>
        </div>

        {/* Visuel du Hero */}
        <div className="flex-1 flex justify-center relative select-none">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-800">
            <img
              src={effectiveHeroImage}
              alt={`${effectiveBrandName} Student`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
            />
          </div>
          <motion.div 
            initial={{ y: 0 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute top-4 right-2 sm:right-6 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl shadow-sm border border-emerald-100/80 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Platform Active</span>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
