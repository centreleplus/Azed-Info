import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Language, translations } from "../lib/translations";
import { 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  HelpCircle, 
  Code, 
  Plus, 
  Trash2, 
  Award, 
  Zap, 
  Send, 
  RefreshCw, 
  FileText, 
  CheckCircle2, 
  BarChart2, 
  Sparkles,
  ChevronRight,
  BookOpen,
  Lock
} from "lucide-react";
import { User as UserType } from "../types";

const normalizeTrimestre = (trim: string) => {
  if (!trim) return "";
  let t = trim.toLowerCase().trim();
  if (t.includes("1er") || t.includes("1ère")) {
    return "1ere trimestre";
  }
  if (t.includes("2eme") || t.includes("2ème")) {
    return "2eme trimestre";
  }
  if (t.includes("3eme") || t.includes("3ème")) {
    return "3eme trimestre";
  }
  if (t.includes("revision") || t.includes("révision")) {
    return "revision";
  }
  return t;
};

// Front-end Interfaces matching database schemas
interface QuizQuestion {
  questionText?: string;
  options?: string[];
  correctAnswerIndex?: number;
  correctAnswers?: string[]; // for Fill in the Blanks
  challengeDescription?: string;
  starterCode?: string;
  validationPattern?: string;
  solutionCode?: string;
  explanation?: string;
}

interface InteractiveQuiz {
  id: string;
  title: string;
  type: "qcm" | "fllblanks" | "coding_challenge";
  grade: string;
  difficulty: "Debutant" | "Intermediaire" | "Avance";
  creatorName: string;
  createdAt: string;
  questions: QuizQuestion[];
  trimestre?: string;
}

interface QuizSubmission {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  quizId: string;
  quizTitle: string;
  quizType: "qcm" | "fllblanks" | "coding_challenge";
  score: number;
  totalQuestions: number;
  correctCount: number;
  completedAt: string;
  details?: any;
}

interface PerformanceReport {
  userId: string;
  totalAttempts: number;
  averageScore: number;
  completedQuizzesCount: number;
  attempts: QuizSubmission[];
}

interface InteractiveQuizModuleProps {
  currentUser: UserType;
  handlePreparePremiumUpgrade: () => void;
  isPremiumUser: boolean;
  selectedTrimestre?: string;
  currentLanguage?: Language;
}

