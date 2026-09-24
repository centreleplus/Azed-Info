import React, { useState, useEffect, ReactNode, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, Code, CheckCircle, AlertTriangle, ArrowRight, RotateCcw, Sparkles, Crown,
  ChevronDown, ChevronUp, Maximize2, Minimize2, Sun, Moon, Home, ChevronRight, 
  Terminal, X, ArrowUpDown, Clock, Type, WrapText, Copy, Check, BookOpen, Plus 
} from "lucide-react";
import { QuizQuestion } from "../types";

// Predefined quiz questions specifically curated for high school bac sciences de l'informatique
const TUNISIAN_IT_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    question: "En Python, comment définit-on une fonction récursive pour calculer le factoriel d'un entier n ?",
    options: [
      "def fact(n):\n    return n * fact(n-1) if n > 1 else 1",
      "def fact(n):\n    return n * fact(n-1)",
      "fact = recursive(n) => n * fact(n-1)",
      "def fact(n):\n    while n > 0: fact(n-1)"
    ],
    correctIndex: 0,
    explanation: "La récursivité nécessite un cas d'arrêt. 'n * fact(n-1) if n > 1 else 1' s'arrête correctement lorsque n vaut 1 ou 0, évitant ainsi un débordement de pile."
  },
  {
    id: "q2",
    question: "Quelle méthode permet d'ajouter un élément à la fin d'une liste en Python pour le traitement d'une pile ou file au Bac ?",
    options: [
      "liste.add(element)",
      "liste.append(element)",
      "liste.push(element)",
      "liste.insert(element)"
    ],
    correctIndex: 1,
    explanation: "En Python, la méthode standard pour ajouter un élément à la fin de la structure list est append(), très pratique pour les exercices d'empilements."
  },
  {
    id: "q3",
    question: "Comment ouvrir un fichier texte en mode écriture propre avec encodage UTF-8 en algorihme/Python ?",
    options: [
      "open('bac.txt', 'r')",
      "open('bac.txt', 'w', encoding='utf-8')",
      "open('bac.txt', 'a+')",
      "open('bac.txt', mode='binary')"
    ],
    correctIndex: 1,
    explanation: "Le mode 'w' (write) écrase le fichier original s'il existe et crée un nouveau fichier propre encodé en UTF-8."
  }
];

const PYTHON_EXERCISES = [
  {
    id: 1,
    title: "Exercice : Calcul du PGCD Récursif",
    difficulty: "Facile",
    difficultyLevel: 1,
    description: "Complétez la fonction récursive pgcd(a, b) selon l'algorithme d'Euclide. Rappel: pgcd(a, b) = pgcd(b, a % b) tant que b != 0.",
    starterCode: `def pgcd(a, b):
    # Écrivez le cas d'arrêt ci-dessous
    if b == 0:
        return a
    else:
        return pgcd(b, a % b)

# Zone de Test
print("PGCD(18, 12) =", pgcd(18, 12))
print("PGCD(100, 25) =", pgcd(100, 25))
`,
    validationPattern: "PGCD(18, 12) = 6"
  },
  {
    id: 2,
    title: "Exercice : Tri à bulles (Bubble Sort)",
    difficulty: "Moyen",
    difficultyLevel: 2,
    description: "Complétez le tri d'un tableau d'entiers en Python. Cet exercice classique revient souvent au Bac Tunisien en épreuve pratique.",
    starterCode: `def tri_bulles(t):
    n = len(t)
    for i in range(n):
      for j in range(0, n-i-1):
        if t[j] > t[j+1]:
          # Échange de valeurs
          t[j], t[j+1] = t[j+1], t[j]
    return t

my_array = [64, 34, 25, 12, 22]
print("Tableau trié:", tri_bulles(my_array))
`,
    validationPattern: "Tableau trié: [12, 22, 25, 34, 64]"
  },
  {
    id: 3,
    title: "Exercice : Factorielle Récursive",
    difficulty: "Facile",
    difficultyLevel: 1,
    description: "Implémentez une fonction récursive fact(n) pour calculer le factoriel d'un entier positif n.",
    starterCode: `def fact(n):
    # Écrivez la fonction de factorielle récursive
    if n <= 1:
        return 1
    return n * fact(n-1)

# Zone de Test
print("fact(5) =", fact(5))
`,
    validationPattern: "fact(5) = 120"
  },
  {
    id: 4,
    title: "Exercice : Recherche Dichotomique",
    difficulty: "Difficile",
    difficultyLevel: 3,
    description: "Implémentez la recherche dichotomique (binaire) récursive ou itérative pour trouver l'index d'un élément dans un tableau trié t. Retournez -1 si non trouvé.",
    starterCode: `def recherche_dicho(t, x):
    gauche = 0
    droite = len(t) - 1
    while gauche <= droite:
        milieu = (gauche + droite) // 2
        if t[milieu] == x:
            return milieu
        elif t[milieu] < x:
            gauche = milieu + 1
        else:
            droite = milieu - 1
    return -1

# Zone de Test
tab = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
print("Index de 23 =", recherche_dicho(tab, 23))
print("Index de 99 =", recherche_dicho(tab, 99))
`,
    validationPattern: "Index de 23 = 5\nIndex de 99 = -1"
  },
  {
    id: 5,
    title: "Exercice : Suite de Fibonacci Récursive",
    difficulty: "Moyen",
    difficultyLevel: 2,
    description: "Implémentez la fonction récursive fibo(n) qui retourne le n-ième terme de la suite de Fibonacci. Rappel: F(0)=0, F(1)=1, F(n) = F(n-1) + F(n-2).",
    starterCode: `def fibo(n):
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    return fibo(n-1) + fibo(n-2)

# Zone de Test
print("fibo(7) =", fibo(7))
`,
    validationPattern: "fibo(7) = 13"
  }
];

