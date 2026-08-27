import React, { useState, useRef, useEffect } from "react";
import { User, Calendar, Shield, CreditCard, AlertTriangle, FileText, Upload, CheckCircle2, Trash2, Ban, Settings, ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight, ArrowUp, ChevronUp, ChevronsUp, Award, BookOpen, ShoppingBag, Crown, Sparkles } from "lucide-react";
import { User as UserType } from "../types";
import StudentOrdersView from "./StudentOrdersView";
import { LicenseBadge } from "./ui/LicenseBadge";

interface ProfileViewProps {
  currentUser: UserType;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  onAdminActionRefetch: () => void;
  allUsersList: UserType[];
  scrollTopPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  onScrollTopPositionChange: (pos: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left') => void;
  scrollTopIcon: 'arrow' | 'chevron' | 'chevrons';
  onScrollTopIconChange: (icon: 'arrow' | 'chevron' | 'chevrons') => void;
  hideScrollTopOnMobile: boolean;
  onHideScrollTopOnMobileChange: (hide: boolean) => void;
}

export default function ProfileView({
  currentUser,
  setCurrentUser,
  onAdminActionRefetch,
  allUsersList,
  scrollTopPosition,
  onScrollTopPositionChange,
  scrollTopIcon,
  onScrollTopIconChange,
  hideScrollTopOnMobile,
  onHideScrollTopOnMobileChange
}: ProfileViewProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [isLoadingQuizHistory, setIsLoadingQuizHistory] = useState(false);
  const [profileSubTab, setProfileSubTab] = useState<"overview" | "orders">("overview");

  useEffect(() => {
    if (currentUser.role === "student") {
      setIsLoadingQuizHistory(true);
      fetch(`/api/quizzes/performance/${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.attempts) {
            setQuizHistory(data.attempts);
          }
        })
        .catch((err) => console.error("Error fetching quiz history:", err))
        .finally(() => setIsLoadingQuizHistory(false));
    }
  }, [currentUser]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFileName(file.name);
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setSuccessMsg(`📄 Justificatif de transfert "${file.name}" en queue de révision manuelle.`);
          setTimeout(() => setSuccessMsg(null), 5000);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  // Administration: Approve student account manually
  const handleApproveStudent = (studentId: string) => {
    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: studentId,
        cartItems: [],
        totalAmount: 120,
        paymentMethod: "D17",
        forceApprove: true
      })
    })
      .then((res) => res.json())
      .then((data) => {
        onAdminActionRefetch();
        setSuccessMsg("👑 Compte étudiant approuvé et accès Premium annuel de 120 DT déverrouillé.");
        setTimeout(() => setSuccessMsg(null), 4000);
      });
  };

  const getSubBadgeStyle = () => {
    if (currentUser.accountType === "freemium") {
      return { text: "Accès Libre (Freemium) 🌱", style: "bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold" };
    }
    if (currentUser.role === "student" && currentUser.status === "pending") {
      return { text: "En attente de validation ⏳", style: "bg-amber-50 text-amber-700 border border-amber-300 font-bold" };
    }
    if (!currentUser.subscriptionExpiresAt) return { text: "Aucun", style: "border-[#EF4444] text-[#EF4444] bg-red-50/50" };
    const diff = new Date(currentUser.subscriptionExpiresAt).getTime() - Date.now();
    
    if (diff <= 0) {
      return { text: "Expiré ⚠️", style: "bg-red-50 text-red-650 border border-red-200" };
    } else if (diff <= 24 * 60 * 60 * 1000) {
      return { text: "Urgent (< 24h) ⚠️", style: "bg-orange-500 text-white animate-pulse" };
    } else {
      return { text: "Premium Actif ⭐", style: "bg-emerald-600 text-white font-bold" };
    }
  };

  const subBadge = getSubBadgeStyle();
  const isPaymentConfirmed = currentUser.accountType === "premium" && (currentUser.status === "active" || currentUser.verified === true || (currentUser.subscriptionExpiresAt ? new Date(currentUser.subscriptionExpiresAt).getTime() > Date.now() : false));

  return (
    <div className="space-y-6 bg-white text-[#1F2937]">
      
      {successMsg && (
        <div className="p-3.5 border border-[#10B981] bg-emerald-50/20 text-[#10B981] text-xs rounded-xl font-medium flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#10B981] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Details Header Banner */}
      <div className="border border-[#E5E7EB] p-5 rounded-2xl bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border border-[#E5E7EB] flex items-center justify-center bg-gray-50 text-[#0F1E36]">
            <User size={22} />
          </div>
          <div className="text-left text-xs text-gray-500">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[#0F1E36] font-semibold text-base leading-none flex items-center gap-2 mt-1">
                <span className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <User size={16} className="text-white fill-white/10" />
                </span>
                <span>{currentUser.fullName}</span>
              </h2>
              <span className="text-[10px] px-2 py-0.5 font-bold uppercase border border-[#E5E7EB] text-[#0F1E36] bg-[#F9FAFB] rounded text-[9px]">
                {currentUser.role}
              </span>
              {currentUser.role === "student" && (
                currentUser.status === "pending" ? (
                  <span className="text-[10px] px-2.5 py-0.5 font-bold uppercase border border-amber-300 text-amber-700 bg-amber-50 rounded-full text-[9px] flex items-center gap-1 animate-pulse">
                    ⏳ Premium (En attente)
                  </span>
                ) : (
                  <LicenseBadge size="md" type={isPaymentConfirmed || currentUser.accountType === "premium" ? 'premium' : 'freemium'} />
                )
              )}
            </div>
            <p className="mt-1">E-mail: {currentUser.email} | Promotion : {currentUser.grade}</p>
          </div>
        </div>

        <div>
          {isPaymentConfirmed || currentUser.accountType === "premium" ? (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50/80 border border-amber-200 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs">
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0"/>
              <span>ABONNEMENT ANNUEL : PREMIUM ACTIF</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50/80 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0"/>
              <span>ABONNEMENT ANNUEL : ACCÈS LIBRE (FREEMIUM)</span>
            </div>
          )}
        </div>
      </div>

      {/* Sub Navigation Bar inside Profile */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] dark:border-gray-800 pb-3">
        <button
          onClick={() => setProfileSubTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            profileSubTab === "overview"
              ? "bg-[#0F1E36] text-white shadow-xs"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <User size={14} />
          <span>Profil & Formules</span>
        </button>

        {currentUser.role === "student" && (
          <button
            onClick={() => setProfileSubTab("orders")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              profileSubTab === "orders"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <ShoppingBag size={14} />
            <span>Mes Commandes & Abonnements</span>
          </button>
        )}
      </div>

      {profileSubTab === "orders" && currentUser.role === "student" ? (
        <StudentOrdersView userId={currentUser.id} />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE USER PACKS & FILES */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Packs Card */}
          <div className="border border-[#E5E7EB] rounded-2xl p-5 bg-white space-y-4">
            <h3 className="text-[#0F1E36] font-semibold text-sm border-b border-[#E5E7EB] pb-2">
              Modules et Licences Actives
            </h3>
            {currentUser.packs && currentUser.packs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentUser.packs.map((pack, idx) => (
                  <div key={idx} className="p-3.5 border border-[#10B981]/30 rounded-xl bg-white text-xs space-y-1">
                    <span className="text-[8px] font-bold text-[#10B981] uppercase tracking-wide block">PRODUIT ACQUIS</span>
                    <h4 className="font-semibold text-[#0F1E36]">{pack}</h4>
                    <p className="text-gray-400 text-[11px] leading-relaxed">
                      Licence d'utilisation complète valable à vie pour l'année scolaire en cours.
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border border-dashed border-[#E5E7EB] rounded-xl text-center text-xs bg-[#F9FAFB]">
                <p className="font-medium text-gray-550">Aucun produit en cours de validité</p>
                <p className="text-gray-400 mt-1 max-w-xs mx-auto">
                  Consultez les forfaits d'accompagnement annuels depuis le shop numérique pour débloquer les supports de cours.
                </p>
              </div>
            )}
          </div>

          {/* Upload Receipt Workspace */}
          <div className="border border-[#E5E7EB] rounded-2xl p-5 bg-white space-y-4 relative overflow-hidden">
            <h3 className="text-[#0F1E36] font-semibold text-sm border-b border-[#E5E7EB] pb-2 flex items-center justify-between">
              <span>Justifier l'Acquisition (Envoi hors-ligne)</span>
              {isPaymentConfirmed && (
                <span className="text-[10px] uppercase font-bold text-[#10B981] bg-emerald-50 border border-[#10B981]/25 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                  🔒 VERROUILLÉ & DÉBLOQUÉ
                </span>
              )}
            </h3>
            
            {isPaymentConfirmed ? (
              <div className="p-6 border border-[#10B981]/30 rounded-xl text-center bg-emerald-50/10 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#10B981]/15 flex items-center justify-center mx-auto text-[#10B981]">
                  <CheckCircle2 size={24} className="stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-xs text-[#0F1E36]">Votre paiement a été validé !</p>
                  <p className="text-[11px] text-gray-500 max-w-md mx-auto leading-relaxed">
                    L'acquisition de votre formule Premium annuelle (120 DT) est confirmée par l'administration. 
                    Tous vos cours et services sont pleinement actifs. Aucun justificatif supplémentaire n'est requis.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-500 leading-normal">
                  Afin d'accélérer l'activation de votre abonnement Premium annuel (120 DT), faites glisser la preuve de votre transfert D17 ou de virement bancaire ci-dessous.
                </p>

                {/* Drag and drop panel */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 border border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                    dragActive ? "border-[#10B981] bg-emerald-50/20" : "border-[#E5E7EB] hover:bg-gray-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={onFileInputChange}
                  />
                  <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                  <p className="font-medium text-xs text-[#0F1E36]">
                    Glissez-déposez le document de reçu de paiement, ou parcourez
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Formats autorisés: PDF, PNG, JPG (Poids max 5 Mo)
                  </p>
                </div>

                {/* Progress indicator */}
                {selectedFileName && uploadProgress !== null && (
                  <div className="p-3 border border-[#E5E7EB] rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="truncate font-semibold text-[#0F1E36]">{selectedFileName}</span>
                      <span className="font-mono text-[10px] text-gray-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#10B981] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Historique des Quiz et Évaluations pour l'Éleve */}
          {currentUser.role === "student" && (
            <div className="border border-[#E5E7EB] rounded-2xl p-5 bg-white space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
                <span className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Award size={14} className="text-emerald-600" />
                </span>
                <h3 className="text-[#0F1E36] font-semibold text-sm">
                  Historique des Quiz & Évaluations
                </h3>
              </div>
              
              {isLoadingQuizHistory ? (
                <div className="py-6 text-center text-xs text-gray-400">
                  Chargement de vos statistiques...
                </div>
              ) : quizHistory && quizHistory.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {quizHistory.map((sub, idx) => {
                    const dateFormatted = new Date(sub.completedAt).toLocaleDateString("fr-TN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    });
                    
                    return (
                      <div key={sub.id || idx} className="p-3.5 border border-[#E5E7EB] hover:border-gray-300 rounded-xl bg-white text-xs space-y-2 transition-all">
                        <div className="flex justify-between items-start gap-2 flex-wrap">
                          <div>
                            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wide block">
                              {sub.quizType === "coding_challenge" ? "💻 Défi de Programmation" : sub.quizType === "fllblanks" ? "📝 Remplissage de code" : "🎯 Questionnaire QCM"}
                            </span>
                            <h4 className="font-bold text-[#0F1E36] text-[13px] mt-0.5">{sub.quizTitle}</h4>
                            <p className="text-gray-400 text-[10px] mt-0.5">Terminé le : {dateFormatted}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-lg font-black text-xs ${
                              sub.score >= 80 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-250" 
                                : sub.score >= 50 
                                ? "bg-amber-50 text-amber-700 border border-amber-250" 
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                              {sub.score}%
                            </span>
                            <span className="text-[10px] text-gray-400 block mt-1 font-mono font-bold">
                              {sub.correctCount} / {sub.totalQuestions} correct
                            </span>
                          </div>
                        </div>

                        {/* Visual micro progress bar */}
                        <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                          <div 
                            className={`h-1 rounded-full transition-all duration-300 ${
                              sub.score >= 80 ? "bg-[#10B981]" : sub.score >= 50 ? "bg-amber-500" : "bg-[#EF4444]"
                            }`}
                            style={{ width: `${sub.score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 border border-dashed border-[#E5E7EB] rounded-xl text-center text-xs bg-[#F9FAFB]">
                  <p className="font-semibold text-gray-500">Aucun quiz résolu pour le moment</p>
                  <p className="text-gray-400 mt-1 max-w-xs mx-auto">
                    Accédez au module "Quiz Interactifs" depuis la barre de navigation pour tester vos compétences en Python et algorithmique tunisienne !
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: SIMULATION CONTROLS PANEL */}
        <div className="lg:col-span-4 space-y-6">

          {/* USER PREFERENCES PANEL */}
          <div className="border border-[#E5E7EB] rounded-2xl p-4 bg-white space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
              <span className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-550">
                <Settings size={14} className="text-emerald-500" />
              </span>
              <h3 className="text-[#0F1E36] font-semibold text-xs">
                Préférences de l'interface
              </h3>
            </div>
            <p className="text-[11px] text-gray-400 leading-normal">
              Personnalisez la position du bouton de retour en haut de page. Vos préférences sont conservées pour toutes vos sessions de navigation.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onScrollTopPositionChange("top-left")}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  scrollTopPosition === "top-left"
                    ? "border-emerald-500 bg-emerald-50/20 text-[#10B981] font-semibold"
                    : "border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 text-gray-500"
                }`}
              >
                <ArrowUpLeft size={16} className={scrollTopPosition === "top-left" ? "text-emerald-500" : "text-gray-400"} />
                <span className="text-[10px]">Haut gauche</span>
              </button>

              <button
                onClick={() => onScrollTopPositionChange("top-right")}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  scrollTopPosition === "top-right"
                    ? "border-emerald-500 bg-emerald-50/20 text-[#10B981] font-semibold"
                    : "border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 text-gray-500"
                }`}
              >
                <ArrowUpRight size={16} className={scrollTopPosition === "top-right" ? "text-emerald-500" : "text-gray-400"} />
                <span className="text-[10px]">Haut droite</span>
              </button>

              <button
                onClick={() => onScrollTopPositionChange("bottom-left")}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  scrollTopPosition === "bottom-left"
                    ? "border-emerald-500 bg-emerald-50/20 text-[#10B981] font-semibold"
                    : "border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 text-gray-500"
                }`}
              >
                <ArrowDownLeft size={16} className={scrollTopPosition === "bottom-left" ? "text-emerald-500" : "text-gray-400"} />
                <span className="text-[10px]">Bas gauche</span>
              </button>

              <button
                onClick={() => onScrollTopPositionChange("bottom-right")}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  scrollTopPosition === "bottom-right"
                    ? "border-emerald-500 bg-emerald-50/20 text-[#10B981] font-semibold"
                    : "border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 text-gray-500"
                }`}
              >
                <ArrowDownRight size={16} className={scrollTopPosition === "bottom-right" ? "text-emerald-500" : "text-gray-400"} />
                <span className="text-[10px]">Bas droite</span>
              </button>
            </div>

            {/* Choix de l'icône */}
            <div className="border-t border-gray-100 pt-3">
              <h4 className="text-[#0F1E36] font-medium text-[11px] mb-2">
                Style de l'icône de retour en haut
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => onScrollTopIconChange("arrow")}
                  className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    scrollTopIcon === "arrow"
                      ? "border-emerald-500 bg-emerald-50/20 text-[#10B981] font-semibold"
                      : "border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 text-gray-500"
                  }`}
                >
                  <ArrowUp size={16} className={scrollTopIcon === "arrow" ? "text-emerald-500" : "text-gray-400"} />
                  <span className="text-[10px]">Flèche</span>
                </button>

                <button
                  type="button"
                  onClick={() => onScrollTopIconChange("chevron")}
                  className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    scrollTopIcon === "chevron"
                      ? "border-emerald-500 bg-emerald-50/20 text-[#10B981] font-semibold"
                      : "border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 text-gray-500"
                  }`}
                >
                  <ChevronUp size={16} className={scrollTopIcon === "chevron" ? "text-emerald-500" : "text-gray-400"} />
                  <span className="text-[10px]">Chevron</span>
                </button>

                <button
                  type="button"
                  onClick={() => onScrollTopIconChange("chevrons")}
                  className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    scrollTopIcon === "chevrons"
                      ? "border-emerald-500 bg-emerald-50/20 text-[#10B981] font-semibold"
                      : "border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 text-gray-500"
                  }`}
                >
                  <ChevronsUp size={16} className={scrollTopIcon === "chevrons" ? "text-emerald-500" : "text-gray-400"} />
                  <span className="text-[10px]">Double Chevron</span>
                </button>
              </div>
            </div>

            {/* Visibilité sur mobile */}
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-[#0F1E36] font-medium text-[11px]">
                  Masquer sur mobile
                </h4>
                <p className="text-[10px] text-gray-400">
                  Évite les clics accidentels sur smartphone
                </p>
              </div>
              <button
                type="button"
                onClick={() => onHideScrollTopOnMobileChange(!hideScrollTopOnMobile)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  hideScrollTopOnMobile ? "bg-emerald-500" : "bg-gray-200"
                }`}
                aria-label="Toggle mobile visibility"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    hideScrollTopOnMobile ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* ADMIN QUEUE ENROLLMENT MANAGER */}
          {currentUser.role === "admin" && (
            <div className="border border-[#E5E7EB] rounded-2xl p-4 bg-white space-y-3">
              <h3 className="text-[#0F1E36] font-semibold text-xs border-b border-[#E5E7EB] pb-1">
                Validation Manuelle d'Élèves
              </h3>
              <p className="text-[11px] text-gray-400">
                Abonnés enregistrés requérant une revue de reçu bancaire ou de transfert téléphonique.
              </p>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {allUsersList.filter(u => u.role !== "admin").map((student) => {
                  const isPremium = student.subscriptionExpiresAt && new Date(student.subscriptionExpiresAt).getTime() > Date.now();
                  return (
                    <div key={student.id} className="p-3 border border-[#E5E7EB] rounded-xl space-y-2 bg-white text-xs text-left">
                      <div className="flex justify-between items-start gap-1">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#0F1E36] truncate">{student.fullName}</p>
                          <p className="text-[10px] text-gray-400 truncate">{student.email}</p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${isPremium ? "bg-emerald-50 text-[#10B981] border border-[#10B981]/20" : "bg-red-50 text-[#EF4444] border border-[#EF4444]/20"}`}>
                          {isPremium ? "Vérifié" : "Inactif"}
                        </span>
                      </div>
                      
                      {!isPremium && (
                        <button
                          onClick={() => handleApproveStudent(student.id)}
                          className="w-full text-center py-1 bg-[#10B981] hover:bg-[#0da673] text-white rounded font-medium text-[9px] cursor-pointer transition-colors"
                        >
                          Approuver d'un clic
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
      )}

    </div>
  );
}
