import React from 'react';

interface SectionLayoutProps {
  badge: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  id?: string;
  className?: string;
  headerStyle?: React.CSSProperties;
}

export const SectionLayout: React.FC<SectionLayoutProps> = ({
  badge,
  title,
  subtitle,
  children,
  id,
  className = "",
  headerStyle
}) => {
  return (
    <section id={id} className={`w-full bg-[#f1f8f6] dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${className}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* En-tête standard unifié */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-black uppercase tracking-wider rounded-full">
            {badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight" style={headerStyle}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Contenu / Grille de cartes */}
        {children}

      </div>
    </section>
  );
};

export default SectionLayout;
