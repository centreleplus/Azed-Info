import React, { useEffect, useState } from "react";
import { FileText, Lock, ShieldCheck, CheckCircle2, BookOpen, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";
import { ExerciseItem } from "./ExerciceDetailModal";
import BackButton from "./BackButton";
import { isDocumentAllowedForStudent, getStudentActiveTier } from "../utils/documentAccess";

interface TextViewerPageProps {
  exercise?: ExerciseItem | null;
  exerciseId?: string;
  onBack?: () => void;
  isPremiumUser?: boolean;
  currentUser?: any;
  userPlan?: string;
  onRedirectToOffers?: () => void;
}

export default function TextViewerPage({
  exercise: initialExercise,
  exerciseId,
  onBack,
  isPremiumUser = false,
  currentUser,
  userPlan,
  onRedirectToOffers
}: TextViewerPageProps) {
  const [exercise, setExercise] = useState<ExerciseItem | null>(initialExercise || null);
  const [loading, setLoading] = useState<boolean>(!initialExercise && !!exerciseId);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(5);

  const effectiveUser = currentUser || (() => {
    try {
      const stored = localStorage.getItem("current_user") || sessionStorage.getItem("current_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })() || {
    role: "student",
    subscriptionPlan: userPlan,
    accountType: isPremiumUser ? "premium" : "freemium"
  };

  // Gestion dynamique et universelle du bouton « Retour »
  const handleGoBack = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onBack) {
      onBack();
      return;
    }
    try {
      const lastTab = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("lastStudentTab") : null;
      if (lastTab && !lastTab.includes("viewer")) {
        const target = lastTab === "cours" ? "student/courses" : lastTab;
        window.location.hash = `#/${target}`;
        return;
      }
    } catch {
      // ignore
    }
    window.location.hash = "#/student/courses";
  };

  const handleGoToOffers = () => {
    if (onRedirectToOffers) {
      onRedirectToOffers();
    } else {
      window.location.hash = "#/student/offers";
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
            isPremium: data.isPremium,
            targetAudience: data.targetAudience,
            targetTiers: data.targetTiers,
            allowedTiers: data.allowedTiers,
            fileType: "txt"
          });
        })
        .catch(() => {
          // Fallback if network or item ID not found in server DB
          setExercise({
            id: exerciseId,
            title: "Fiche d'Exercices & Résumé de Cours",
            filename: `${exerciseId}.txt`,
            textContent: `=========================================================\nPLATEFORME A-ZEDINFO - SUPPORT PEDAGOGIQUE\nDocument Texte d'Apprentissage (.txt)\n=========================================================\n\n1. OBJECTIFS DU MODULE :\n- Assimiler les principes fondamentaux de l'algorithmique.\n- Maîtriser la structuration et la logique de programmation.\n- Appliquer les méthodes de résolution sur des cas pratiques.\n\n2. CONSEILS PRATIQUES DE REVISION :\n- Lisez attentivement l'énoncé de chaque problème.\n- Identifiez la nature des variables d'entrée et de sortie.\n- Décomposez les traitements complexes en sous-problèmes.\n- Effectuez un déroulement manuel avant l'écriture sur machine.\n\n3. RAPPELS DE SYNTAXE :\n- Affectation : variable = valeur\n- Condition : Si <condition> Alors ... Sinon ... FinSi\n- Boucle : Pour i de 1 à N Faire ... FinPour\n\n=========================================================\nDocument officiel protégé - A-Zedinfo © Tout droit réservé.\n=========================================================`,
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
  const isAllowed = !activeEx || isDocumentAllowedForStudent(activeEx, effectiveUser);

  useEffect(() => {
    if (!loading && activeEx && !isAllowed) {
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleGoToOffers();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, activeEx, isAllowed]);

  const fileName = activeEx?.filename || activeEx?.attachmentName || "document.txt";
  const title = activeEx?.title || "Document Texte Pédagogique";
  const moduleName = activeEx?.module || activeEx?.type || "Général";

  const requiredAudiences = (activeEx?.targetAudience && activeEx.targetAudience.length > 0)
    ? activeEx.targetAudience
    : (activeEx?.targetTiers && activeEx.targetTiers.length > 0)
    ? activeEx.targetTiers
    : (activeEx?.allowedTiers && activeEx.allowedTiers.length > 0)
    ? activeEx.allowedTiers
    : (activeEx?.isPremium ? ["Premium", "Premium+", "Premium++"] : ["Tous les forfaits"]);

  const studentTier = getStudentActiveTier(effectiveUser);

  const rawText = activeEx?.textContent || activeEx?.solutionCode || activeEx?.description || `=========================================================
PLATEFORME A-ZED INFO - SUPPORT D'APPRENTISSAGE (.TXT)
Fichier : ${fileName}
=========================================================

CONTENU DU DOCUMENT :
Ce document contient la fiche de synthèse, les consignes et le support de travail pour cet exercice.

- Respectez la méthodologie d'analyse.
- Vérifiez la validité de vos algorithmes.
- Référez-vous aux corrections détaillées sur la plateforme A-Zedinfo.
`;

  return (
    <div 
      className="w-full relative z-0 text-slate-900 select-none font-sans py-2"
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
      {/* Subheader Toolbar & Mode Lecture Seule Banner */}
      <header className="bg-white border border-slate-200 rounded-2xl p-4 sm:px-6 shadow-xs relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4 min-w-0">
          <BackButton onClick={handleGoBack} label="Retour" />

          <div className="h-6 w-px bg-slate-200 hidden sm:block shrink-0" />

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <FileText size={12} />
                <span>Document (.txt)</span>
              </span>

              {moduleName && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full truncate">
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
            <h1 className="text-base font-extrabold text-slate-900 mt-1 line-clamp-1">
              {title}
            </h1>
          </div>
        </div>

        {/* File Name Tag */}
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0">
          <FileText size={15} className="text-blue-600 shrink-0" />
          <span className="font-mono text-xs font-bold text-slate-700">
            {fileName}
          </span>
        </div>
      </header>

      {/* Security Banner */}
      <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl px-4 py-2.5 text-xs text-amber-900 shadow-2xs mb-4">
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
        ) : !isAllowed ? (
          /* ACCÈS RESTREINT - UPGRADE PROMPT BANNER & DIRECT URL PROTECTION */
          <div className="bg-white border-2 border-amber-300 rounded-3xl shadow-xl overflow-hidden p-8 sm:p-12 text-center max-w-2xl mx-auto my-6 space-y-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-amber-100 to-amber-200 text-amber-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-amber-300">
              <ShieldAlert className="w-10 h-10 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100/80 text-amber-900 rounded-full text-[11px] font-black uppercase tracking-wider">
                <Lock className="w-3 h-3" />
                <span>Document Texte Réservé</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Accès non autorisé pour cette fiche
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Ce document texte (<span className="font-bold text-slate-800">{title}</span>) nécessite un forfait spécifique.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 max-w-md mx-auto text-left">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Votre offre actuelle :</span>
                <span className="font-black px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 uppercase tracking-wider text-[10px]">
                  {studentTier}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-semibold">Offres autorisées :</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {requiredAudiences.map((aud) => (
                    <span key={aud} className="font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                      {aud}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleGoToOffers}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Découvrir les Offres & Mettre à Niveau</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                type="button"
                onClick={handleGoBack}
                className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Retourner aux documents
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              Redirection automatique vers les offres dans <span className="font-black text-slate-700">{redirectCountdown}s</span>...
            </p>
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
                Format : Fichier Texte (.TXT) | A-Zedinfo
              </span>
            </div>

            {/* Document Content View */}
            <article className="p-6 sm:p-10 bg-white text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans font-normal border-b border-slate-100">
              {rawText}
            </article>

            {/* Footer */}
            <div className="bg-slate-50 p-4 text-center text-xs text-slate-500">
              A-Zedinfo © Document officiel d'apprentissage. Consultation exclusivement réservée aux étudiants inscrits.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
