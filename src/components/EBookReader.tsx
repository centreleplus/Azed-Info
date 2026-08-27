import { useState, useEffect } from "react";
import { BookOpen, ShieldCheck, Lock, ArrowLeft, ArrowRight, Clock, AlertTriangle, Search, Book } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EBook } from "../types";
import { useSettings } from "./SettingsContext";

interface EBookReaderProps {
  ebooks: EBook[];
  isPremiumUser: boolean;
  searchQuery?: string;
  userRole?: string;
  onGoToShop?: () => void;
}

export default function EBookReader({ ebooks, isPremiumUser, searchQuery = "", userRole, onGoToShop }: EBookReaderProps) {
  const { settings } = useSettings();
  const [selectedEbookId, setSelectedEbookId] = useState(ebooks[0]?.id || "");
  const [currentPage, setCurrentPage] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes secure pre-signed limit
  const [piracyWarning, setPiracyWarning] = useState<string | null>(null);
  const [isFlippingRight, setIsFlippingRight] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (ebooks.length > 0 && !selectedEbookId) {
      setSelectedEbookId(ebooks[0].id);
    }
  }, [ebooks, selectedEbookId]);

  const selectedEbook = ebooks.find((eb) => eb.id === selectedEbookId) || ebooks[0];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) return 900;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedEbookId]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setPiracyWarning("Sécurité Cyber-Architect : Clic-droit désengagé pour protéger les écrits.");
      setTimeout(() => setPiracyWarning(null), 3000);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && (e.key === "s" || e.key === "p" || e.key === "u")) || e.key === "F12") {
        e.preventDefault();
        setPiracyWarning("Interception de Raccourcis : Sauvegarde & Impression bloquées.");
        setTimeout(() => setPiracyWarning(null), 3000);
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handlePrevPage = () => {
    if (currentPage > 0 && !isAnimating) {
      setIsFlippingRight(false);
      setIsAnimating(true);
      setCurrentPage((prev) => prev - 2);
    }
  };

  const handleNextPage = () => {
    if (selectedEbook && currentPage < selectedEbook.chapters.length - 2 && !isAnimating) {
      setIsFlippingRight(true);
      setIsAnimating(true);
      setCurrentPage((prev) => prev + 2);
    }
  };

  // Search filter across books and chapters if a query is active
  const filteredEbooks = ebooks.filter(eb => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    return (
      eb.title.toLowerCase().includes(query) ||
      eb.description.toLowerCase().includes(query) ||
      eb.chapters.some(ch => ch.toLowerCase().includes(query))
    );
  });

  if (!selectedEbook) {
    return (
      <div className="p-10 text-center border border-dashed border-[#E5E7EB] rounded-2xl bg-white max-w-lg mx-auto">
        <BookOpen size={28} className="text-[#0F1E36] mx-auto mb-3" />
        <h3 className="font-semibold text-[#0F1E36] mb-1 text-sm">
          Aucun ouvrage interactif trouvé
        </h3>
        <p className="text-xs text-gray-500">
          Modifiez vos mots-clés de recherche ou attendez la validation d'accès.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative bg-white min-h-[550px]">
      
      {piracyWarning && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#0F1E36] text-white text-xs border border-red-500 shadow-2xl flex items-center gap-2 max-w-sm font-semibold select-none animate-bounce">
          <AlertTriangle size={16} className="text-[#EF4444] shrink-0" />
          <span>{piracyWarning}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Book Select rail list */}
        <div className="lg:col-span-3 space-y-2.5">
          <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 border-b border-[#E5E7EB] pb-1">
            Manuels Disponibles ({filteredEbooks.length})
          </div>
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
            {filteredEbooks.map((eb) => {
              const isSelected = eb.id === selectedEbookId;
              const isReadLocked = eb.isPremium && !isPremiumUser;

              return (
                <button
                  key={eb.id}
                  onClick={() => {
                    setSelectedEbookId(eb.id);
                    setCurrentPage(0);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-[#10B981] border-[#10B981] text-white shadow-xs"
                      : "bg-white border-[#E5E7EB] text-[#1F2937] hover:bg-gray-50"
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className={`font-semibold truncate ${isSelected ? "text-white" : "text-[#0F1E36]"}`}>{eb.title}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? "text-gray-100" : "text-gray-400"}`}>{eb.grade}</div>
                  </div>
                  {isReadLocked && (
                    <Lock size={12} className={isSelected ? "text-white" : "text-[#EF4444]"} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3D Page Turning Screen Container */}
        <div className="lg:col-span-9">
          {selectedEbook.isPremium && !isPremiumUser ? (
            <div className="rounded-2xl border border-[#E5E7EB] p-10 text-center flex flex-col items-center justify-center bg-[#F9FAFB]">
              <div className="p-3 bg-red-50 text-[#EF4444] rounded-full mb-3">
                <Lock size={28} />
              </div>
              <h3 className="font-semibold text-[#0F1E36] text-sm mb-1">
                Manuel de Référence Restreint
              </h3>
              <p className="text-gray-500 text-xs max-w-sm leading-relaxed mb-4">
                Ce contenu interactif de premier plan est réservé aux élèves porteurs d'un abonnement Premium actif.
              </p>
              <div className="inline-flex py-1.5 px-3 rounded-lg bg-white border border-[#E5E7EB] text-[11px] text-gray-650 font-bold mb-4">
                💳 Tarif Annuel : 120 DT tout inclus - Soumettre le reçu dans le Profil
              </div>
              <button
                onClick={() => {
                  if (onGoToShop) {
                    onGoToShop();
                  } else {
                    setShowUpgradeModal(true);
                  }
                }}
                className="px-5 py-2.5 hover:bg-red-750 text-white font-extrabold bg-[#E31B23] rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-sm shadow-red-500/20 transition-all active:scale-95 duration-100"
              >
                <Lock size={14} />
                <span>Débloquer l'offre Premium ⭐</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Actual 3D Flipbook component simulation */}
              <div 
                className="relative bg-neutral-100 p-4 md:p-6 rounded-3xl shadow-inner border border-neutral-300 flex justify-center items-center overflow-hidden"
                style={{ perspective: "1500px" }}
              >
                {/* Book Spine shadow center mark */}
                <div className="absolute top-0 bottom-0 left-1/2 w-4 -ml-2 bg-gradient-to-r from-black/15 via-black/5 to-black/15 z-20 pointer-events-none" />

                {/* Double Pages Grid */}
                <div className="w-full max-w-4xl aspect-[1.4/1] bg-white rounded-xl shadow-lg relative grid grid-cols-2 overflow-hidden border border-neutral-250">
                  
                  {/* LEFT PAGE */}
                  <div className="p-6 md:p-8 border-r border-[#E5E7EB] flex flex-col justify-between relative bg-gradient-to-r from-neutral-50/50 to-white">
                    <div className="space-y-3">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[#10B981]">
                        {selectedEbook.title}
                      </span>
                      
                      <h4 className="font-semibold text-[#0F1E36] text-sm md:text-base border-b border-[#E5E7EB] pb-2">
                        {selectedEbook.chapters[currentPage] || "Fiches Pratiques"}
                      </h4>
                      
                      <div className="text-xs text-[#1F2937] leading-relaxed font-normal min-h-[140px] pt-1">
                        {/* Page body content */}
                        Ce support pédagogique est élaboré en stricte conformité avec les directives académiques des inspecteurs tunisiens d'Informatique. 
                        Il synthétise les compétences indispensables de programmation Python, et prépare le candidat au 20/20 pratique sous le mentorat de M. Nabil Chaouch.
                        <div className="mt-2.5 p-2 bg-[#F9FAFB] rounded border border-[#E5E7EB] text-[10px] font-mono text-gray-500">
                          # Exercice d'échauffement:
                          <br />
                          print("A-Zed Info Active Learning")
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-gray-400 border-t border-[#E5E7EB] pt-2">
                      <span>A-Zed E-Reader Premium v3</span>
                      <span>Page {currentPage + 1}</span>
                    </div>
                  </div>

                  {/* RIGHT PAGE */}
                  <div className="p-6 md:p-8 flex flex-col justify-between relative bg-gradient-to-l from-neutral-50/50 to-white">
                    <div className="space-y-3">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-rose-500">
                        Section Annexes
                      </span>
                      
                      <h4 className="font-semibold text-[#0F1E36] text-sm md:text-base border-b border-[#E5E7EB] pb-2">
                        {selectedEbook.chapters[currentPage + 1] || "Applications & Sandbox"}
                      </h4>
                      
                      <div className="text-xs text-[#1F2937] leading-relaxed font-normal min-h-[140px] pt-1">
                        {selectedEbook.chapters[currentPage + 1] ? (
                          <>
                            Les notions clés de cette section feront l'objet de travaux appliqués en direct.
                            Nous vous recommandons de copier les prototypes de fonctions dans notre Éditeur Python Sandbox intégré pour mener des simulations de flux d'entrée-sortie et déboguer les résultats.
                            Préparez vos questions pour le prochain séminaire Zoom interactif programmé au calendrier.
                          </>
                        ) : (
                          <p className="italic text-gray-400">
                            Fin de l'ouvrage interactif. Profitez des fiches de synthèse gratuites téléchargeables ou passez vers le module suivant depuis le catalogue de cours vidéos.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-gray-400 border-t border-[#E5E7EB] pt-2">
                      <span>Page {Math.min(currentPage + 2, selectedEbook.chapters.length)}</span>
                      <span>S3 Secure Reader</span>
                    </div>
                  </div>

                  {/* Animated Overlay for realistic flipping page */}
                  <AnimatePresence 
                    mode="wait" 
                    onExitComplete={() => setIsAnimating(false)}
                  >
                    {isAnimating && (
                      <motion.div
                        key={currentPage}
                        initial={{ rotateY: isFlippingRight ? 0 : -180, opacity: 0.9 }}
                        animate={{ rotateY: isFlippingRight ? -180 : 0, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                        className="absolute top-0 bottom-0 w-1/2 bg-white border-l border-neutral-200 shadow-2xl z-15 origin-left"
                        style={{ left: isFlippingRight ? "50%" : "0" }}
                      >
                        <div className="w-full h-full p-8 bg-neutral-50 border-r border-neutral-300 flex flex-col justify-between">
                          <div className="w-4 h-4 rounded-full border border-[#10B981] animate-ping ml-auto" />
                          <span className="text-[10px] font-semibold text-[#10B981] uppercase tracking-wider mx-auto">
                            Tourne...
                          </span>
                          <span className="text-[8px] text-gray-300 font-mono text-center">Page Turn Active</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>

              {/* flipbook navigation tools */}
              <div className="border border-[#E5E7EB] rounded-2xl p-4 bg-white flex items-center justify-between text-xs font-semibold select-none">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0 || isAnimating}
                  className="px-4 py-2 border border-[#E5E7EB] hover:bg-gray-50 text-[#1F2937] rounded-lg disabled:opacity-40 cursor-pointer flex items-center gap-1.5 transition-all text-xs"
                >
                  <ArrowLeft size={14} /> 
                  <span>Précédent</span>
                </button>

                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#10B981]" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest hidden md:inline">
                    Reliure physique active • {currentPage + 2} de {selectedEbook.chapters.length} pages
                  </span>
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= selectedEbook.chapters.length - 2 || isAnimating}
                  className="px-4 py-2 bg-[#10B981] hover:bg-[#0da673] text-white rounded-lg disabled:opacity-40 cursor-pointer flex items-center gap-1.5 transition-all text-xs"
                >
                  <span>Suivant</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE DEBLOCAGE DE L'OFFRE PREMIUM */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity text-left">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 bg-red-50 border-b border-red-100 flex justify-between items-center text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#E11D48]/15 flex items-center justify-center text-[#E11D48] shrink-0">
                  <Lock size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#E11D48] uppercase tracking-wider block">Option Freemium Active 🖥️</span>
                  <h3 className="text-[#0F1E36] font-extrabold text-sm tracking-tight mt-0.5">Accéder aux Manuels Interactifs Premium</h3>
                </div>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-400 hover:text-gray-650 bg-white p-1 rounded-full border border-gray-200 cursor-pointer text-xs w-6 h-6 flex items-center justify-center shadow-3xs"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                Vous utilisez actuellement la version <strong>Freemium gratuite</strong> d'A-Zed Info. Pour débloquer l'accès complet et illimité à l'ensemble de nos manuels scolaires interactifs, chapitres exclusifs, codes sources Python, et webinaires Zoom en direct :
              </p>

              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-2 text-xs">
                  <span className="font-bold text-[#0F1E36]">Formule Premium Annuelle / Toutes Options</span>
                  <span className="font-mono font-black text-emerald-650 text-right">120 DT / Académique</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-gray-500">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Accès illimité à tous les cours vidéos & fiches PDF de révision</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Accès aux travaux pratiques d'évaluation et solutions d'examens BAC</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Compilateur Python & IA Coach en autonomie complète</span>
                  </li>
                </ul>
              </div>

              <div className="border border-[#10B981]/20 bg-[#10B981]/5 rounded-2xl p-4 space-y-2 text-xs">
                <h4 className="font-bold text-[#0F1E36] flex items-center gap-1">
                  <span>🚀 Comment procéder à l'activation ?</span>
                </h4>
                <p className="text-[11px] text-gray-600 leading-normal">
                  Effectuez un transfert de <strong>120 DT</strong> par virement bancaire sur notre <strong>RIB {settings.payments.rib.bankName} ({settings.payments.rib.ribNumber})</strong> ou par transfert postal rapide par <strong>D17 (Mobile: {settings.payments.d17.phone})</strong>.
                </p>
                <p className="text-[11px] text-gray-600 leading-normal font-semibold">
                  Une fois le transfert effectué, déposez la capture d'écran de votre reçu directement depuis l'onglet "Mon Espace Profil" &rarr; "Justifier l'Acquisition" pour une validation instantanée !
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-wrap justify-end gap-2 text-xs">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-250 hover:bg-gray-50 rounded-xl cursor-pointer"
              >
                Repasser plus tard
              </button>
              {onGoToShop && (
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    onGoToShop();
                  }}
                  className="px-5 py-2 font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>S'abonner sur le Shop (120 DT)</span>
                  <span>🚀</span>
                </button>
              )}
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  alert("Pour charger votre reçu de paiement, veuillez vous diriger vers l'onglet 'Mon Espace Profil' !");
                }}
                className="px-5 py-2 font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Téléverser mon reçu</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
