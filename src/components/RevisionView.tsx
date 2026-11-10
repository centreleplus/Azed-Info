import React, { useState } from "react";
import DevoirsView from "./DevoirsView";
import CorrectionView from "./CorrectionView";
import { Sparkles, FileText, CheckCircle2 } from "lucide-react";
import { Language } from "../lib/translations";

interface RevisionViewProps {
  currentUser?: any;
  isPremiumUser: boolean;
  userGrade: string;
  userSection?: string;
  userRole?: string;
  currentLanguage?: Language;
  onGoToShop?: () => void;
  userPlan?: string;
}

export default function RevisionView(props: RevisionViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"enonce" | "correction">("enonce");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Espace Révisions & Examens</h1>
            <p className="text-xs text-slate-500">
              Énoncés live, annales d'examens nationaux et corrigés détaillés.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab("enonce")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === "enonce"
                ? "bg-white text-amber-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Énoncés & Sujets
          </button>
          <button
            onClick={() => setActiveSubTab("correction")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === "correction"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Corrigés détaillés
          </button>
        </div>
      </div>

      {activeSubTab === "enonce" ? (
        <DevoirsView {...props} selectedTrimestre="revision" />
      ) : (
        <CorrectionView {...props} selectedTrimestre="revision" />
      )}
    </div>
  );
}