export default function InteractiveQuizModule({ 
  currentUser, 
  handlePreparePremiumUpgrade,
  isPremiumUser,
  selectedTrimestre,
  currentLanguage = "fr"
}: InteractiveQuizModuleProps) {
  const t = translations[currentLanguage];
  // General states
  const [quizzes, setQuizzes] = useState<InteractiveQuiz[]>([]);
  const [quizTips, setQuizTips] = useState<any[]>([]);
  const [performance, setPerformance] = useState<PerformanceReport | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<InteractiveQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"resoudre" | "creer">(
    currentUser.role === "admin" ? "creer" : "resoudre"
  );
  
  // Student Solver states
  const [userAnswers, setUserAnswers] = useState<{ [qIndex: number]: any }>({});
  const [qFeedback, setQFeedback] = useState<{ [qIndex: number]: { correct: boolean; checked: boolean; msg?: string } }>({});
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [lastSubmission, setLastSubmission] = useState<{
    score: number;
    totalQuestions: number;
    correctCount: number;
    quizTitle: string;
    quizType: string;
  } | null>(null);

  // Coding engine states
  const [codeDrafts, setCodeDrafts] = useState<{ [qIndex: number]: string }>({});
  const [codeOutputs, setCodeOutputs] = useState<{ [qIndex: number]: { output: string; running: boolean; success: boolean | null } }>({});

  // Instructor Form states
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"qcm" | "fllblanks" | "coding_challenge">("qcm");
  const [newGrade, setNewGrade] = useState("Tous");
  const [newDifficulty, setNewDifficulty] = useState<"Debutant" | "Intermediaire" | "Avance">("Intermediaire");
  
  // MCQ Form Sub-States
  const [mcqQuestions, setMcqQuestions] = useState<Array<{
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  }>>([{ questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0, explanation: "" }]);

  // FIB Form Sub-States
  const [fibQuestions, setFibQuestions] = useState<Array<{
    questionText: string;
    correctAnswers: string[];
    explanation: string;
  }>>([{ questionText: "La fonction [print] affiche du texte en Python.", correctAnswers: ["print"], explanation: "" }]);

  // Coding Form Sub-States
  const [codingQuestions, setCodingQuestions] = useState<Array<{
    challengeDescription: string;
    starterCode: string;
    validationPattern: string;
    solutionCode: string;
    explanation: string;
  }>>([{
    challengeDescription: "Écrivez une fonction pgcd(a, b) récursive.",
    starterCode: "def pgcd(a, b):\n    # Votre code",
    validationPattern: "PGCD(18, 12) = 6",
    solutionCode: "def pgcd(a, b):\n    return a if b == 0 else pgcd(b, a % b)",
    explanation: "Algorithme d'Euclide récursif standard."
  }]);

  const [creatorMsg, setCreatorMsg] = useState<string | null>(null);

  // Initial Fetching
  const fetchQuizzesAndStats = async () => {
    setIsLoading(true);
    try {
      const headers: any = {};
      if (currentUser.grade) {
        headers["x-user-grade"] = currentUser.grade;
      }
      if (currentUser.section) {
        headers["x-user-section"] = currentUser.section;
      }
      headers["x-user-role"] = currentUser.role;

      const qRes = await fetch("/api/quizzes", { headers });
      const qData = await qRes.json();
      setQuizzes(qData);

      const tipsRes = await fetch("/api/quizzes/tips");
      if (tipsRes.ok) {
        const tipsData = await tipsRes.json();
        setQuizTips(tipsData);
      }
      
      // Auto select first quiz if available
      if (qData.length > 0 && !selectedQuiz) {
        setSelectedQuiz(qData[0]);
      }

      if (currentUser.role === "student") {
        const sRes = await fetch(`/api/quizzes/performance/${currentUser.id}`);
        const sData = await sRes.json();
        setPerformance(sData);
      }
    } catch (err) {
      console.error("Erreur de chargement des questionnaires :", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzesAndStats();
  }, [currentUser]);

  // Filter quizzes based on selectedTrimestre if student role and prop selectedTrimestre is specified
  const filteredQuizzes = quizzes.filter((quiz) => {
    if (currentUser.role === "student" && selectedTrimestre) {
      const quizTrim = quiz.trimestre || (
        quiz.id === "qz_1" ? "1ere trimestre" :
        quiz.id === "qz_2" ? "2eme trimestre" :
        quiz.id === "qz_3" ? "3eme trimestre" :
        "revision"
      );
      return normalizeTrimestre(quizTrim) === normalizeTrimestre(selectedTrimestre);
    }
    return true; // Admin/Agent or unfiltered
  });

  useEffect(() => {
    if (filteredQuizzes.length > 0) {
      if (!selectedQuiz || !filteredQuizzes.some(q => q.id === selectedQuiz.id)) {
        setSelectedQuiz(filteredQuizzes[0]);
      }
    } else {
      setSelectedQuiz(null);
    }
  }, [selectedTrimestre, quizzes]);

  // Restart active quiz inputs when quiz changes
  useEffect(() => {
    if (selectedQuiz) {
      setUserAnswers({});
      setQFeedback({});
      setSubmissionSuccess(null);
      setLastSubmission(null);
      
      // Setup default starter drafts for coding challenges
      if (selectedQuiz.type === "coding_challenge") {
        const drafts: { [key: number]: string } = {};
        selectedQuiz.questions.forEach((q, idx) => {
          drafts[idx] = q.starterCode || "";
        });
        setCodeDrafts(drafts);
        setCodeOutputs({});
      }
    }
  }, [selectedQuiz]);

  // Submit dynamic quiz to server
  const handlePublishQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("Veuillez saisir un titre pour l'évaluation.");
      return;
    }

    let finalQuestions: any[] = [];
    if (newType === "qcm") {
      finalQuestions = mcqQuestions.map(q => ({
        questionText: q.questionText,
        options: q.options.filter(opt => opt.trim() !== ""),
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation
      }));
    } else if (newType === "fllblanks") {
      finalQuestions = fibQuestions.map(q => ({
        questionText: q.questionText,
        correctAnswers: q.correctAnswers.map(ans => ans.trim()),
        explanation: q.explanation
      }));
    } else {
      finalQuestions = codingQuestions;
    }

    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          type: newType,
          grade: newGrade,
          difficulty: newDifficulty,
          creatorName: currentUser.fullName,
          questions: finalQuestions
        })
      });
      const data = await res.json();
      setCreatorMsg("✅ L'évaluation interactive a été configurée et publiée avec succès !");
      
      // Reset form variables
      setNewTitle("");
      setMcqQuestions([{ questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0, explanation: "" }]);
      setFibQuestions([{ questionText: "La fonction [print] affiche du texte en Python.", correctAnswers: ["print"], explanation: "" }]);
      setCodingQuestions([{
        challengeDescription: "Écrivez une fonction pgcd(a, b) récursive.",
        starterCode: "def pgcd(a, b):\n    # Votre code",
        validationPattern: "PGCD(18, 12) = 6",
        solutionCode: "def pgcd(a, b):\n    return a if b == 0 else pgcd(b, a % b)",
        explanation: "Algorithme d'Euclide récursif standard."
      }]);

      await fetchQuizzesAndStats();
      setTimeout(() => setCreatorMsg(null), 5500);
    } catch (err) {
      console.error("Publisher failed:", err);
      alert("Impossible d'ajouter le QCM.");
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer définitivement cette évaluation ?")) return;
    try {
      await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
      if (selectedQuiz?.id === quizId) {
        setSelectedQuiz(null);
      }
      await fetchQuizzesAndStats();
    } catch (err) {
      console.error(err);
    }
  };

  // Run student code using internal piston environment or mock python validator
  const handleTestRunCode = async (qIndex: number) => {
    const code = codeDrafts[qIndex] || "";
    if (!code.trim()) return;

    setCodeOutputs(prev => ({
      ...prev,
      [qIndex]: { output: "Compilation et exécution du script en cours...", running: true, success: null }
    }));

    try {
      const runRes = await fetch("/api/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const runData = await runRes.json();
      
      const realOutput = runData.output || "";
      const validation = selectedQuiz?.questions[qIndex]?.validationPattern || "";
      
      // Check if output matches expected pattern
      const isCorrect = validation 
        ? realOutput.trim().toLowerCase().includes(validation.trim().toLowerCase()) 
        : true;

      setCodeOutputs(prev => ({
        ...prev,
        [qIndex]: { 
          output: realOutput || "Exécution terminée sans sortie sur le flux standard.", 
          running: false, 
          success: isCorrect 
        }
      }));

      // Set user answer
      setUserAnswers(prev => ({
        ...prev,
        [qIndex]: code
      }));

      // Update feedback
      setQFeedback(prev => ({
        ...prev,
        [qIndex]: { 
          correct: isCorrect, 
          checked: true, 
          msg: isCorrect 
            ? "Félicitations ! Le programme fonctionne et l'affichage correspond exactement au schéma de test attendu."
            : `Échec du test de conformité. Votre script a bien renvoyé une valeur, mais l'affichage sur la console finale ne contient pas le motif requis: "${validation}".` 
        }
      }));

    } catch (err) {
      console.error("Python engine error:", err);
      setCodeOutputs(prev => ({
        ...prev,
        [qIndex]: { 
          output: "Erreur réseau. Impossible de contacter l'interpréteur de bac pratique Python.", 
          running: false, 
          success: false 
        }
      }));
    }
  };

  // Check answers of QCM questions
  const handleCheckQcmAnswer = (qIndex: number, correctIdx: number) => {
    const selected = userAnswers[qIndex];
    if (selected === undefined) {
      alert("Saisissez d'abord une proposition de réponse.");
      return;
    }
    const isCorrect = Number(selected) === correctIdx;
    setQFeedback(prev => ({
      ...prev,
      [qIndex]: { checked: true, correct: isCorrect }
    }));
  };

  // Check answers of FIB (Fill-in-the-Blanks) questions
  const handleCheckFibAnswer = (qIndex: number, expectedAnswers: string[]) => {
    const answersObj = userAnswers[qIndex] || {};
    let isAllCorrect = true;
    
    expectedAnswers.forEach((expected, i) => {
      const userVal = (answersObj[i] || "").trim().toLowerCase();
      if (userVal !== expected.trim().toLowerCase()) {
        isAllCorrect = false;
      }
    });

    setQFeedback(prev => ({
      ...prev,
      [qIndex]: { checked: true, correct: isAllCorrect }
    }));
  };

  // Final submit score to tracking endpoints
  const handleConfirmSubmitQuiz = async () => {
    if (!selectedQuiz) return;

    const totalQs = selectedQuiz.questions.length;
    let correctCount = 0;
    const finalFeedback: { [qIndex: number]: { correct: boolean; checked: boolean; msg?: string } } = {};

    selectedQuiz.questions.forEach((q, idx) => {
      if (selectedQuiz.type === "qcm") {
        const ans = userAnswers[idx];
        const isCorrect = ans !== undefined && Number(ans) === q.correctAnswerIndex;
        if (isCorrect) {
          correctCount++;
        }
        finalFeedback[idx] = { checked: true, correct: isCorrect };
      } else if (selectedQuiz.type === "fllblanks") {
        const answersObj = userAnswers[idx] || {};
        let isCorrect = true;
        q.correctAnswers?.forEach((expected, i) => {
          const userVal = (answersObj[i] || "").trim().toLowerCase();
          if (userVal !== expected.trim().toLowerCase()) isCorrect = false;
        });
        if (isCorrect) {
          correctCount++;
        }
        finalFeedback[idx] = { checked: true, correct: isCorrect };
      } else if (selectedQuiz.type === "coding_challenge") {
        const isCorrect = !!qFeedback[idx]?.correct;
        if (isCorrect) {
          correctCount++;
        }
        finalFeedback[idx] = { checked: true, correct: isCorrect };
      }
    });

    const finalScore = Math.round((correctCount / totalQs) * 100);

    setIsSubmittingScore(true);
    try {
      const res = await fetch("/api/quizzes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          quizId: selectedQuiz.id,
          quizTitle: selectedQuiz.title,
          quizType: selectedQuiz.type,
          score: finalScore,
          totalQuestions: totalQs,
          correctCount,
          details: { userAnswers }
        })
      });
      const data = await res.json();
      setSubmissionSuccess(data.msg);
      setQFeedback(finalFeedback);
      setLastSubmission({
        score: finalScore,
        totalQuestions: totalQs,
        correctCount,
        quizTitle: selectedQuiz.title,
        quizType: selectedQuiz.type
      });

      // Celebrate perfect score with premium multi-stage confetti
      if (finalScore === 100) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 60,
            origin: { x: 0, y: 0.8 }
          });
        }, 200);
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 60,
            origin: { x: 1, y: 0.8 }
          });
        }, 400);
      }
      
      // Update local stats dashboard
      await fetchQuizzesAndStats();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingScore(false);
    }
  };

  // Helper parser for Fill in the Blanks question layout to make text input fields
  const renderFibQuestionInput = (qIndex: number, str: string, correctAnswers: string[]) => {
    // Splits text around bracket expressions e.g. "Pour définir [print] ou [input]"
    const parts = str.split(/\[.*?\]/);
    const isQChecked = qFeedback[qIndex]?.checked;
    
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-800 leading-relaxed font-medium">
        {parts.map((part, partIdx) => {
          const isLast = partIdx === parts.length - 1;
          const expectedAnswer = correctAnswers[partIdx] || "";
          const userAnswer = (userAnswers[qIndex]?.[partIdx] || "").trim();
          const isCorrect = userAnswer.toLowerCase() === expectedAnswer.toLowerCase();

          let inputStyleClasses = "px-2 py-1 border rounded text-slate-900 font-mono text-[11px] focus:outline-none focus:ring-1 w-28 text-center transition-all";
          if (isQChecked) {
            if (isCorrect) {
              inputStyleClasses += " bg-emerald-50 border-emerald-400 text-emerald-800 font-bold cursor-not-allowed";
            } else {
              inputStyleClasses += " bg-red-50 border-red-400 text-red-800 font-bold cursor-not-allowed";
            }
          } else {
            inputStyleClasses += " bg-[#EEF2F6] border-[#CBD5E1] focus:ring-[#10B981]";
          }

          return (
            <React.Fragment key={partIdx}>
              <span>{part}</span>
              {!isLast && (
                <div className="inline-flex flex-col sm:flex-row items-center gap-1.5">
                  <input
                    type="text"
                    disabled={isQChecked}
                    placeholder={isQChecked ? "" : "Écrivez ici..."}
                    value={userAnswers[qIndex]?.[partIdx] || ""}
                    onChange={(e) => {
                      const ans = userAnswers[qIndex] || {};
                      ans[partIdx] = e.target.value;
                      setUserAnswers({ ...userAnswers, [qIndex]: ans });
                    }}
                    className={inputStyleClasses}
                  />
                  {isQChecked && !isCorrect && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-850 px-1.5 py-0.5 rounded border border-emerald-250 font-mono">
                      Attendu : {expectedAnswer}
                    </span>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 bg-[#FFFFFF] text-[#1F2937] leading-relaxed">
      
      {/* Mode Toggles for Instructors */}
      {currentUser.role === "admin" && (
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold max-w-max">
          <button
            onClick={() => setActiveTab("resoudre")}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "resoudre" 
                ? "bg-[#2563EB] text-white shadow-sm" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📊 Résolution étudiant
          </button>
          <button
            onClick={() => setActiveTab("creer")}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "creer" 
                ? "bg-[#2563EB] text-white shadow-sm" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🛠️ Zone Créateur Instructeur
          </button>
        </div>
      )}

      {activeTab === "resoudre" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Side Panel: Student Performance Reports & List of Available Quizzes */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Student stats card */}
            {currentUser.role === "student" && performance && (
              <div className="border border-[#E5E7EB] rounded-2xl p-4 bg-[#F9FAFB] space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                  <h3 className="font-bold text-xs text-[#0F1E36] uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart2 size={13} className="text-[#10B981]" /> Votre Rapport de Performance
                  </h3>
                  <span className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-full">
                    4ème Année
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <div className="p-3 bg-white border border-[#E5E7EB] rounded-xl text-center">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase block">Complétés</span>
                    <span className="font-mono text-base font-bold text-indigo-500">
                      {performance.completedQuizzesCount}
                    </span>
                  </div>
                </div>

                {/* Progress Bar illustration */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-gray-500">Précision Moyenne des Réponses</span>
                    <span className="font-mono text-slate-700">{performance.averageScore}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-[#10B981] h-full rounded-full transition-all duration-350"
                      style={{ width: `${performance.averageScore || 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    La moyenne est mise à jour après chaque nouvelle soumission de QCM ou d'exercice de code.
                  </p>
                </div>
              </div>
            )}

            {/* List of assessments card */}
            <div className="border border-[#E5E7EB] rounded-2xl p-4 bg-white space-y-4">
              <h3 className="font-bold text-xs text-[#0F1E36] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={13} className="text-[#10B981]" /> Évaluations Disponibles
              </h3>

              {filteredQuizzes.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">
                  Aucune évaluation disponible pour ce trimestre.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                  {filteredQuizzes.map((quiz) => {
                    const isSelected = selectedQuiz?.id === quiz.id;
                    return (
                      <div
                        key={quiz.id}
                        onClick={() => setSelectedQuiz(quiz)}
                        className={`p-3 border rounded-xl text-left transition-all cursor-pointer flex justify-between items-center ${
                          isSelected 
                            ? "border-[#10B981] bg-emerald-50/20 shadow-xs" 
                            : "border-[#E5E7EB] hover:bg-slate-50"
                        }`}
                      >
                        <div className="space-y-1 flex-1 min-w-0 pr-2">
                          <div className="flex gap-1.5 items-center">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              quiz.type === "qcm" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                              quiz.type === "fllblanks" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                              "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}>
                              {quiz.type === "qcm" ? "QCM" : quiz.type === "fllblanks" ? "Remplissage" : "Code"}
                            </span>
                            <span className="text-[9px] text-slate-500 font-medium">
                              {quiz.grade} {quiz.section && `• ${quiz.section}`}
                            </span>
                            {quiz.isPremium && (
                              <span className="text-[8px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-extrabold flex items-center gap-0.5">
                                <Sparkles size={8} className="fill-amber-500 text-amber-500" />
                                Premium
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-[#0F1E36] truncate">
                            {quiz.title}
                          </h4>
                          <p className="text-[10px] text-gray-400">
                            Créé par {quiz.creatorName}
                          </p>
                        </div>
                        {quiz.isPremium && currentUser.role === "student" && !isPremiumUser ? (
                          <Lock size={12} className="text-amber-500 shrink-0" />
                        ) : (
                          <ChevronRight size={14} className={isSelected ? "text-[#10B981]" : "text-gray-300"} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Academic Tips */}
            {quizTips && quizTips.length > 0 ? (
              quizTips.map((tip) => (
                <div key={tip.id} className="border border-slate-100 rounded-2xl p-4 bg-[#F8FAFC] text-slate-600 text-xs leading-relaxed space-y-2 text-left">
                  <h4 className="font-bold text-[#0F1E36] text-[11px] uppercase tracking-wide flex items-center gap-1">
                    💡 Astuce de Révision Pratique
                  </h4>
                  <p className="text-[11px] text-slate-500 whitespace-pre-wrap">
                    {tip.text}
                  </p>
                </div>
              ))
            ) : (
              <div className="border border-slate-100 rounded-2xl p-4 bg-[#F8FAFC] text-slate-600 text-xs leading-relaxed space-y-2 text-left">
                <h4 className="font-bold text-[#0F1E36] text-[11px] uppercase tracking-wide flex items-center gap-1">
                  💡 Astuce de Révision Pratique
                </h4>
                <p className="text-[11px] text-slate-500">
                  L'épreuve pratique de Bac sciences de l'informatique tunisien dure 1h30. Entraînez-vous à écrire les algorithmes directement sans éditeur pour aiguiser vos réflexes de syntaxe.
                </p>
              </div>
            )}

          </div>

          {/* Active Quiz Core Workspace panel */}
          <div className="lg:col-span-8 space-y-6">
            {selectedQuiz ? (
              selectedQuiz.isPremium && currentUser.role === "student" && !isPremiumUser ? (
                <div className="border border-amber-200 rounded-2xl p-8 bg-amber-50/20 text-center space-y-4 max-w-md mx-auto">
                  <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <Lock size={20} />
                  </div>
                  <h3 className="text-base font-extrabold text-[#0F1E36]">Contenu réservé aux abonnés Premium</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Ce questionnaire interactif contient des questions avancées destinées aux abonnés Premium de A-Zed. Mettez à niveau votre compte pour débloquer l'accès complet.
                  </p>
                  <button
                    onClick={handlePreparePremiumUpgrade}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-2 mx-auto"
                  >
                    <Sparkles size={14} className="fill-white" />
                    <span>Devenir Premium</span>
                  </button>
                </div>
              ) : (
                <div className="border border-[#E5E7EB] rounded-2xl p-5 bg-white space-y-6">
                
                {/* Header card for active quiz metadata */}
                <div className="border-b border-[#E5E7EB] pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 text-slate-700 rounded text-[9px] font-bold uppercase tracking-wide">
                        {selectedQuiz.difficulty}
                      </span>
                    </div>
                    <h2 className="text-[#0F1E36] font-extrabold text-base">
                      {selectedQuiz.title}
                    </h2>
                  </div>

                  {/* Delete button for instructors */}
                  {currentUser.role === "admin" && (
                    <button
                      onClick={() => handleDeleteQuiz(selectedQuiz.id)}
                      className="text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                      Supprimer ce devoir
                    </button>
                  )}
                </div>

                {/* Questions Body Wrapper */}
                <div className="space-y-6">
                  {selectedQuiz.questions.map((q, qIdx) => {
                    const feedback = qFeedback[qIdx];
                    const isQChecked = feedback?.checked;
                    const isQCorrect = feedback?.correct;

                    return (
                      <div key={qIdx} className="p-4 border border-[#E5E7EB] rounded-xl space-y-4 bg-white text-left">
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-mono text-[11px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                            {qIdx + 1}
                          </span>
                          
                          {/* MCQ / QCM Rendering */}
                          {selectedQuiz.type === "qcm" && (
                            <div className="space-y-3.5 flex-1 min-w-0">
                              <p className="text-xs font-bold text-[#0F1E36] leading-relaxed">
                                {q.questionText}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {q.options?.map((opt, oIdx) => {
                                  const isSelected = userAnswers[qIdx] === oIdx;
                                  const isCorrectOption = oIdx === q.correctAnswerIndex;
                                  
                                  let styleClasses = "";
                                  if (isQChecked) {
                                    if (isCorrectOption) {
                                      styleClasses = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold shadow-xs";
                                    } else if (isSelected) {
                                      styleClasses = "border-red-500 bg-red-50 text-red-900 shadow-xs";
                                    } else {
                                      styleClasses = "border-slate-200 text-slate-400 opacity-60";
                                    }
                                  } else {
                                    styleClasses = isSelected
                                      ? "border-slate-800 bg-slate-900 text-white shadow-xs"
                                      : "border-[#E5E7EB] hover:bg-slate-50 text-[#374151]";
                                  }

                                  return (
                                    <div
                                      key={oIdx}
                                      onClick={() => {
                                        if (isQChecked) return;
                                        setUserAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
                                      }}
                                      className={`p-3 border rounded-xl text-xs transition-all cursor-pointer leading-normal flex items-start gap-2.5 ${styleClasses} ${isQChecked ? "cursor-not-allowed" : ""}`}
                                    >
                                      <span className="font-mono text-[10px] uppercase font-bold shrink-0 mt-0.5">
                                        [{String.fromCharCode(65 + oIdx)}]
                                      </span>
                                      <span className="font-medium">{opt}</span>
                                      {isQChecked && isCorrectOption && (
                                        <span className="ml-auto text-[9px] font-bold text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                          Correct
                                        </span>
                                      )}
                                      {isQChecked && isSelected && !isCorrectOption && (
                                        <span className="ml-auto text-[9px] font-bold text-red-600 bg-red-100/60 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                          Votre choix
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {!isQChecked && (
                                <button
                                  onClick={() => handleCheckQcmAnswer(qIdx, q.correctAnswerIndex ?? 0)}
                                  className="mt-2 text-[10px] uppercase tracking-wider font-bold bg-[#10B981] hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                                >
                                  Vérifier le choix
                                </button>
                              )}
                            </div>
                          )}

                          {/* Fill-in-the-Blanks FIB Rendering */}
                          {selectedQuiz.type === "fllblanks" && (
                            <div className="space-y-3.5 flex-1 min-w-0">
                              <p className="text-xs font-bold text-[#0F1E36] leading-relaxed border-b border-gray-100 pb-1.5">
                                Remplissez les espaces vides pour rendre l'affirmation correcte :
                              </p>

                              {/* Parser field */}
                              {renderFibQuestionInput(qIdx, q.questionText || "", q.correctAnswers || [])}

                              {!isQChecked && (
                                <button
                                  onClick={() => handleCheckFibAnswer(qIdx, q.correctAnswers || [])}
                                  className="mt-2 text-[10px] uppercase tracking-wider font-bold bg-[#10B981] hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                                >
                                  Valider la saisie
                                </button>
                              )}
                            </div>
                          )}

                          {/* Coding Challenge Python Rendering */}
                          {selectedQuiz.type === "coding_challenge" && (
                            <div className="space-y-4 flex-1 min-w-0">
                              <div className="space-y-1.5">
                                <h4 className="text-xs font-bold text-[#0F1E36] flex items-center gap-1">
                                  <Code size={13} className="text-[#10B981]" /> Défi pratique à programmer :
                                </h4>
                                <p className="text-xs text-slate-600 leading-relaxed bg-[#F8FAFC] border border-slate-100 p-3 rounded-lg text-left whitespace-pre-line">
                                  {q.challengeDescription}
                                </p>
                              </div>

                              <div className="space-y-1.5 text-left">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                  Éditeur Scratchpad Python :
                                </span>
                                <textarea
                                  value={codeDrafts[qIdx] || ""}
                                  onChange={(e) => setCodeDrafts(prev => ({ ...prev, [qIdx]: e.target.value }))}
                                  className="w-full h-44 p-3 bg-slate-900 text-emerald-400 border border-[#CBD5E1] rounded-xl font-mono text-xs focus:ring-1 focus:ring-[#10B981] focus:outline-none leading-relaxed"
                                  placeholder="Saisissez votre script Python3..."
                                />
                              </div>

                              {/* Compile sandbox button */}
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="text-[10px] text-gray-400 font-mono">
                                  Motif attendu en console : "{q.validationPattern}"
                                </div>
                                <button
                                  onClick={() => handleTestRunCode(qIdx)}
                                  disabled={codeOutputs[qIdx]?.running}
                                  className="text-[10.5px] uppercase tracking-wider font-bold bg-[#0F1E36] hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg cursor-pointer inline-flex items-center gap-1.5 transition-colors checked:opacity-50"
                                >
                                  {codeOutputs[qIdx]?.running ? (
                                    <>
                                      <RefreshCw size={11} className="animate-spin" />
                                      Exécution...
                                    </>
                                  ) : (
                                    <>
                                      <Play size={11} className="fill-white" />
                                      Lancer le test automatique
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Terminal result console */}
                              {codeOutputs[qIdx] && (
                                <div className="p-3 bg-slate-950 text-[#F1F5F9] rounded-xl border border-slate-800 text-[11px] font-mono space-y-1">
                                  <span className="text-gray-500 font-bold uppercase text-[9px] block">Console / Flux Standard :</span>
                                  <pre className="whitespace-pre-wrap overflow-x-auto text-left leading-normal font-medium">
                                    {codeOutputs[qIdx].output}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}

                        </div>

                        {/* Real-time Validation Feedback container */}
                        {isQChecked && (
                          <div className={`p-3.5 rounded-xl border flex gap-3 text-xs leading-relaxed text-left ${
                            isQCorrect 
                              ? "bg-emerald-50 text-emerald-800 border-emerald-250" 
                              : "bg-red-50 text-red-800 border-red-200"
                          }`}>
                            <div className="mt-0.5">
                              {isQCorrect ? (
                                <CheckCircle className="text-[#10B981] fill-emerald-100" size={16} />
                              ) : (
                                <AlertTriangle className="text-red-600 fill-red-100" size={16} />
                              )}
                            </div>
                            <div className="space-y-1 w-full">
                              <p className="font-bold">
                                {isQCorrect ? "✓ Réponse correcte !" : "✗ Réponse incorrecte"}
                              </p>
                              {q.explanation && (
                                <p className="text-[11px] text-slate-500 font-medium">
                                  <span className="font-bold text-[#0F1E36]">Explication : </span>
                                  {q.explanation}
                                </p>
                              )}
                              {selectedQuiz.type === "coding_challenge" && q.solutionCode && (
                                <div className="mt-3 space-y-1.5 border-t border-slate-200/50 pt-3">
                                  <span className="text-[10px] uppercase font-extrabold text-slate-700 block tracking-wider">
                                    💡 Solution de référence Python attendue :
                                  </span>
                                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed border border-slate-950">
                                    {q.solutionCode}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>

                {/* Submission Zone action bars */}
                {currentUser.role === "student" && (
                  <div className="pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-500 leading-normal max-w-md text-left">
                      Vérifiez bien toutes vos réponses avant de soumettre. Une fois soumis, vos performances recalculées s'afficheront sur le tableau de bord principal.
                    </p>

                    <button
                      onClick={handleConfirmSubmitQuiz}
                      disabled={isSubmittingScore}
                      className="px-5 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingScore ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          Transmission...
                        </>
                      ) : (
                        <>
                          <Send size={12} />
                          Soumettre l'Évaluation
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Submission Success Alert and Premium Score Dashboard */}
                {lastSubmission ? (
                  <div className="p-6 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl space-y-6 animate-fade-in text-xs text-left">
                    <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
                      <div className="flex items-center gap-4">
                        {/* Circular Score representation */}
                        <div className={`relative w-20 h-20 shrink-0 flex items-center justify-center rounded-full bg-white border-4 ${
                          lastSubmission.score >= 80 ? "border-emerald-500" : "border-amber-500"
                        } shadow-xs`}>
                          <div className="text-center">
                            <span className="text-[#0F1E36] font-black text-lg block leading-none">{lastSubmission.score}%</span>
                            <span className="text-gray-400 font-mono text-[9px] block mt-0.5">{lastSubmission.correctCount} / {lastSubmission.totalQuestions}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-[#0F1E36] font-bold text-sm">
                            Félicitations, évaluation terminée !
                          </h4>
                          <p className="text-[11px] text-gray-500 leading-relaxed">
                            {lastSubmission.score >= 80 
                              ? "🔥 Exceptionnel ! Vous maîtrisez parfaitement ce sujet !"
                              : lastSubmission.score >= 50 
                              ? "👍 Bon travail ! Vous y êtes presque. Continuez à vous entraîner !"
                              : "📚 Besoin de révision. N'hésitez pas à relire le cours pour consolider vos acquis !"}
                          </p>
                          {lastSubmission.score < 80 ? (
                            <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-1">
                              <AlertTriangle size={12} className="animate-pulse" />
                              <span>Seuil de réussite (80%) non atteint. Retentez le quiz pour vous améliorer !</span>
                            </p>
                          ) : (
                            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                              <CheckCircle2 size={12} />
                              <span>Excellent ! Objectif de réussite (80%) atteint et enregistré dans votre profil.</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 w-full sm:w-auto">
                        {lastSubmission.score < 80 ? (
                          <button
                            onClick={() => {
                              setUserAnswers({});
                              setQFeedback({});
                              setSubmissionSuccess(null);
                              setLastSubmission(null);
                              if (selectedQuiz.type === "coding_challenge") {
                                const drafts: { [key: number]: string } = {};
                                selectedQuiz.questions.forEach((q, idx) => {
                                  drafts[idx] = q.starterCode || "";
                                });
                                setCodeDrafts(drafts);
                                setCodeOutputs({});
                              }
                            }}
                            className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-extrabold uppercase tracking-wider text-[11px] cursor-pointer transition-all text-center inline-flex items-center justify-center gap-2 shadow-sm animate-pulse"
                          >
                            <RefreshCw size={14} className="animate-spin-slow" />
                            <span>Retenter l'évaluation (Try Again)</span>
                          </button>
                        ) : (
                          <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 text-center">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span>Sujet validé !</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Brief Question Summary check */}
                    <div className="border-t border-gray-100 pt-4 space-y-2">
                      <p className="font-semibold text-gray-500 uppercase tracking-wider text-[9px]">Aperçu de vos réponses :</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {selectedQuiz.questions.map((_, qIdx) => {
                          const isCorrect = qFeedback[qIdx]?.correct;
                          return (
                            <div 
                              key={qIdx} 
                              className={`p-2 rounded-xl border flex items-center justify-between text-[11px] ${
                                isCorrect 
                                  ? "bg-emerald-50/50 border-emerald-200 text-emerald-850" 
                                  : "bg-red-50/50 border-red-200 text-red-850"
                              }`}
                            >
                              <span className="font-bold">Question {qIdx + 1}</span>
                              <span className="font-mono font-bold">{isCorrect ? "✓" : "✗"}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  submissionSuccess && (
                    <div className="p-4 bg-emerald-50 text-emerald-800 border border-[#10B981]/25 rounded-2xl flex items-center gap-3 animate-fade-in text-xs text-left">
                      <CheckCircle2 size={18} className="text-[#10B981]" />
                      <div>
                        <p className="font-bold">Excellent travail ! Votre devoir a été soumis.</p>
                        <p className="text-[11px] text-emerald-700 leading-relaxed font-semibold mt-0.5">
                          {submissionSuccess}
                        </p>
                      </div>
                    </div>
                  )
                )}

              </div>
            )
          ) : (
              <div className="border border-[#E5E7EB] rounded-2xl p-12 text-center bg-white space-y-4">
                <HelpCircle className="mx-auto text-gray-300 stroke-[1.5]" size={36} />
                <h3 className="text-slate-800 font-extrabold text-sm">
                  Sélectionnez une évaluation pour commencer
                </h3>
                <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed">
                  Choisissez une fiche de la liste à gauche. Vous y trouverez des fiches de QCM, de saisie sémantique ou d'épreuves de script Python.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Instructor Creator Pane tab */}
      {activeTab === "creer" && currentUser.role === "admin" && (
        <form onSubmit={handlePublishQuiz} className="border border-[#E5E7EB] rounded-2xl p-5 bg-white space-y-6 text-left">
          
          <div className="border-b border-[#E5E7EB] pb-2 text-left">
            <h2 className="text-[#0F1E36] font-bold text-sm tracking-tight flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#10B981]" /> Configurer et Publier un Nouveau Quiz / Exercice
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Remplissez le formulaire de configuration ci-dessous pour injecter un défi QCM, FIB ou Python en direct sur les plateformes étudiantes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#0F1E36] font-bold uppercase tracking-wider block">
                Titre de l'évaluation
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="ex: Synthèse : Fichiers & Piles"
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#10B981] focus:outline-none"
              />
            </div>

            {/* Assessment Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#0F1E36] font-bold uppercase tracking-wider block">
                Type de Défi
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#10B981] focus:outline-none bg-white"
              >
                <option value="qcm">QCM interactif (Choix Multiples)</option>
                <option value="fllblanks">Champs à Remplir (Fill in the blanks)</option>
                <option value="coding_challenge">Scripting / Défi Compiler Python</option>
              </select>
            </div>

            {/* Target Grade / Level */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#0F1E36] font-bold uppercase tracking-wider block">
                Classe Cible
              </label>
              <select
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#10B981] focus:outline-none bg-white"
              >
                <option value="Tous">Toutes les classes</option>
                <option value="3ème Année">3ème Année (Sciences de l'info)</option>
                <option value="4ème Année">4ème Année</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#0F1E36] font-bold uppercase tracking-wider block">
                Difficulté d'Apprentissage
              </label>
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#10B981] focus:outline-none bg-white"
              >
                <option value="Debutant">Débutant 🌱</option>
                <option value="Intermediaire">Intermédiaire ⚙️</option>
                <option value="Avance">Avancé 👑</option>
              </select>
            </div>

          </div>

          {/* Dynamic Questions Generator Form */}
          <div className="space-y-4 pt-2">
            
            {/* 1. QCM GENERATOR */}
            {newType === "qcm" && (
              <div className="space-y-4">
                <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider flex items-center gap-1">
                  ✍️ FORMULAIRE DES QUESTIONS QCM
                </span>
                
                {mcqQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 border border-indigo-100 rounded-xl bg-slate-55/10 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-slate-800">Question #{idx + 1}</span>
                      {mcqQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setMcqQuestions(mcqQuestions.filter((_, i) => i !== idx))}
                          className="text-[10px] text-red-500 font-bold hover:underline"
                        >
                          Supprimer cette question
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Intitulé de la question</label>
                      <input
                        type="text"
                        required
                        value={q.questionText}
                        onChange={(e) => {
                          const updated = [...mcqQuestions];
                          updated[idx].questionText = e.target.value;
                          setMcqQuestions(updated);
                        }}
                        placeholder="ex: Quel est le type d'un tableau unidimensionnel en Python ?"
                        className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                      />
                    </div>

                    {/* Options subset inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Option {String.fromCharCode(65 + oIdx)}</label>
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => {
                              const updated = [...mcqQuestions];
                              updated[idx].options[oIdx] = e.target.value;
                              setMcqQuestions(updated);
                            }}
                            placeholder={`Option ${oIdx + 1}`}
                            className="w-full px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-xs focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Correct answer index selection */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Option Correcte</label>
                        <select
                          value={q.correctAnswerIndex}
                          onChange={(e) => {
                            const updated = [...mcqQuestions];
                            updated[idx].correctAnswerIndex = Number(e.target.value);
                            setMcqQuestions(updated);
                          }}
                          className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-xs focus:ring-1 focus:ring-[#10B981] focus:outline-none bg-white"
                        >
                          <option value={0}>Option A</option>
                          <option value={1}>Option B</option>
                          <option value={2}>Option C</option>
                          <option value={3}>Option D</option>
                        </select>
                      </div>

                      {/* Explanation */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Explication pédagogique</label>
                        <input
                          type="text"
                          required
                          value={q.explanation}
                          onChange={(e) => {
                            const updated = [...mcqQuestions];
                            updated[idx].explanation = e.target.value;
                            setMcqQuestions(updated);
                          }}
                          placeholder="ex: En Python, on modélise les tableaux avec le type natif list."
                          className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-xs focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                        />
                      </div>

                    </div>

                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setMcqQuestions([...mcqQuestions, { questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0, explanation: "" }])}
                  className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer w-fit"
                >
                  <Plus size={13} />
                  Saisir une question supplémentaire QCM
                </button>
              </div>
            )}

            {/* 2. FIB GENERATOR */}
            {newType === "fllblanks" && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-normal">
                  <p className="font-bold">💡 Guide de syntaxe Instructeur pour text-fill :</p>
                  Saisissez l'affirmation en insérant l'expression attendue entre crochets, par exemple : <code className="font-bold bg-amber-100 px-1 py-0.5 rounded">En python, on utilise la méthode [append] pour ajouter un élément.</code>. L'étudiant verra l'affirmation avec un champ de saisie vide et sera validé s'il écrit exactement le mot configuré.
                </div>

                {fibQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 border border-amber-100 rounded-xl bg-amber-50/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-[#0D1F37]">Phrase à trous #{idx + 1}</span>
                      {fibQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setFibQuestions(fibQuestions.filter((_, i) => i !== idx))}
                          className="text-[10px] text-red-500 font-bold hover:underline"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">Phrase avec crochets []</label>
                      <input
                        type="text"
                        required
                        value={q.questionText}
                        onChange={(e) => {
                          const updated = [...fibQuestions];
                          updated[idx].questionText = e.target.value;
                          
                          // Auto parse brackets words
                          const matches = e.target.value.match(/\[(.*?)\]/g) || [];
                          const cleaned = matches.map(m => m.replace(/[\[\]]/g, ""));
                          updated[idx].correctAnswers = cleaned;

                          setFibQuestions(updated);
                        }}
                        placeholder="ex: L'algorithme tri_bulles trie en O([n**2]) moyen."
                        className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Detected answers */}
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Mots-clés requis détectés :</span>
                        <div className="flex flex-wrap gap-1.5">
                          {q.correctAnswers.length === 0 ? (
                            <span className="text-[10px] font-semibold text-red-500 italic">Aucun crochet [] détecté</span>
                          ) : (
                            q.correctAnswers.map((ans, aIdx) => (
                              <span key={aIdx} className="bg-amber-100 border border-amber-300 text-amber-800 text-[10px] px-2 py-0.5 rounded font-mono">
                                index #{aIdx + 1} : {ans}
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Explication de l'exercice</label>
                        <input
                          type="text"
                          required
                          value={q.explanation}
                          onChange={(e) => {
                            const updated = [...fibQuestions];
                            updated[idx].explanation = e.target.value;
                            setFibQuestions(updated);
                          }}
                          placeholder="Saisissez la justification pédagogique..."
                          className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-xs focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                        />
                      </div>

                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setFibQuestions([...fibQuestions, { questionText: "Une [variable] stocke des informations.", correctAnswers: ["variable"], explanation: "" }])}
                  className="bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer w-fit"
                >
                  <Plus size={13} />
                  Saisir une affirmation Fill-in-the-blanks supplémentaire
                </button>
              </div>
            )}

            {/* 3. CODING CHALLENGE GENERATOR */}
            {newType === "coding_challenge" && (
              <div className="space-y-4">
                <span className="text-xs text-purple-600 font-bold uppercase tracking-wider flex items-center gap-1">
                  💻 ZONE CONFIGURATION DÉFI COMPILER PYTHON
                </span>

                {codingQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 border border-purple-100 rounded-xl bg-purple-50/5 space-y-4">
                    
                    {/* Challenge description */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">Enoncé / Consigne du problème</label>
                      <textarea
                        required
                        value={q.challengeDescription}
                        onChange={(e) => {
                          const updated = [...codingQuestions];
                          updated[idx].challengeDescription = e.target.value;
                          setCodingQuestions(updated);
                        }}
                        rows={3}
                        placeholder="Qu'attend-on de l'élève ? e.g. Programmer une fonction tri_selection(t) qui prend..."
                        className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      
                      {/* Starter code */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 block">Code de démarrage étudiant (starter code)</label>
                        <textarea
                          required
                          value={q.starterCode}
                          onChange={(e) => {
                            const updated = [...codingQuestions];
                            updated[idx].starterCode = e.target.value;
                            setCodingQuestions(updated);
                          }}
                          rows={6}
                          className="w-full p-2 bg-slate-900 text-[#F1F5F9] font-mono text-xs focus:ring-1 focus:ring-[#10B981] focus:outline-none rounded-lg"
                        />
                      </div>

                      {/* Solution code */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 block">Solution complète pour référence</label>
                        <textarea
                          required
                          value={q.solutionCode}
                          onChange={(e) => {
                            const updated = [...codingQuestions];
                            updated[idx].solutionCode = e.target.value;
                            setCodingQuestions(updated);
                          }}
                          rows={6}
                          className="w-full p-2 bg-[#F8FAFC] text-slate-800 border font-mono text-xs focus:ring-1 focus:ring-[#10B981] focus:outline-none rounded-lg"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      
                      {/* Validation Pattern */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-500 block">Sortie console attendue (Validation Pattern)</label>
                        <input
                          type="text"
                          required
                          value={q.validationPattern}
                          onChange={(e) => {
                            const updated = [...codingQuestions];
                            updated[idx].validationPattern = e.target.value;
                            setCodingQuestions(updated);
                          }}
                          placeholder="ex: Le tableau trié: [1, 2, 5]"
                          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:ring-1 focus:ring-[#10B981] focus:outline-none font-mono"
                        />
                        <p className="text-[9px] text-gray-400">
                          L'application valide l'exercice si le résultat du terminal d'exécution Piston de l'étudiant contient précisément cette chaîne de caractères.
                        </p>
                      </div>

                      {/* Explanation */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-500 block">Note explicative de correction</label>
                        <input
                          type="text"
                          required
                          value={q.explanation}
                          onChange={(e) => {
                            const updated = [...codingQuestions];
                            updated[idx].explanation = e.target.value;
                            setCodingQuestions(updated);
                          }}
                          placeholder="ex: On échange t[j] et t[j+1] dans la boucle imbriquée."
                          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                        />
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

          <div className="pt-4 border-t border-[#E5E7EB] flex justify-end gap-3">
            <button
              type="submit"
              className="bg-[#10B981] hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Send size={12} className="fill-white" />
              Publier l'évaluation active
            </button>
          </div>

          {creatorMsg && (
            <div className="p-4 bg-emerald-50 text-emerald-850 border border-emerald-200 rounded-xl flex items-center gap-2 font-bold text-xs">
              <CheckCircle size={16} className="text-[#10B981]" />
              {creatorMsg}
            </div>
          )}

        </form>
      )}

    </div>
  );
}
