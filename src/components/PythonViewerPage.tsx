import React, { useEffect, useState } from "react";
import { Code, Lock, ShieldCheck, FileCode, CheckCircle2 } from "lucide-react";
import { ExerciseItem } from "./ExerciceDetailModal";
import BackButton from "./BackButton";

interface PythonViewerPageProps {
  exercise?: ExerciseItem | null;
  exerciseId?: string;
  onBack?: () => void;
  isPremiumUser?: boolean;
}

export default function PythonViewerPage({
  exercise: initialExercise,
  exerciseId,
  onBack,
  isPremiumUser = false
}: PythonViewerPageProps) {
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
  const fileName = activeEx?.filename || activeEx?.attachmentName || "exercice.py";
  const title = activeEx?.title || "Code Source Python";

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
      {/* Sticky Header Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs px-4 py-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Back Button & Title */}
          <div className="flex items-center gap-4">
            <BackButton onClick={handleGoBack} label="Retour" />

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
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
              <h1 className="text-base font-extrabold text-slate-900 mt-0.5 line-clamp-1">
                {title}
              </h1>
            </div>
          </div>

          {/* File Name Tag */}
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
            <FileCode size={15} className="text-emerald-600 shrink-0" />
            <span className="font-mono text-xs font-bold text-slate-700">
              {fileName}
            </span>
          </div>

        </div>
      </header>

      {/* Security Info Banner */}
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

      {/* Main Content Area - Full Page Natural Scroll */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-12 text-center text-slate-500 space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold">Chargement du code source Python...</p>
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