function checkPythonSyntax(code: string): { isValid: boolean; error: string | null } {
  const lines = code.split("\n");
  const bracketStack: { char: string; lineNum: number }[] = [];
  const bracketPairs: Record<string, string> = {
    ")": "(",
    "]": "[",
    "}": "{"
  };

  let inTripleQuotes: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const lineNum = i + 1;
    let trimmed = rawLine.trim();

    if (inTripleQuotes) {
      const closeIndex = trimmed.indexOf(inTripleQuotes);
      if (closeIndex !== -1) {
        trimmed = trimmed.substring(closeIndex + 3).trim();
        inTripleQuotes = null;
      } else {
        continue;
      }
    }

    if (!inTripleQuotes) {
      if (trimmed.includes('"""')) {
        const first = trimmed.indexOf('"""');
        const second = trimmed.indexOf('"""', first + 3);
        if (second === -1) {
          inTripleQuotes = '"""';
          continue;
        }
      } else if (trimmed.includes("'''")) {
        const first = trimmed.indexOf("'''");
        const second = trimmed.indexOf("'''", first + 3);
        if (second === -1) {
          inTripleQuotes = "'''";
          continue;
        }
      }
    }

    const hashIndex = trimmed.indexOf("#");
    if (hashIndex !== -1) {
      trimmed = trimmed.substring(0, hashIndex).trim();
    }

    if (!trimmed) continue;

    // Build clear line without string values for regex tests
    let cleanLine = "";
    let tempInString: string | null = null;
    for (let charIndex = 0; charIndex < trimmed.length; charIndex++) {
      const char = trimmed[charIndex];
      if (tempInString) {
        if (char === tempInString && trimmed[charIndex - 1] !== "\\") {
          tempInString = null;
        }
      } else if (char === '"' || char === "'") {
        tempInString = char;
      } else {
        cleanLine += char;
      }
    }

    const cleanTrimmed = cleanLine.trim();

    if (cleanTrimmed.startsWith("function ")) {
      return { isValid: false, error: `Ligne ${lineNum}: Utilisez 'def' au lieu de 'function' pour déclarer une fonction en Python.` };
    }
    if (cleanTrimmed.startsWith("let ") || cleanTrimmed.startsWith("var ") || cleanTrimmed.startsWith("const ")) {
      return { isValid: false, error: `Ligne ${lineNum}: Les déclarations de variables avec '${cleanTrimmed.split(/\s+/)[0]}' ne sont pas valides en Python.` };
    }
    if (/\b(let|const|var)\b\s+\w+\s*=/.test(cleanTrimmed)) {
      return { isValid: false, error: `Ligne ${lineNum}: Déclaration de variable de style JavaScript détectée.` };
    }
    if (cleanTrimmed.endsWith("{")) {
      return { isValid: false, error: `Ligne ${lineNum}: En Python, utilisez un symbole deux-points ':' et l'indentation plutôt que des accolades '{ }'.` };
    }
    if (cleanTrimmed.includes("&&")) {
      return { isValid: false, error: `Ligne ${lineNum}: Utilisez l'opérateur 'and' à la place de '&&' en Python.` };
    }
    if (cleanTrimmed.includes("||")) {
      return { isValid: false, error: `Ligne ${lineNum}: Utilisez l'opérateur 'or' à la place de '||' en Python.` };
    }
    
    const exclaimMatch = cleanTrimmed.match(/(?<![a-zA-Z0-9_])!(?!=)/);
    if (exclaimMatch) {
      return { isValid: false, error: `Ligne ${lineNum}: Utilisez l'opérateur 'not' au lieu de '!' pour la négation en Python.` };
    }

    const blockKeywords = ["def", "if", "elif", "else", "for", "while", "try", "except", "class", "with"];
    const words = cleanTrimmed.split(/\s+/);
    if (blockKeywords.includes(words[0])) {
      if (!cleanTrimmed.endsWith(":")) {
        return { isValid: false, error: `Ligne ${lineNum}: Le bloc '${words[0]}' doit se terminer par un symbole deux-points ':'.` };
      }
    }

    let inString: string | null = null;
    for (let charIndex = 0; charIndex < trimmed.length; charIndex++) {
      const char = trimmed[charIndex];
      if (inString) {
        if (char === inString && trimmed[charIndex - 1] !== "\\") {
          inString = null;
        }
      } else if (char === '"' || char === "'") {
        inString = char;
      } else if (["(", "[", "{"].includes(char)) {
        bracketStack.push({ char, lineNum });
      } else if ([")", "]", "}"].includes(char)) {
        const last = bracketStack.pop();
        if (!last) {
          return { isValid: false, error: `Ligne ${lineNum}: Caractère de fermeture '${char}' inattendu.` };
        }
        if (last.char !== bracketPairs[char]) {
          return { isValid: false, error: `Ligne ${lineNum}: Parenthèse/crochet discordant. '${char}' ferme un '${last.char}' ouvert à la ligne ${last.lineNum}.` };
        }
      }
    }
    if (inString) {
      return { isValid: false, error: `Ligne ${lineNum}: Chaîne de caractères non fermée.` };
    }
  }

  if (bracketStack.length > 0) {
    const unclosed = bracketStack[bracketStack.length - 1];
    return { isValid: false, error: `Ligne ${unclosed.lineNum}: Parenthèse/crochet '${unclosed.char}' non fermé.` };
  }

  if (inTripleQuotes) {
    return { isValid: false, error: "Commentaire multiligne ou chaîne triple-guillemets non fermée." };
  }

  return { isValid: true, error: null };
}

function parseBoldText(text: string): React.ReactNode[] {
  const parts = text.split("**");
  return parts.flatMap((part, i) => {
    if (i % 2 === 1) {
      return [<strong key={`bold-${i}`} className="font-extrabold text-slate-900 dark:text-white">{part}</strong>];
    }
    // Parse inline code like `code`
    const inlineParts = part.split("`");
    return inlineParts.map((subPart, j) => {
      if (j % 2 === 1) {
        return <code key={`inline-${i}-${j}`} className="px-1 py-0.5 rounded bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 font-mono text-[10px]">{subPart}</code>;
      }
      return subPart;
    });
  });
}

