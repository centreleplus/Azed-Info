import React, { useEffect, useState } from "react";
import { FileText, Lock, ShieldCheck, CheckCircle2, BookOpen } from "lucide-react";
import { ExerciseItem } from "./ExerciceDetailModal";
import BackButton from "./BackButton";

interface TextViewerPageProps {
  exercise?: ExerciseItem | null;
  exerciseId?: string;
  onBack?: () => void;
  isPremiumUser?: boolean;
}

export default function TextViewerPage({
  exercise: initialExercise,
  exerciseId,
  onBack,
  isPremiumUser = false
}: TextViewerPageProps) {
  const [exercise, setExercise] = useState<ExerciseItem | null>(initialExercise || null);
  const [loading, setLoading] = useState<boolean>(!initialExercise && !!exerciseId);

  // Gestion dynamique et universelle du bouton « Retour »
  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      const lastTab = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("lastStudentTab") : null;
      window.location.hash = `#/${lastTab || "student/dashboard"}`;
    }
  };

  // Fetch text document if exerciseId was provided without exercise object
  useEffect(() => {
    if (!initialExercise && exerciseId) {
      setLoading(true);
      fetch(`/api/courses/code/${exerciseId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Impossible de charger le document texte");
          return res.json();
        })
        .then((data) => {
          setExercise({
            id: data.id,
            title: data.title || "Fiche / Document Texte",
            filename: data.filename || `${exerciseId}.txt`,
            textContent: data.code,
            fileType: "txt"
          });
        })
        .catch(() => {
          // Fallback if network or item ID not found in server DB
          setExercise({
            id: exerciseId,
            title: "Fiche d'Exercices & Résumé de Cours",
            filename: `${exerciseId}.txt`,
            textContent: `=========================================================\nPLATEFORME A-ZED INFO - SUPPORT PEDAGOGIQUE\nDocument Texte d'Apprentissage (.txt)\n=========================================================\n\n1. OBJECTIFS DU MODULE :\n- Assimiler les principes fondamentaux de l'algorithmique.\n- Maîtriser la structuration et la logique de programmation.\n- Appliquer les méthodes de résolution sur des cas pratiques.\n\n2. CONSEILS PRATIQUES DE REVISION :\n- Lisez attentivement l'énoncé de chaque problème.\n- Identifiez la nature des variables d'entrée et de sortie.\n- Décomposez les traitements complexes en sous-problèmes.\n- Effectuez un déroulement manuel avant l'écriture sur machine.\n\n3. RAPPELS DE SYNTAXE :\n- Affectation : variable = valeur\n- Condition : Si <condition> Alors ... Sinon ... FinSi\n- Boucle : Pour i de 1 à N Faire ... FinPour\n\n=========================================================\nDocument officiel protégé - A-Zed Info © Tout droit réservé.\n=========================================================`,
            fileType: "txt"
          });
        })
        .finally(() => setLoading(false));
    }
  }, [initialExercise, exerciseId]);

  // Block copy, cut, context menu, and keyboard inspection shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Block Ctrl+C (copy), Ctrl+X (cut), Ctrl+U (view source), Ctrl+S (save), Ctrl+A (select all), Ctrl+P (print), F12 (DevTools)
      if (
        (isCtrlOrCmd && (key === "c" || key === "x" || key === "u" || key === "s" || key === "a" || key === "p")) ||
        e.key === "F12" ||
        (isCtrlOrCmd && e.shiftKey && (key === "i" || key === "j" || key === "c"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  const activeEx = exercise || initialExercise;
  const fileName = activeEx?.filename || activeEx?.attachmentName || "document.txt";
  const title = activeEx?.title || "Document Texte Pédagogique";
  const moduleName = activeEx?.module || activeEx?.type || "Général";

  const rawText = activeEx?.textContent || activeEx?.solutionCode || activeEx?.description || `=========================================================
PLATEFORME A-ZED INFO - SUPPORT D'APPRENTISSAGE (.TXT)
Fichier : ${fileName}
=========================================================

CONTENU DU DOCUMENT :
Ce document contient la fiche de synthèse, les consignes et le support de travail pour cet exercice.

- Respectez la méthodologie d'analyse.
- Vérifiez la validité de vos algorithmes.
- Référez-vous aux corrections détaillées sur la plateforme A-Zed Info.
`;

  return (
    <div 
      className="min-h-screen bg-slate-50 flex flex-col text-slate-900 select-none font-sans"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none"
      }}
    >
      {/* Sticky Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs px-4 py-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Back Button & Title */}
          <div className="flex items-center gap-4">
            <BackButton onClick={handleGoBack} label="Retour" />

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <FileText size={12} />
                  <span>Document (.txt)</span>
                </span>

                {moduleName && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                    <BookOpen size={10} />
                    <span>Module : {moduleName}</span>
                  </span>
                )}

                {activeEx?.isPremium && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <Lock size={10} />
                    <span>PREMIUM</span>
                  </span>
                )}
              </div>
              <h1 className="text-base font-extrabold text-slate-900 mt-0.5 line-clamp-1">
                {title}
              </h1>
            </div>
          </div>

          {/* File Name Tag */}
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
            <FileText size={15} className="text-blue-600 shrink-0" />
            <span className="font-mono text-xs font-bold text-slate-700">
              {fileName}
            </span>
          </div>

        </div>
      </header>

      {/* Security Banner */}
      <div className="bg-amber-50/80 border-b border-amber-200/80 px-4 py-2.5 text-xs text-amber-900 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-amber-600 shrink-0" />
            <span className="font-medium">
              <strong className="font-bold">Mode Lecture Seule Protégé :</strong> La sélection et la copie du texte sont désactivées pour préserver les contenus de formation.
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-[11px] text-amber-800 font-semibold bg-amber-100/60 px-2.5 py-1 rounded-lg border border-amber-200/60">
            <CheckCircle2 size={13} className="text-amber-600" />
            <span>Affichage Plein Écran Optimisé</span>
          </div>
        </div>
      </div>

      {/* Main Content Area - Full Page Fluid Scroll */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-12 text-center text-slate-500 space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold">Chargement du document texte...</p>
          </div>
        ) : (
          <div 
            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden select-none"
            onContextMenu={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            style={{
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none"
            }}
          >
            {/* Document Bar */}
            <div className="bg-slate-100/80 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="font-bold text-slate-700 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                {fileName}
              </span>
              <span className="text-[11px] text-slate-400">
                Format : Fichier Texte (.TXT) | A-Zed Info
              </span>
            </div>

            {/* Document Content View */}
            <article className="p-6 sm:p-10 bg-white text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans font-normal border-b border-slate-100">
              {rawText}
            </article>

            {/* Footer */}
            <div className="bg-slate-50 p-4 text-center text-xs text-slate-500">
              A-Zed Info © Document officiel d'apprentissage. Consultation exclusivement réservée aux étudiants inscrits.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
