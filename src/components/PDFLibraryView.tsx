import React, { useState, useEffect } from "react";
import { 
  FileText, 
  UploadCloud, 
  History, 
  ArrowRight, 
  Bookmark, 
  ExternalLink, 
  Cloud, 
  FolderOpen, 
  Search, 
  Sparkles, 
  Clock, 
  Lock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Layers
} from "lucide-react";
import { motion } from "motion/react";
import { usePDF } from "./PDFContext";
import EBookReader from "./EBookReader";

export function BibliothequeWrapper({ ebooks, isPremiumUser, searchQuery, userRole, onGoToShop, initialSubTab = "ebooks" }: any) {
  const [activeSubTab, setActiveSubTab] = useState<"ebooks" | "pdf">(initialSubTab);

  // Listen to custom tab switches to automatically switch to the PDF sub-tab if needed
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
    </div>
  );
}

interface PDFLibraryViewProps {
  isPremiumUser: boolean;
  onGoToShop?: () => void;
}

export default function PDFLibraryView({ isPremiumUser, onGoToShop }: PDFLibraryViewProps) {
  const { openPDF, pdfHistory, clearHistory } = usePDF();
  const [dragActive, setDragActive] = useState(false);
  const [selectedCloudProvider, setSelectedCloudProvider] = useState<"none" | "google" | "local">("none");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Google Drive Simulation State
  const [isDriveConnecting, setIsDriveConnecting] = useState(false);
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [driveFiles, setDriveFiles] = useState<Array<{ id: string; name: string; size: string; topic: string; url: string }>>([]);

  // Preloaded Tunisian curriculum courses PDFs
  const preloadedPDFs = [
    {
      id: "cur_1",
      name: "Cahier des Charges - Algorithmique & Programmation (4ème SI)",
      url: "/public/uploads/course_1784143617090_A-Zed-Info_Cahier_des_Charges.pdf",
      topic: "Algorithmique",
      size: "1.4 MB",
      badge: "Tunisian Bac"
    },
    {
      id: "cur_2",
      name: "Rapport Startup Cloud Tunisie - Écosystème Numérique",
      url: "/public/uploads/course_1784145483650_comprehensive_tunisian_startup_cloud_report.pdf",
      topic: "Technologies Web",
      size: "2.1 MB",
      badge: "Sujet Élite"
    },
    {
      id: "cur_3",
      name: "Application Qt5 Graphique (Trigonométrie cos/sin en Python)",
      url: "/public/uploads/course_1784146102031_Application-Qt5-cos-sin.pdf",
      topic: "Python & GUI",
      size: "650 KB",
      badge: "Pratique"
    }
  ];

  // Simulated Google Drive PDF resources
  const mockDrivePDFs = [
    {
      id: "drive_1",
      name: "Support_Cours_Structures_Donnees_Tunisie.pdf",
      size: "1.1 MB",
      topic: "Structures de Données (Enregistrement, Tableaux)",
      url: "/public/uploads/course_1784143617090_A-Zed-Info_Cahier_des_Charges.pdf"
    },
    {
      id: "drive_2",
      name: "TD_Recursivite_Bac_SI_Correction.pdf",
      size: "820 KB",
      topic: "Fonctions récursives & diviser pour régner",
      url: "/public/uploads/course_1784146102031_Application-Qt5-cos-sin.pdf"
    },
    {
      id: "drive_3",
      name: "Fiche_Synthese_Bases_de_Donnees_SQL.pdf",
      size: "1.5 MB",
      topic: "SGBD, Clés primaires & requêtes LDD/LMD",
      url: "/public/uploads/course_1784145483650_comprehensive_tunisian_startup_cloud_report.pdf"
    }
  ];

  // Drag and Drop handlers
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
    setUploadError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processUploadedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setUploadError("Format incorrect. Veuillez importer un fichier au format .pdf uniquement.");
      return;
    }
    
    // Create local object URL for native iframe rendering
    const objectUrl = URL.createObjectURL(file);
    openPDF(objectUrl, file.name);
  };

  // Google Drive Connection sequence
  const connectToGoogleDrive = () => {
    setIsDriveConnecting(true);
    // Simulate popup or oauth handshake
    setTimeout(() => {
      setIsDriveConnecting(false);
      setIsDriveConnected(true);
      setDriveFiles(mockDrivePDFs);
    }, 1800);
  };

  const filteredPreloaded = preloadedPDFs.filter((pdf) =>
    pdf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pdf.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#0F1E36] p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-extrabold uppercase px-2 py-0.5 rounded tracking-wide">
              Bibliothèque Intégrée
            </span>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-extrabold uppercase px-2 py-0.5 rounded tracking-wide flex items-center gap-1">
              <Sparkles size={10} /> Mode Élite
            </span>
          </div>
          <h2 className="text-[#0F1E36] dark:text-white font-black text-xl tracking-tight mt-1">
            Lecteur & Bibliothèque PDF
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
            Consultez vos cours tunisiens, importez vos propres documents locaux ou connectez votre Google Drive pour étudier en toute liberté.
          </p>
        </div>

        {/* Global Search inside library */}
        <div className="relative w-full sm:w-64 shrink-0">
          <input 
            type="text" 
            placeholder="Rechercher un document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs py-2 pl-8 pr-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/40 text-gray-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-gray-400"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* THREE PANELS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PANEL 1: PRELOADED SYLLABUS PDFS */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-black tracking-tight text-[#0F1E36] dark:text-white uppercase flex items-center gap-2 text-left">
            <FolderOpen size={16} className="text-emerald-600" />
            Supports de Cours Recommandés (Tunisie)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPreloaded.map((pdf) => (
              <motion.div 
                key={pdf.id}
                whileHover={{ 
                  scale: 1.025,
                  y: -4,
                  boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.1)"
                }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="bg-white dark:bg-[#0F1E36] p-4 rounded-xl border border-gray-150 dark:border-slate-800 flex flex-col justify-between transition-colors shadow-xs"
              >
                <div className="text-left">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded font-black uppercase">
                      {pdf.topic}
                    </span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded">
                      {pdf.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-[#0F1E36] dark:text-white tracking-tight mt-2.5 leading-snug line-clamp-2">
                    {pdf.name}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 font-semibold">{pdf.size}</span>
                  <a 
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <FileText size={12} />
                    Lire en natif
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CLOUD CONNECT PORTAL (GOOGLE DRIVE) */}
          <div className="bg-[#F8FAFC] dark:bg-[#0c182d] p-6 rounded-2xl border border-gray-200 dark:border-slate-850">
            <div className="flex items-start gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 shrink-0">
                <Cloud size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black text-[#0F1E36] dark:text-white tracking-tight">
                  Importation Google Drive (.pdf)
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Connectez votre compte Google Drive en toute sécurité pour parcourir vos classeurs de cours et vos fiches d'exercices PDF sauvegardées.
                </p>

                {!isDriveConnected ? (
                  <button
                    onClick={connectToGoogleDrive}
                    disabled={isDriveConnecting}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isDriveConnecting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        <Cloud size={14} />
                        Associer mon Google Drive
                      </>
                    )}
                  </button>
                ) : (
                  <div className="mt-4 p-4 bg-white dark:bg-[#0F1E36] rounded-xl border border-gray-150 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2.5">
                      <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                        <CheckCircle size={12} /> COMPTE GOOGLE DRIVE CONNECTÉ
                      </span>
                      <button 
                        onClick={() => setIsDriveConnected(false)}
                        className="text-[10px] text-red-500 hover:underline font-bold"
                      >
                        Déconnecter
                      </button>
                    </div>

                    <div className="space-y-2">
                      {driveFiles.map((file) => (
                        <div 
                          key={file.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-slate-900/60 hover:bg-gray-100 transition-colors text-xs text-left"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText size={14} className="text-blue-500 shrink-0" />
                            <div className="truncate">
                              <p className="font-extrabold text-gray-800 dark:text-white truncate">{file.name}</p>
                              <p className="text-[10px] text-gray-400">{file.topic}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] text-gray-400">{file.size}</span>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-gray-900 hover:bg-black text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-md font-bold text-[10px] cursor-pointer inline-block text-center"
                            >
                              Ouvrir
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 2: LOCAL DRAG & DROP + READING HISTORY */}
        <div className="space-y-6">
          
          {/* DRAG AND DROP AREA */}
          <div className="space-y-3 text-left">
            <h3 className="text-sm font-black tracking-tight text-[#0F1E36] dark:text-white uppercase flex items-center gap-2">
              <UploadCloud size={16} className="text-blue-600" />
              Lecteur PDF Local (Glisser-Déposer)
            </h3>

            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                dragActive 
                  ? "border-blue-500 bg-blue-500/10 scale-[1.02]" 
                  : "border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F1E36] hover:border-blue-500/50"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-500 mx-auto mb-3">
                <UploadCloud size={24} />
              </div>
              <p className="text-xs font-black text-gray-700 dark:text-white">Glissez votre fichier PDF ici</p>
              <p className="text-[10px] text-gray-400 mt-1">ou cliquez ci-dessous pour le chercher</p>

              <label className="mt-4 inline-block">
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5">
                  Rechercher un fichier...
                </span>
              </label>

              {uploadError && (
                <div className="mt-3 text-[10px] text-red-500 font-extrabold flex items-center gap-1 justify-center bg-red-50 dark:bg-red-950/20 p-2 rounded-lg border border-red-100 dark:border-red-900/30">
                  <AlertCircle size={12} />
                  {uploadError}
                </div>
              )}
            </div>
          </div>

          {/* RECENT HISTORIC READS */}
          <div className="space-y-3 text-left">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black tracking-tight text-[#0F1E36] dark:text-white uppercase flex items-center gap-2">
                <History size={16} className="text-emerald-600" />
                Dernières Lectures
              </h3>
              {pdfHistory.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-[10px] text-gray-400 hover:text-red-500 font-bold"
                >
                  Effacer
                </button>
              )}
            </div>

            <div className="bg-white dark:bg-[#0F1E36] rounded-2xl border border-gray-150 dark:border-slate-800 overflow-hidden divide-y divide-gray-100 dark:divide-slate-800">
              {pdfHistory.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  <Clock size={20} className="mx-auto mb-2 text-gray-300" />
                  Aucune lecture récente. Ouvrez un fichier PDF pour commencer votre historique.
                </div>
              ) : (
                pdfHistory.map((item, idx) => {
                  const savedPage = localStorage.getItem(`pdf_pos_${item.url}`) || "1";
                  return (
                    <div 
                      key={idx}
                      className="p-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-850/30 transition-colors"
                    >
                      <div className="min-w-0 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="truncate text-left">
                          <p className="text-xs font-black text-gray-800 dark:text-white truncate">{item.name}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            Page de reprise : <span className="text-emerald-600 font-extrabold">{savedPage}</span>
                          </p>
                        </div>
                      </div>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-gray-100 hover:bg-gray-950 dark:bg-slate-800 dark:hover:bg-emerald-600 rounded-lg text-gray-600 dark:text-white hover:text-white transition-all cursor-pointer flex items-center justify-center"
                        title="Reprendre l'étude"
                      >
                        <ArrowRight size={13} />
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