function renderFormattedContent(text: string): React.ReactNode {
  const parts = text.split("```");
  return (
    <>
      {parts.map((part, index) => {
        // Odd indices are code blocks
        if (index % 2 === 1) {
          // Extract language if specified, e.g. "python\n..."
          const firstNewLine = part.indexOf("\n");
          let lang = "python";
          let code = part;
          if (firstNewLine !== -1) {
            const potentialLang = part.substring(0, firstNewLine).trim();
            if (potentialLang === "python" || potentialLang === "py") {
              lang = "python";
              code = part.substring(firstNewLine + 1);
            } else {
              code = part;
            }
          }
          return (
            <div key={index} className="my-3 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto relative">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 text-[10px] text-slate-450 uppercase font-bold border-b border-slate-700 select-none">
                <span>{lang} code</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(code.trim());
                    alert("Code copié dans le presse-papiers !");
                  }}
                  className="px-1.5 py-0.5 rounded-sm hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[9px]"
                >
                  Copier
                </button>
              </div>
              <pre className="p-3 leading-relaxed whitespace-pre overflow-x-auto select-all"><code>{code.trim()}</code></pre>
            </div>
          );
        } else {
          // Regular text. Split by newlines.
          const lines = part.split("\n");
          return lines.map((line, lineIdx) => {
            // Handle headers like ### or ##
            if (line.startsWith("### ")) {
              return <h4 key={`${index}-${lineIdx}`} className="text-xs font-extrabold text-slate-900 dark:text-white mt-4 mb-1.5">{line.replace("### ", "")}</h4>;
            }
            if (line.startsWith("## ")) {
              return <h3 key={`${index}-${lineIdx}`} className="text-sm font-extrabold text-[#0F1E36] dark:text-slate-100 mt-5 mb-2 border-b border-gray-150 dark:border-slate-800 pb-1">{line.replace("## ", "")}</h3>;
            }
            if (line.startsWith("# ")) {
              return <h2 key={`${index}-${lineIdx}`} className="text-base font-extrabold text-[#0F1E36] dark:text-slate-100 mt-6 mb-3">{line.replace("# ", "")}</h2>;
            }
            if (line.startsWith("- ") || line.startsWith("* ")) {
              return (
                <ul key={`${index}-${lineIdx}`} className="list-disc pl-5 my-1 text-xs text-gray-750 dark:text-slate-300 leading-relaxed">
                  <li>{parseBoldText(line.substring(2))}</li>
                </ul>
              );
            }
            if (line.startsWith("> ")) {
              return (
                <blockquote key={`${index}-${lineIdx}`} className="border-l-4 border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-r-lg my-2 text-xs text-amber-900 dark:text-amber-250 italic font-medium leading-relaxed">
                  {parseBoldText(line.substring(2))}
                </blockquote>
              );
            }
            if (!line.trim()) return <div key={`${index}-${lineIdx}`} className="h-1.5" />;
            return <p key={`${index}-${lineIdx}`} className="text-xs text-gray-750 dark:text-slate-350 leading-relaxed my-1.5">{parseBoldText(line)}</p>;
          });
        }
      })}
    </>
  );
}

const PYTHON_SNIPPETS = [
  {
    id: "loop_for",
    title: "Boucle Pour (for)",
    desc: "Répéter N fois ou parcourir un intervalle",
    code: `# Boucle pour répéter 5 fois\nfor i in range(5):\n    print("Répétition n°", i)\n`
  },
  {
    id: "loop_while",
    title: "Boucle Tant Que (while)",
    desc: "Répéter tant qu'une condition est vraie",
    code: `# Boucle tant que\ncompteur = 0\nwhile compteur < 5:\n    print("Compteur :", compteur)\n    compteur += 1\n`
  },
  {
    id: "func_recursive",
    title: "Fonction Récursive",
    desc: "Fonction récursive (essentielle au Bac)",
    code: `# Somme des entiers de 1 à n\ndef somme_recursive(n):\n    if n == 0:\n        return 0\n    return n + somme_recursive(n - 1)\n\nprint("Somme(5) =", somme_recursive(5))\n`
  },
  {
    id: "conditions",
    title: "Conditions (if, elif, else)",
    desc: "Prendre des décisions logiques",
    code: `# Structure de décision\nnote = 15.5\nif note >= 16:\n    print("Mention Très Bien")\nelif note >= 12:\n    print("Mention Assez Bien")\nelse:\n    print("Passable")\n`
  },
  {
    id: "list_ops",
    title: "Listes (Tableaux)",
    desc: "Ajouter, supprimer et trier",
    code: `# Manipulation de liste\nt = [14, 18, 10]\nt.append(16)   # Ajoute 16 à la fin\nt.sort()       # Trie par ordre croissant\nprint("Tableau trié :", t)\n`
  },
  {
    id: "files_io",
    title: "Fichiers (Lecture/Écriture)",
    desc: "Ouvrir et écrire dans un fichier",
    code: `# Écriture propre avec UTF-8\nwith open("bac.txt", "w", encoding="utf-8") as f:\n    f.write("Bienvenue sur A-Zed Info !")\n`
  }
];

interface SandboxPythonProps {
  userId: string;
  theme: "light" | "dark";
  onStatsUpdated: (accuracy: number, progress: number, newlyUnlocked?: any[]) => void;
  mode?: "all" | "qcm" | "compiler";
  isDescriptionExpanded?: boolean;
  onDescriptionExpandedChange?: (expanded: boolean) => void;
  isInstructionsMaximized?: boolean;
  onInstructionsMaximizedChange?: (maximized: boolean) => void;
  resetCodeTrigger?: number;
  formatCodeTrigger?: number;
  saveCodeTrigger?: number;
  isConsoleOpen?: boolean;
  onConsoleOpenChange?: (open: boolean) => void;
  onSyntaxChange?: (status: { isValid: boolean; error: string | null }) => void;
  onExerciseChange?: (index: number) => void;
  userRole?: string;
  userTier?: "freemium" | "pro" | string;
  sharedCodeString?: string;
}

