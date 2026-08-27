import React from "react";

interface LandingPageLayoutProps {
  children: React.ReactNode;
}

export const LandingPageLayout: React.FC<LandingPageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#f1f8f6] dark:bg-slate-950 relative overflow-hidden font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Halo lumineux décoratif subtil en arrière-plan */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-emerald-100/40 via-teal-50/20 to-transparent dark:from-emerald-950/20 dark:via-transparent dark:to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Contenu principal de la page */}
      <main className="relative z-10 space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default LandingPageLayout;
