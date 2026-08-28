import React, { useState, useEffect } from "react";
import { BookOpen, Layers } from "lucide-react";

const EBookReader = React.lazy(() => import("./EBookReader"));
const PDFLibraryView = React.lazy(() => import("./PDFLibraryView"));

export function BibliothequeWrapper({ ebooks, isPremiumUser, searchQuery, userRole, onGoToShop, initialSubTab = "ebooks" }: any) {
  const [activeSubTab, setActiveSubTab] = useState<"ebooks" | "pdf">(initialSubTab);

  useEffect(() => {
    const handleTabChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === "pdf-library") {
        setActiveSubTab("pdf");
      }
    };
    window.addEventListener("change-pdf-subtab", handleTabChange);
    return () => window.removeEventListener("change-pdf-subtab", handleTabChange);
  }, []);

  return (
    <div className="space-y-6 text-left">
      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-gray-100 dark:border-slate-850 pb-3">
        <button
          onClick={() => setActiveSubTab("ebooks")}
          className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === "ebooks"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
              : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
          }`}
        >
          <BookOpen size={13} />
          <span>Supports Interactifs (E-Books)</span>
        </button>
        <button
          onClick={() => setActiveSubTab("pdf")}
          className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === "pdf"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
          }`}
        >
          <Layers size={13} />
          <span>Lecteur & Bibliothèque PDF</span>
        </button>
      </div>

      <React.Suspense fallback={<div className="p-8 text-center text-slate-500 flex items-center justify-center min-h-[250px]"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div></div>}>
        {activeSubTab === "ebooks" ? (
          <EBookReader
            ebooks={ebooks}
            isPremiumUser={isPremiumUser}
            searchQuery={searchQuery}
            userRole={userRole}
            onGoToShop={onGoToShop}
          />
        ) : (
          <PDFLibraryView
            isPremiumUser={isPremiumUser}
            onGoToShop={onGoToShop}
          />
        )}
      </React.Suspense>
    </div>
  );
}

export default BibliothequeWrapper;