export default function SandboxPython({ 
  userId, 
  theme, 
  onStatsUpdated, 
  mode = "all",
  isDescriptionExpanded: externalIsDescriptionExpanded,
  onDescriptionExpandedChange,
  isInstructionsMaximized: externalIsInstructionsMaximized,
  onInstructionsMaximizedChange,
  resetCodeTrigger,
  formatCodeTrigger,
  saveCodeTrigger,
  isConsoleOpen,
  onConsoleOpenChange,
  onSyntaxChange,
  onExerciseChange,
  userRole,
  userTier = "freemium",
  sharedCodeString = ""
}: SandboxPythonProps) {
  
  // Refs for editor scroll synchronization and terminal auto-scroll
  const lineRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLPreElement>(null);

  // QCM States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScores, setQuizScores] = useState<boolean[]>([]);

  // Editor States
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sourceCode, setSourceCode] = useState(() => {
    if (sharedCodeString && sharedCodeString.trim() !== "") {
      return sharedCodeString;
    }
    return `print("Hello, A-Zed Info!")`;
  });
  const [savedCodes, setSavedCodes] = useState<Record<number, string>>({});
  const [consoleOutput, setConsoleOutput] = useState("Le résultat du terminal s'affichera ici...");
  const [isRunning, setIsRunning] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  // Completion Tracking for Sandbox Exercises
  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`completed_exercises_${userId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Sort criteria state: "none" | "difficulty" | "completion"
  const [sortCriteria, setSortCriteria] = useState<"none" | "difficulty" | "completion">("none");
  const [snippetsExpanded, setSnippetsExpanded] = useState(false);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [editorTheme, setEditorTheme] = useState<"light" | "dark">("light");
  const [syntaxStatus, setSyntaxStatus] = useState<{ isValid: boolean; error: string | null }>({ isValid: true, error: null });
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "waiting" | "saving">("saved");
  const [editorFontSize, setEditorFontSize] = useState<"small" | "medium" | "large">("medium");
  const [fontSizeDropdownOpen, setFontSizeDropdownOpen] = useState(false);
  const [wordWrap, setWordWrap] = useState<boolean>(true);

  // Font size state for sandbox instructions on the fly
  const [instructionFontSize, setInstructionFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("sandbox_instruction_font_size");
      return saved ? Number(saved) : 13;
    } catch {
      return 13;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sandbox_instruction_font_size", String(instructionFontSize));
    } catch (e) {
      console.error("Failed to save instruction font size", e);
    }
  }, [instructionFontSize]);

  // Font family state for sandbox instructions on the fly
  const [instructionFontFamily, setInstructionFontFamily] = useState<"sans-serif" | "serif" | "monospace">(() => {
    try {
      const saved = localStorage.getItem("sandbox_instruction_font_family");
      return (saved as "sans-serif" | "serif" | "monospace") || "sans-serif";
    } catch {
      return "sans-serif";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sandbox_instruction_font_family", instructionFontFamily);
    } catch (e) {
      console.error("Failed to save instruction font family", e);
    }
  }, [instructionFontFamily]);

  // Controlled & Uncontrolled local state for instruction panel maximization
  const [localIsInstructionsMaximized, setLocalIsInstructionsMaximized] = useState(false);
  const isInstructionsMaximized = externalIsInstructionsMaximized !== undefined 
    ? externalIsInstructionsMaximized 
    : localIsInstructionsMaximized;
  const setIsInstructionsMaximized = onInstructionsMaximizedChange || setLocalIsInstructionsMaximized;

  // AI Walkthrough Drawer states
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiDrawerContent, setAiDrawerContent] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Sync scroll for editor and line numbers
  const handleScroll = () => {
    if (textareaRef.current) {
      if (lineRef.current) {
        lineRef.current.scrollTop = textareaRef.current.scrollTop;
      }
      if (highlightRef.current) {
        highlightRef.current.scrollTop = textareaRef.current.scrollTop;
        highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
      }
    }
  };

  // Auto-scroll terminal to bottom when consoleOutput or isRunning changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [consoleOutput, isRunning]);

  const handleAiExplain = async () => {
    setIsAiDrawerOpen(true);
    setIsAiLoading(true);
    setAiDrawerContent("L'Assistant d'Intelligence Artificielle de la plateforme A-Zed Info analyse l'exercice, votre code source et prépare un guide d'explication pédagogique pas à pas...");

    const currentExercise = PYTHON_EXERCISES[currentExerciseIndex];
    const promptMessage = `Tu es l'enseignant expert d'informatique de la plateforme "A-Zed Info".
Explique-moi de manière très pédagogique et structurée comment résoudre l'exercice suivant :

