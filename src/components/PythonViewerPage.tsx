import React, { useEffect, useState } from "react";
import { Code, Lock, ShieldCheck, FileCode, CheckCircle2, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";
import { ExerciseItem } from "./ExerciceDetailModal";
import BackButton from "./BackButton";
import { isDocumentAllowedForStudent, getStudentActiveTier } from "../utils/documentAccess";

interface PythonViewerPageProps {
  exercise?: ExerciseItem | null;
  exerciseId?: string;
  onBack?: () => void;
  isPremiumUser?: boolean;
  currentUser?: any;
  userPlan?: string;
  onRedirectToOffers?: () => void;
}

export default function PythonViewerPage({
  exercise: initialExercise,
  exerciseId,
  onBack,
  isPremiumUser = false,
  currentUser,
  userPlan,
  onRedirectToOffers
}: PythonViewerPageProps) {
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

  // Fetch code if exerciseId was provided without exercise object
  useEffect(() => {
    if (!initialExercise && exerciseId) {
      setLoading(true);
      fetch(`/api/courses/code/${exerciseId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Impossible de charger le code source");
          return res.json();
        })
        .then((data) => {
          setExercise({
            id: data.id,
            title: data.title || "Exercice Python",
            filename: data.filename || `${exerciseId}.py`,
            solutionCode: data.code,
            isPremium: data.isPremium,
            targetAudience: data.targetAudience,
            targetTiers: data.targetTiers,
            allowedTiers: data.allowedTiers,
            fileType: "py"
          });
        })
        .catch(() => {
          // Fallback if network or item ID not found in server DB
          setExercise({
            id: exerciseId,
            title: "Exercice Pratique Python",
            filename: `${exerciseId}.py`,
            solutionCode: `# =========================================================\n# Code Source Python - A-Zed Info\n# =========================================================\n\ndef executer_exercice():\n    print("Code source Python en cours d'exécution...")\n\nif __name__ == "__main__":\n    executer_exercice()`,
            fileType: "py"
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

  const fileName = activeEx?.filename || activeEx?.attachmentName || "exercice.py";
  const title = activeEx?.title || "Code Source Python";

  const requiredAudiences = (activeEx?.targetAudience && activeEx.targetAudience.length > 0)
    ? activeEx.targetAudience
    : (activeEx?.targetTiers && activeEx.targetTiers.length > 0)
    ? activeEx.targetTiers
    : (activeEx?.allowedTiers && activeEx.allowedTiers.length > 0)
    ? activeEx.allowedTiers
    : (activeEx?.isPremium ? ["Premium", "Premium+", "Premium++"] : ["Tous les forfaits"]);

  const studentTier = getStudentActiveTier(effectiveUser);

  const rawCode = activeEx?.solutionCode || activeEx?.textContent || `# =========================================================
# Plateforme A-Zed Info - Support d'Apprentissage
# Module : Algorithmique & Programmation Python
# Fichier : ${fileName}
# =========================================================

def executer_exercice():
    """
    Exemple de démonstration de code Python sécurisé.
    Ce code est protégé contre la copie et le téléchargement direct.
    """
    print("=== DEVOIR / EXERCICE PRATIQUE PYTHON ===")
    
    # Structure de données
    notes = [14.5, 18.0, 12.25, 16.5, 19.0]
    
    # Calcul de la moyenne
    somme = sum(notes)
    moyenne = somme / len(notes)
    
    print(f"Nombre d'évaluations : {len(notes)}")
    print(f"Moyenne générale calculée : {moyenne:.2f}/20")
    
    if moyenne >= 16:
        print("Mention : Très Bien (Élève certifié A-Zed Info)")
    elif moyenne >= 12:
        print("Mention : Assez Bien")
    else:
        print("Mention : En cours de consolidation")

if __name__ == "__main__":
    executer_exercice()
`;

  const lines = rawCode.split("\n");

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
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <Code size={12} />
                <span>Python (.py)</span>
              </span>

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
          <FileCode size={15} className="text-emerald-600 shrink-0" />
          <span className="font-mono text-xs font-bold text-slate-700">
            {fileName}
          </span>
        </div>
      </header>

      {/* Security Info Banner */}
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

      {/* Main Content Area - Full Page Natural Scroll */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-12 text-center text-slate-500 space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold">Chargement du code source Python...</p>
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
                <span>Ressource Python Réservée</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Accès non autorisé pour ce code source
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Ce script et corrigé Python (<span className="font-bold text-slate-800">{title}</span>) nécessite un forfait spécifique.
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
            {/* Code Header Bar */}
            <div className="bg-slate-100/80 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="font-bold text-slate-700 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                {fileName} ({lines.length} lignes)
              </span>
              <span className="text-[11px] text-slate-400">
                Encodage : UTF-8 | Langage : Python 3.x
              </span>
            </div>

            {/* Light Theme Code Container with Fluid Scroll */}
            <div className="p-4 sm:p-6 bg-white font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto">
              <div className="table w-full border-collapse">
                {lines.map((line, idx) => (
                  <div key={idx} className="table-row hover:bg-slate-50/80 transition-colors">
                    {/* Line Number */}
                    <span className="table-cell text-right pr-4 py-0.5 text-slate-400 select-none text-[11px] font-mono w-12 border-r border-slate-200 bg-slate-50/50">
                      {idx + 1}
                    </span>
                    {/* Line Code with Light Theme Syntax Highlighting */}
                    <span className="table-cell pl-4 py-0.5 whitespace-pre">
                      {highlightPythonLight(line)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Notice */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 text-center text-xs text-slate-500">
              A-Zed Info © Plateforme Éducative d'Informatique. Ce code source est réservé à la consultation pédagogique.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * High contrast light theme syntax highlighter for Python code
 */
function highlightPythonLight(line: string): React.ReactNode {
  // If whole line is a comment
  const trimmed = line.trim();
  if (trimmed.startsWith("#")) {
    return <span className="text-[#64748B] italic font-normal">{line}</span>;
  }

  // Handle inline comments
  let mainCode = line;
  let inlineComment = "";
  const commentIdx = line.indexOf("#");
  if (commentIdx !== -1) {
    // Check if '#' is inside a string quote
    const beforeComment = line.substring(0, commentIdx);
    const quoteCountSingle = (beforeComment.match(/'/g) || []).length;
    const quoteCountDouble = (beforeComment.match(/"/g) || []).length;
    if (quoteCountSingle % 2 === 0 && quoteCountDouble % 2 === 0) {
      mainCode = line.substring(0, commentIdx);
      inlineComment = line.substring(commentIdx);
    }
  }

  // Key python keywords
  const keywords = new Set([
    "def", "class", "import", "from", "return", "if", "else", "elif",
    "for", "while", "try", "except", "finally", "with", "as", "in", "is",
    "and", "or", "not", "pass", "break", "continue", "lambda", "raise", "yield",
    "True", "False", "None"
  ]);

  const builtins = new Set([
    "print", "len", "range", "int", "str", "float", "list", "dict", "set",
    "tuple", "sum", "input", "max", "min", "abs", "round", "type", "open",
    "append", "extend", "insert", "pop", "remove", "count", "sort", "reverse"
  ]);

  // Tokenize strings, numbers, keywords, builtins, and normal text
  // Pattern matches strings, identifiers, numbers, operators
  const tokenRegex = /(".*?"|'.*?'|[a-zA-Z_]\w*|\d+(?:\.\d+)?|[^"'\w\s]+|\s+)/g;
  const tokens = mainCode.match(tokenRegex) || [mainCode];

  return (
    <>
      {tokens.map((token, index) => {
        // String literal
        if (
          (token.startsWith('"') && token.endsWith('"')) ||
          (token.startsWith("'") && token.endsWith("'"))
        ) {
          return (
            <span key={index} className="text-[#15803D] font-medium">
              {token}
            </span>
          );
        }

        // Keywords (def, import, return, etc.)
        if (keywords.has(token)) {
          return (
            <span key={index} className="text-[#1E40AF] font-bold">
              {token}
            </span>
          );
        }

        // Builtins / Standard functions
        if (builtins.has(token)) {
          return (
            <span key={index} className="text-[#C2410C] font-semibold">
              {token}
            </span>
          );
        }

        // Numeric literals
        if (/^\d+(?:\.\d+)?$/.test(token)) {
          return (
            <span key={index} className="text-[#C2410C] font-semibold">
              {token}
            </span>
          );
        }

        // Normal text / identifiers / operators
        return (
          <span key={index} className="text-slate-800">
            {token}
          </span>
        );
      })}

      {/* Render inline comment if present */}
      {inlineComment && (
        <span className="text-[#64748B] italic font-normal">{inlineComment}</span>
      )}
    </>
  );
}