📌 Exercice : ${currentExercise.title}
🔥 Difficulté : ${currentExercise.difficulty} (Niveau ${currentExercise.difficultyLevel})
📝 Description : ${currentExercise.description}
💻 Code initial de départ :
\`\`\`python
${currentExercise.starterCode}
\`\`\`

Voici mon code actuel écrit dans l'éditeur :
\`\`\`python
${sourceCode}
\`\`\`

Rédige un guide complet de résolution en français :
1. **Compréhension du problème** : Explique brièvement ce qui est demandé.
2. **Analyse de la logique & Algorithme** : Les étapes logiques, boucles ou conditions nécessaires.
3. **Indices pédagogiques** : Aide-moi à comprendre sans me donner immédiatement la solution brute si mon code est incomplet.
4. **Code Solution Recommandé** : Écris le code Python propre et optimal, entièrement commenté pour que je comprenne chaque ligne.
5. **Erreurs fréquentes** : Les pièges classiques de cet exercice au Bac Tunisien.

Sois très encourageant, utilise des émojis pertinents et structure parfaitement ta réponse avec des titres ## et des blocs de code.`;

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: promptMessage })
      });
      if (!response.ok) {
        throw new Error("Impossible de se connecter au serveur d'IA.");
      }
      const data = await response.json();
      setAiDrawerContent(data.reply || "Aucune réponse générée par l'IA.");
    } catch (err: any) {
      console.error("AI explanation failed:", err);
      setAiDrawerContent(`Désolé, une erreur s'est produite lors de la connexion à l'Intelligence Artificielle.
      
Veuillez vérifier votre connexion réseau ou réessayer dans quelques instants.
      
[Erreur de communication : ${err.message || err}]`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const [internalIsDescriptionExpanded, setInternalIsDescriptionExpanded] = useState(true);
  const isDescriptionExpanded = externalIsDescriptionExpanded !== undefined ? externalIsDescriptionExpanded : internalIsDescriptionExpanded;
  const setIsDescriptionExpanded = onDescriptionExpandedChange || setInternalIsDescriptionExpanded;

  // QCM Questions
  const currentQuestion = TUNISIAN_IT_QUIZ[currentQuestionIndex];

  const handleOptionSelect = (index: number) => {
    if (quizSubmitted) return;
    setSelectedOption(index);
  };

  const handleVerifyQcm = () => {
    if (selectedOption === null || quizSubmitted) return;
    
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    const newScores = [...quizScores];
    newScores[currentQuestionIndex] = isCorrect;
    setQuizScores(newScores);
    setQuizSubmitted(true);

    // Update Platform-wide statistics
    const totalAnswered = newScores.filter((s) => s !== undefined).length;
    const totalCorrect = newScores.filter((s) => s === true).length;
    const currentAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    const currentProgress = Math.round((totalAnswered / TUNISIAN_IT_QUIZ.length) * 100);
    
    onStatsUpdated(currentAccuracy, currentProgress);
  };

  const handleNextQcm = () => {
    setSelectedOption(null);
    setQuizSubmitted(false);
    if (currentQuestionIndex < TUNISIAN_IT_QUIZ.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Loop back to beginning for endless practice
      setCurrentQuestionIndex(0);
    }
  };

  const handleResetExerciseCode = () => {
    if (sharedCodeString && sharedCodeString.trim() !== "") {
      setSourceCode(sharedCodeString);
      setConsoleOutput("Code réinitialisé au fichier partagé.");
    } else {
      setSourceCode(PYTHON_EXERCISES[currentExerciseIndex].starterCode);
      setConsoleOutput("Code de départ réinitialisé. Écrivez votre algorithme...");
    }
    setIsSuccess(null);
    setExecutionTime(null);
  };

  const handleInsertSnippet = (code: string) => {
    const textarea = document.getElementById("python-code-editor") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const originalText = sourceCode;
      const newText = originalText.substring(0, start) + code + originalText.substring(end);
      setSourceCode(newText);
      
      const cursorPosition = start + code.length;
      // Refocus textarea and position cursor
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = cursorPosition;
      }, 50);
    } else {
      setSourceCode((prev) => prev + "\n" + code);
    }
  };

  const handleCopySnippet = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetId(id);
    setTimeout(() => {
      setCopiedSnippetId(null);
    }, 1500);
  };

  const handleFormatCode = () => {
    // Elegant automatic indent / strip formatting for Python code blocks
    const lines = sourceCode.split("\n");
    let indentLevel = 0;
    
    // 1. Clean whitespace
    const formattedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      
      const leadingMatch = line.match(/^([ \t]*)/);
      const leadingSpaces = leadingMatch ? leadingMatch[1].length : 0;
      return line;
    });

    // Remove trailing and consecutive empty lines (allow at most one consecutive empty line)
    const resultLines: string[] = [];
    for (let i = 0; i < formattedLines.length; i++) {
      const line = formattedLines[i];
      if (line === "") {
        if (resultLines.length > 0 && resultLines[resultLines.length - 1] !== "") {
          resultLines.push("");
        }
      } else {
        resultLines.push(line);
      }
    }

    while (resultLines.length > 0 && resultLines[resultLines.length - 1] === "") {
      resultLines.pop();
    }

    const formattedCode = resultLines.join("\n");
    setSourceCode(formattedCode);
    setConsoleOutput("Code formaté automatiquement selon les conventions PEP 8.");
  };

  const handleSaveCode = () => {
    if (!userId) return;
    setConsoleOutput("Sauvegarde du code sur votre profil en cours...");
    fetch("/api/student/save-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        exerciseIndex: currentExerciseIndex,
        code: sourceCode
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSavedCodes((prev) => ({
            ...prev,
            [currentExerciseIndex]: sourceCode
          }));
          setConsoleOutput("Code sauvegardé avec succès dans votre profil sur le serveur !");
          alert("Votre code a été sauvegardé avec succès dans votre profil !");
        } else {
          setConsoleOutput(`Erreur de sauvegarde: ${data.msg}`);
        }
      })
      .catch((err) => {
        console.error("Error saving code:", err);
        setConsoleOutput("Erreur lors de la sauvegarde du code sur le serveur.");
      });
  };

  // Shared code listener
  useEffect(() => {
    if (sharedCodeString && sharedCodeString.trim() !== "") {
      setSourceCode(sharedCodeString);
      setConsoleOutput("Fichier Python partagé chargé avec succès. Vous pouvez maintenant l'exécuter !");
    }
  }, [sharedCodeString]);

  useEffect(() => {
    if (formatCodeTrigger !== undefined && formatCodeTrigger > 0) {
      handleFormatCode();
    }
  }, [formatCodeTrigger]);

  useEffect(() => {
    if (saveCodeTrigger !== undefined && saveCodeTrigger > 0) {
      handleSaveCode();
    }
  }, [saveCodeTrigger]);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/student/get-code/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.savedPythonCode) {
          setSavedCodes(data.savedPythonCode);
          if (sharedCodeString && sharedCodeString.trim() !== "") {
            // Priority is sharedCodeString
            return;
          }
          if (data.savedPythonCode[currentExerciseIndex] !== undefined) {
            setSourceCode(data.savedPythonCode[currentExerciseIndex]);
          }
        }
      })
      .catch((err) => console.error("Error loading saved code:", err));
  }, [userId]);

  useEffect(() => {
    const status = checkPythonSyntax(sourceCode);
    setSyntaxStatus(status);
    onSyntaxChange?.(status);
  }, [sourceCode, onSyntaxChange]);

  useEffect(() => {
    // If there are no unsaved changes, status is "saved"
    const hasChanges = savedCodes[currentExerciseIndex] !== undefined 
      ? sourceCode !== savedCodes[currentExerciseIndex]
      : sourceCode !== PYTHON_EXERCISES[currentExerciseIndex].starterCode;

    if (!hasChanges) {
      setAutoSaveStatus("saved");
      return;
    }

    // Otherwise, we are waiting for save trigger / debounce timeout to finish
    setAutoSaveStatus("waiting");

    const timer = setTimeout(() => {
      if (!userId) return;
      setAutoSaveStatus("saving");
      
      fetch("/api/student/save-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          exerciseIndex: currentExerciseIndex,
          code: sourceCode
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setSavedCodes((prev) => ({
              ...prev,
              [currentExerciseIndex]: sourceCode
            }));
            setAutoSaveStatus("saved");
          } else {
            setAutoSaveStatus("waiting");
          }
        })
        .catch((err) => {
          console.error("Autosave error:", err);
          setAutoSaveStatus("waiting");
        });
    }, 2000); // 2 seconds debounce

    return () => clearTimeout(timer);
  }, [sourceCode, currentExerciseIndex, userId, savedCodes]);

  useEffect(() => {
    onExerciseChange?.(currentExerciseIndex);
  }, [currentExerciseIndex, onExerciseChange]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl + M (or Cmd + M on Mac)
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "m") {
        event.preventDefault();
        setIsMaximized((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleChangeExercise = (idx: number) => {
    setCurrentExerciseIndex(idx);
    if (savedCodes[idx] !== undefined) {
      setSourceCode(savedCodes[idx]);
    } else {
      setSourceCode(PYTHON_EXERCISES[idx].starterCode);
    }
    setConsoleOutput("Nouveau défi chargé. Complétez le programme...");
    setIsSuccess(null);
    setExecutionTime(null);
  };

  const handleRunPython = async () => {
    setIsRunning(true);
    setConsoleOutput("Compilation et exécution sur le serveur sécurisé en cours...");
    onConsoleOpenChange?.(true);
    setExecutionTime(null);

    const startTime = performance.now();

    try {
      const response = await fetch("/api/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: sourceCode })
      });

      const result = await response.json();
      
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);
      setExecutionTime(elapsed);
      
      const stdout = result.run?.stdout || "";
      const stderr = result.run?.stderr || "";

      if (stderr) {
        setConsoleOutput(`[ERREUR PYTHON]\n${stderr}`);
        setIsSuccess(false);
      } else {
        setConsoleOutput(stdout || "[Aucun signal renvoyé (output vide)]");
        
        // Simple automatic grading based on validation patterns provided
        const expectedPattern = PYTHON_EXERCISES[currentExerciseIndex].validationPattern;
        if (stdout.includes(expectedPattern)) {
          setIsSuccess(true);
          // Set as completed and persist to localStorage
          setCompletedExercises((prev) => {
            const next = { ...prev, [currentExerciseIndex]: true };
            try {
              localStorage.setItem(`completed_exercises_${userId}`, JSON.stringify(next));
            } catch (err) {
              console.error("Failed to save completed exercises", err);
            }
            return next;
          });
          
          // Trigger platforms statistics updaters
          onStatsUpdated(100, Math.round(((Object.keys(completedExercises).length + 1) / PYTHON_EXERCISES.length) * 100));
        } else {
          setIsSuccess(false);
        }
      }
    } catch (err: any) {
      console.error("Compilation error:", err);
      setConsoleOutput(`[ERREUR DE SERVEUR]\nImpossible de joindre le service de compilation Piston.\nDétails : ${err.message || err}`);
      setIsSuccess(false);
    } finally {
      setIsRunning(false);
    }
  };

  const exercisesWithIndex = PYTHON_EXERCISES.map((ex, idx) => ({
    exercise: ex,
    originalIndex: idx
  }));

  // Sorted list based on sortCriteria
  const sortedExercises = [...exercisesWithIndex].sort((a, b) => {
    if (sortCriteria === "difficulty") {
      return a.exercise.difficultyLevel - b.exercise.difficultyLevel;
    }
    if (sortCriteria === "completion") {
      const aDone = completedExercises[a.originalIndex] ? 1 : 0;
      const bDone = completedExercises[b.originalIndex] ? 1 : 0;
      return aDone - bDone;
    }
    return 0;
  });

  const fontSizeClass = 
    editorFontSize === "small" 
      ? "text-[11px] sm:text-xs" 
      : editorFontSize === "medium" 
        ? "text-xs sm:text-sm" 
        : "text-sm sm:text-base";

  return (
    <div className="flex flex-col gap-4 text-left w-full">
      {/* Breadcrumb Trail without Pulsing auto-save status indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-[#64748B] font-medium py-1 px-1 select-none">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 hover:text-[#10B981] transition-colors cursor-pointer">
            <Home size={13} className="shrink-0 text-slate-400" />
            <span>Accueil</span>
          </div>
          <ChevronRight size={10} className="text-[#94A3B8] shrink-0" />
          <span className="hover:text-[#10B981] transition-colors cursor-pointer">Espace Épreuves</span>
          <ChevronRight size={10} className="text-[#94A3B8] shrink-0" />
          <span className="text-[#334155] font-semibold">Python Sandbox</span>
        </div>
      </div>

      <div 
        id="sandbox-container" 
        className={`grid ${mode === "all" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-6 p-1 bg-white text-[#1F2937]`}
      >
      
      {/* LEFT SIDE: MULTIPLE CHOICE QUESTION (QCM) & COMPREHENSION */}
      {(mode === "all" || mode === "qcm") && (
        <div
          id="qcm-widget-panel"
          className={`rounded-2xl border border-[#E5E7EB] bg-white flex flex-col justify-between hover:shadow-xs transition-shadow ${
            mode === "qcm" ? "p-6 sm:p-8 md:p-10 min-h-[550px] w-full" : "p-5"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-1 rounded">
                Évaluation d'Algorithmique
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                Question {currentQuestionIndex + 1} sur {TUNISIAN_IT_QUIZ.length}
              </span>
            </div>

            <h3 className={`font-semibold text-[#0F1E36] mb-5 leading-normal ${mode === "qcm" ? "text-base" : "text-sm"}`}>
              {currentQuestion.question}
            </h3>

            <div className={`space-y-3 ${mode === "qcm" ? "max-w-4xl mx-auto w-full" : ""}`}>
              {currentQuestion.options.map((option, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = selectedOption === idx;
                
                let optionStyle = "border-[#E5E7EB] hover:bg-gray-50 text-gray-700";
                if (isSelected) {
                  optionStyle = "border-[#10B981] bg-[#10B981]/5 text-[#10B981] font-medium";
                }
                if (quizSubmitted) {
                  if (idx === currentQuestion.correctIndex) {
                    optionStyle = "border-[#10B981] bg-[#10B981]/10 text-[#10B981] font-semibold";
                  } else if (isSelected) {
                    optionStyle = "border-[#EF4444] bg-[#EF4444]/5 text-[#EF4444]";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={quizSubmitted}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs flex items-start gap-3 transition-colors cursor-pointer ${optionStyle}`}
                  >
                    <span className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center font-bold text-[10px] shrink-0 border border-[#E5E7EB]">
                      {letter
                    }</span>
                    <pre className="font-mono text-[10px] sm:text-[11px] overflow-x-auto whitespace-pre-wrap flex-1 leading-normal text-left">
                      {option}
                    </pre>
                  </button>
                );
              })}
            </div>

            {/* Explanation Banner */}
            {quizSubmitted && (
              <div className={`mt-5 p-4 rounded-xl bg-orange-50/50 border border-orange-100 text-[11px] sm:text-xs leading-relaxed ${mode === "qcm" ? "max-w-4xl mx-auto w-full" : ""}`}>
                <div className="flex items-center gap-1.5 font-semibold text-orange-850 mb-1">
                  <Sparkles size={13} className="text-[#10B981]" />
                  <span>Explication de l'Épreuve :</span>
                </div>
                <p className="text-gray-550">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>

          <div className={`mt-8 pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs ${mode === "qcm" ? "max-w-4xl mx-auto w-full" : ""}`}>
            <div className="text-[11px] font-mono text-gray-400">
              {quizScores.length > 0 && (
                <span>Scores: {quizScores.filter(s => s).length}/{quizScores.length} corrects</span>
              )}
            </div>

            {!quizSubmitted ? (
              <button
                onClick={handleVerifyQcm}
                disabled={selectedOption === null}
                className="px-6 py-2 bg-[#10B981] hover:bg-[#0da673] disabled:opacity-40 text-white font-bold rounded-xl tracking-wide cursor-pointer transition-all flex items-center gap-1.5"
              >
                <span>Valider l'Évaluation</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                onClick={handleNextQcm}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl tracking-wide cursor-pointer transition-all flex items-center gap-1.5"
              >
                <span>Question Suivante</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* RIGHT SIDE: LIVE PYTHON TERMINAL EDITOR & PISTON CODE PROXY */}
      {(mode === "all" || mode === "compiler") && (
        <div
          id="python-sandbox-panel"
          className={`bg-white dark:bg-slate-900 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
            isMaximized
              ? "fixed inset-0 z-50 p-6 sm:p-8 overflow-y-auto bg-white dark:bg-slate-900"
              : `rounded-2xl border border-[#E5E7EB] dark:border-slate-800 hover:shadow-xs ${
                  mode === "compiler" ? "p-6 sm:p-8 min-h-[600px] w-full" : "p-5"
                }`
          }`}
        >
          <div>
            {/* Controls Bar Above Compiler with Prominent Execution Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-5 border-b border-gray-150 dark:border-slate-800">
              <div className="flex flex-col gap-1 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <Code size={18} className="text-[#10B981]" />
                  <span className="font-extrabold text-[#0F1E36] dark:text-white text-sm sm:text-base">Python Sandbox Tunisien</span>
                  
                  {/* User Access Tier Indicator with Access Validation */}
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                    userTier === "pro" 
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900" 
                      : "bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900"
                  }`}>
                    {userTier === "pro" ? (
                      <Crown size={12} className="text-amber-500 fill-amber-300 shrink-0" />
                    ) : (
                      <Sparkles size={12} className="text-emerald-600 shrink-0" />
                    )}
                    <span>Statut : {userTier === "pro" ? "Licence Pro" : "Licence Freemium"}</span>
                    <span className="text-[9px] font-medium opacity-85">(Accès Illimité)</span>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-slate-400 font-medium flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span>Défi : <strong className="text-amber-700 dark:text-amber-400 font-semibold">{PYTHON_EXERCISES[currentExerciseIndex].title.replace("Exercice : ", "")}</strong></span>
                  <span className="text-gray-300 dark:text-slate-700">|</span>
                  <span className="text-gray-450">Pratique Tunisienne Bac</span>
                </div>
              </div>

              {/* Prominent Execution Actions */}
              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <motion.button
                  type="button"
                  id="run-code-btn"
                  onClick={handleRunPython}
                  disabled={isRunning}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-2.5 rounded-xl bg-[#10B981] text-white hover:bg-[#0da673] font-bold text-xs flex items-center gap-2 transition-all shadow-sm hover:shadow-md disabled:opacity-45 cursor-pointer"
                >
                  {isRunning ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Exécution...</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} className="fill-current" />
                      <span>Exécuter (Ctrl+Enter)</span>
                    </>
                  )}
                </motion.button>

                <button
                  onClick={handleResetExerciseCode}
                  disabled={isRunning}
                  className="px-3.5 py-2.5 rounded-xl text-gray-500 hover:text-gray-700 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 border border-gray-200 dark:border-slate-750 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Réinitialiser l'exercice"
                >
                  <RotateCcw size={13} />
                  <span className="hidden sm:inline">Réinitialiser</span>
                </button>
              </div>
            </div>

            {/* SPLIT-PANE COMPILER CONTAINER */}
            <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full flex-1">
              
              {/* LEFT PANE: Code Editor with synchronized line numbers column */}
              <div className="flex-1 flex flex-col gap-4 min-w-[280px]">

                {/* The Editor Container */}
                <div className={`relative rounded-xl overflow-hidden border flex flex-col flex-1 transition-colors duration-300 ${
                  editorTheme === "dark" ? "border-slate-700 bg-slate-900" : "border-[#E5E7EB] bg-white"
                }`}>
                  {/* Editor Toolbar Header */}
                  <div className={`px-4 py-2.5 text-[10px] font-mono border-b transition-colors duration-300 flex items-center justify-between ${
                    editorTheme === "dark" ? "bg-[#0B1329] text-slate-400 border-slate-700" : "bg-[#F9FAFB] text-gray-400 border-[#E5E7EB]"
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-500 font-bold">🐍</span>
                      <span className="font-semibold text-gray-700 dark:text-slate-350">main.py</span>
                    </div>
                  </div>

                  {/* Real-time Syntax Error Alert Bar */}
                  {!syntaxStatus.isValid && syntaxStatus.error && (
                    <div className="px-4 py-2 bg-red-50/50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/30 text-red-600 dark:text-rose-400 text-xs flex items-center gap-2 font-semibold select-none">
                      <AlertTriangle size={14} className="shrink-0 text-red-500 animate-pulse" />
                      <span>{syntaxStatus.error}</span>
                    </div>
                  )}

                  {/* Synchronized Line Numbers + Textarea block */}
                  <div className="flex flex-1 relative items-stretch min-h-[350px] overflow-hidden">
                    <div 
                      ref={lineRef}
                      className={`w-10 border-r text-right pr-2 select-none py-4 font-mono text-xs overflow-hidden leading-relaxed shrink-0 transition-colors duration-300 ${
                        editorTheme === "dark" 
                          ? "bg-[#0B0F19] text-slate-500 border-slate-800" 
                          : "bg-gray-50 text-gray-400 border-gray-150"
                      }`}
                      style={{ height: "100%", lineHeight: "24px" }}
                    >
                      {Array.from({ length: Math.max(1, sourceCode.split("\n").length) }).map((_, i) => (
                        <div key={i} className="h-6 flex items-center justify-end pr-0.5">{i + 1}</div>
                      ))}
                    </div>

                    <div className="flex-1 relative overflow-hidden h-full">
                      {/* Highlight layer */}
                      <div
                        ref={highlightRef}
                        className={`absolute inset-0 pt-4 pb-4 pl-4 pr-12 font-mono ${fontSizeClass} overflow-hidden pointer-events-none transition-colors duration-300 ${
                          editorTheme === "dark" ? "text-[#34D399]" : "text-[#1F2937]"
                        }`}
                        style={{
                          lineHeight: "24px",
                          whiteSpace: wordWrap ? "pre-wrap" : "pre",
                          wordBreak: "break-all",
                        }}
                      >
                        {sourceCode.split("\n").map((lineText, index) => {
                          const lineNum = index + 1;
                          // Check if this line has a syntax error
                          const isErrorLine = !syntaxStatus.isValid && syntaxStatus.error?.startsWith(`Ligne ${lineNum}:`);

                          return (
                            <div
                              key={index}
                              className={`min-h-[24px] ${
                                isErrorLine
                                  ? "underline decoration-wavy decoration-red-500 decoration-2 bg-red-500/10 font-semibold"
                                  : ""
                              }`}
                              style={{ lineHeight: "24px" }}
                            >
                              {lineText || "\u200B"}
                            </div>
                          );
                        })}
                      </div>

                      {/* Transparent interactive textarea */}
                      <textarea
                        ref={textareaRef}
                        onScroll={handleScroll}
                        id="python-code-editor"
                        value={sourceCode}
                        onChange={(e) => setSourceCode(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Tab") {
                            e.preventDefault();
                            const start = e.currentTarget.selectionStart;
                            const end = e.currentTarget.selectionEnd;
                            const newValue = sourceCode.substring(0, start) + "    " + sourceCode.substring(end);
                            setSourceCode(newValue);
                            setTimeout(() => {
                              if (e.currentTarget) {
                                e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4;
                              }
                            }, 0);
                          }
                          
                          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                            e.preventDefault();
                            if (!isRunning) {
                              handleRunPython();
                            }
                          }

                          if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "r") {
                            e.preventDefault();
                            if (!isRunning) {
                              handleResetExerciseCode();
                            }
                          }
                        }}
                        className={`absolute inset-0 pt-4 pb-4 pl-4 pr-12 font-mono ${fontSizeClass} focus:outline-hidden resize-none leading-relaxed transition-colors duration-300 bg-transparent text-transparent caret-current h-full w-full ${
                          wordWrap ? "whitespace-pre-wrap overflow-y-auto" : "whitespace-pre overflow-y-auto"
                        }`}
                        style={{
                          lineHeight: "24px",
                          caretColor: editorTheme === "dark" ? "#10B981" : "#0F1E36",
                        }}
                        wrap={wordWrap ? "soft" : "off"}
                        spellCheck="false"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT PANE: The Sleek Output Terminal & Tunisia Bac Guide Info */}
              <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col gap-4">
                {/* Black terminal window */}
                <div className="flex-1 flex flex-col rounded-xl overflow-hidden border border-slate-900 bg-black shadow-lg">
                  <div className="bg-[#121214] px-4 py-3 text-[11px] font-mono text-gray-300 border-b border-slate-850 flex items-center justify-between select-none">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="font-bold text-gray-400 ml-1.5">Terminal Tunisien Bac Python v3.10</span>
                    </div>
                    {isSuccess === true && (
                      <span className="text-[#10B981] font-mono font-black text-[10px] flex items-center gap-1 animate-pulse">
                        ✓ SUCCÈS
                      </span>
                    )}
                    {isSuccess === false && (
                      <span className="text-[#EF4444] font-mono font-black text-[10px] flex items-center gap-0.5 animate-pulse">
                        ⚠ ERREUR
                      </span>
                    )}
                  </div>
                  
                  <pre
                    ref={terminalRef}
                    id="terminal-output"
                    className="flex-1 bg-black text-emerald-400 p-4 font-mono text-[11px] overflow-y-auto leading-relaxed whitespace-pre-wrap select-all text-left min-h-[300px]"
                    style={{ textShadow: "0 0 2px rgba(16, 185, 129, 0.25)" }}
                  >
                    {isRunning ? (
                      <div className="flex flex-col gap-2 items-start text-amber-400">
                        <span className="animate-pulse">⚡ Connexion au compilateur Piston...</span>
                        <span className="animate-pulse">⚙️ Compilation du code source main.py en cours...</span>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                          <span>En attente de retour serveur...</span>
                        </div>
                      </div>
                    ) : (
                      consoleOutput
                    )}
                  </pre>
                  
                  {/* Execution Stats Footer inside Terminal */}
                  <div className="bg-[#121214] border-t border-slate-850 px-4 py-2.5 text-[10px] font-mono text-slate-500 flex items-center justify-between flex-wrap gap-2 select-none">
                    <span>Prêt pour l'exécution</span>
                    {executionTime !== null && (
                      <span>Temps : {executionTime} ms</span>
                    )}
                  </div>
                </div>

                {/* Tunisian Bac helpful visual tips box */}
                <div className="p-4 rounded-xl border border-blue-150 bg-blue-50/20 text-[11px] text-blue-850 leading-relaxed text-left">
                  <div className="font-bold mb-1 flex items-center gap-1.5 text-blue-900">
                    <Sparkles size={12} className="text-blue-500" />
                    <span>Conseil Pédagogique (Bac Tunisie) :</span>
                  </div>
                  <span>L'épreuve pratique dure 1 heure. Testez vos algorithmes récursifs et tris à bulles avec différents jeux d'essais dans ce sandbox pour en assurer la robustesse avant l'examen !</span>
                </div>
              </div>

            </div>
          </div>



        </div>
      )}

    </div>

    {/* AI Walkthrough Sidebar Drawer */}
    <AnimatePresence>
      {isAiDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAiDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900 z-50 cursor-pointer"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-slate-800"
          >
            <div className="bg-[#0F1E36] text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 select-none">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[#10B981] animate-pulse" size={18} />
                <div>
                  <h3 className="font-bold text-xs">A-Zed AI Walkthrough</h3>
                  <p className="text-[9px] text-emerald-400 uppercase tracking-widest font-mono">
                    {isAiLoading ? "Génération de l'explication..." : "Guide de Résolution Intuitif"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Fermer le guide"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {isAiLoading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="relative flex h-8 w-8 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <Sparkles size={24} className="text-indigo-600 animate-spin" />
                  </div>
                  <p className="text-[11px] text-gray-550 dark:text-slate-350 font-medium text-center max-w-[280px]">
                    L'Intelligence Générative analyse votre progression et rédige une explication pas à pas...
                  </p>
                </div>
              )}

              <div className="space-y-3 text-left">
                {renderFormattedContent(aiDrawerContent)}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-950 px-5 py-4 border-t border-gray-150 dark:border-slate-850 flex items-center justify-between">
              <span className="text-[10px] text-gray-450 dark:text-slate-400 font-medium">
                Conseils adaptés aux examens tunisiens.
              </span>
              <button
                type="button"
                onClick={() => setIsAiDrawerOpen(false)}
                className="px-3 py-1.5 bg-[#0F1E36] hover:bg-[#1a2d4b] text-white rounded-md text-[10px] font-bold transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    </div>
  );
}
