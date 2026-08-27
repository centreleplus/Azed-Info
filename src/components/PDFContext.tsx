import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { 
  FileText, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Printer, 
  Maximize2, 
  Minimize2, 
  Search, 
  Sparkles, 
  MessageSquare, 
  Highlighter, 
  StickyNote, 
  Moon, 
  Sun, 
  History, 
  Bookmark, 
  Share2, 
  Eye, 
  Check, 
  UploadCloud,
  FileDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "./AuthContext";

// PDF Annotation Interface
interface PDFHighlight {
  id: string;
  page: number;
  text?: string;
  note?: string;
  color: string; // "yellow" | "green" | "blue" | "pink"
  x: number; // relative coordinate percentage
  y: number; // relative coordinate percentage
  createdAt: string;
}

interface PDFHistoryItem {
  url: string;
  name: string;
  timestamp: number;
}

interface PDFContextType {
  openPDF: (url: string, name: string) => void;
  closePDF: () => void;
  currentPDF: { url: string; name: string } | null;
  isOpen: boolean;
  pdfHistory: PDFHistoryItem[];
  clearHistory: () => void;
}

const PDFContext = createContext<PDFContextType | undefined>(undefined);

export function usePDF() {
  const context = useContext(PDFContext);
  if (!context) {
    throw new Error("usePDF must be used within a PDFProvider");
  }
  return context;
}

export function PDFProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPDF, setCurrentPDF] = useState<{ url: string; name: string } | null>(null);
  const [pdfHistory, setPdfHistory] = useState<PDFHistoryItem[]>([]);

  // Load PDF history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pdf_history");
    if (saved) {
      try {
        setPdfHistory(JSON.parse(saved));
      } catch (e) {
        setPdfHistory([]);
      }
    }
  }, []);

  const openPDF = (url: string, name: string) => {
    // Open in a new window/tab using standard native behavior
    window.open(url, "_blank", "noopener,noreferrer");

    // Save to history
    const newItem: PDFHistoryItem = { url, name, timestamp: Date.now() };
    setPdfHistory((prev) => {
      const filtered = prev.filter((item) => item.url !== url);
      const updated = [newItem, ...filtered].slice(0, 15); // limit to 15 items
      localStorage.setItem("pdf_history", JSON.stringify(updated));
      return updated;
    });
  };

  const closePDF = () => {
    setIsOpen(false);
    setCurrentPDF(null);
  };

  const clearHistory = () => {
    setPdfHistory([]);
    localStorage.removeItem("pdf_history");
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closePDF();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <PDFContext.Provider value={{ openPDF, closePDF, currentPDF, isOpen, pdfHistory, clearHistory }}>
      {children}
      <InteractivePDFViewerModal />
    </PDFContext.Provider>
  );
}

function FloatingPDFButton() {
  const { user } = useAuth();
  const { openPDF, pdfHistory } = usePDF();
  const [isFabOpen, setIsFabOpen] = useState(false);
  
  if (!user || user.role !== "student") return null;
  
  const lastPdf = pdfHistory[0];
  
  return (
    <div className="fixed bottom-28 right-6 z-45 flex flex-col items-end gap-2">
      {/* Floating expanded options */}
      <AnimatePresence>
        {isFabOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-2xl flex flex-col gap-2 w-64 text-left border-blue-500/20"
          >
            <div className="border-b border-slate-800 pb-2 mb-1">
              <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider block">Lecteur PDF Nomade</span>
              <span className="text-xs text-white font-extrabold">Accès rapide nomade</span>
            </div>
            
            {lastPdf ? (
              <button
                onClick={() => {
                  openPDF(lastPdf.url, lastPdf.name);
                  setIsFabOpen(false);
                }}
                className="w-full p-2.5 rounded-xl bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 hover:border-blue-500 transition-all text-xs text-slate-200 hover:text-white font-bold flex items-center gap-2 cursor-pointer group"
              >
                <div className="w-7 h-7 rounded bg-blue-500/20 group-hover:bg-white/20 flex items-center justify-center shrink-0">
                  📖
                </div>
                <div className="truncate flex-1 text-left">
                  <span className="text-[9px] text-blue-400 group-hover:text-blue-100 block font-black">Reprendre la lecture :</span>
                  <span className="truncate block text-[11px] font-bold">{lastPdf.name}</span>
                </div>
              </button>
            ) : (
              <div className="text-[10px] text-slate-500 italic p-2 text-center font-medium">Aucun document récent</div>
            )}
            
            <button
              onClick={() => {
                const event = new CustomEvent("change-tab", { detail: "bibliotheque" });
                window.dispatchEvent(event);
                // Dispatch subtab switch event with 50ms delay to let the page mount
                setTimeout(() => {
                  const subTabEvent = new CustomEvent("change-pdf-subtab", { detail: "pdf-library" });
                  window.dispatchEvent(subTabEvent);
                }, 50);
                setIsFabOpen(false);
              }}
              className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs text-slate-200 hover:text-white font-bold flex items-center gap-3 cursor-pointer group border border-slate-750"
            >
              <div className="w-7 h-7 rounded bg-slate-700 group-hover:bg-slate-600 flex items-center justify-center shrink-0">
                📚
              </div>
              <span className="font-bold text-left">Ouvrir la Bibliothèque</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger FAB */}
      <button
        onClick={() => setIsFabOpen(!isFabOpen)}
        className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 cursor-pointer hover:scale-110 active:scale-95 transition-all relative border border-blue-500 group"
        title="Lecteur PDF Nomade"
      >
        <FileText size={20} className={isFabOpen ? "rotate-90 transition-transform" : "transition-transform"} />
        {lastPdf && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[8px] font-black animate-pulse">
            !
          </span>
        )}
      </button>
    </div>
  );
}

// THE INTERACTIVE NATIVE PDF VIEWER MODAL
function InteractivePDFViewerModal() {
  return null;
}

interface PDFPageRendererProps {
  pdfDoc: any;
  pageNum: number;
  scale: number;
  key?: any;
}

function PDFPageRenderer({ pdfDoc, pageNum, scale }: PDFPageRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  // Re-run page rendering whenever the document, page number, or scale changes
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let active = true;
    let renderTask: any = null;

    setLoading(true);

    pdfDoc.getPage(pageNum).then((page: any) => {
      if (!active) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      const pixelRatio = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: scale * pixelRatio });
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / pixelRatio}px`;
      canvas.style.height = `${viewport.height / pixelRatio}px`;

      // Clear any previous drawing context completely to avoid superposition/overlapping text
      context.clearRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      renderTask = page.render(renderContext);
      renderTask.promise.then(() => {
        if (active) {
          setLoading(false);
        }
      }).catch((err: any) => {
        // Render was cancelled or replaced
      });
    });

    return () => {
      active = false;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pageNum, scale]);

  return (
    <div 
      id={`pdf-page-${pageNum}`}
      data-page={pageNum}
      className="relative my-4 bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden flex flex-col items-center transition-all duration-200"
      style={{ width: "fit-content" }}
    >
      <div className="absolute top-2 left-2 bg-[#0F1E36]/80 text-white text-[10px] px-2 py-0.5 rounded font-bold z-10 select-none">
        Page {pageNum}
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        className="block" 
      />
    </div>
  );
}

function InteractivePDFViewerModalContent() {
  const { currentPDF, closePDF } = usePDF();
  if (!currentPDF) return null;

  // PDF.js State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI Panels
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ page: number; text: string }[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Document Loader
  useEffect(() => {
    if (!currentPDF?.url) return;
    setLoading(true);
    setError(null);
    setPdfDoc(null);

    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib) {
      setError("Le chargeur de document PDF.js n'a pas pu être initialisé.");
      setLoading(false);
      return;
    }

    const loadingTask = pdfjsLib.getDocument(currentPDF.url);
    loadingTask.promise.then(
      (pdf: any) => {
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);

        // Restore last read position
        const savedPos = localStorage.getItem(`pdf_pos_${currentPDF.url}`);
        if (savedPos) {
          const p = parseInt(savedPos);
          if (p >= 1 && p <= pdf.numPages) {
            setPageNum(p);
          } else {
            setPageNum(1);
          }
        } else {
          setPageNum(1);
        }
      },
      (err: any) => {
        console.error("PDF.js loading error:", err);
        setError("Erreur : Impossible de lire ce fichier de manière native. Il se peut qu'il soit protégé ou indisponible.");
        setLoading(false);
      }
    );
  }, [currentPDF]);

  // Page Position Auto-saver based on pageNum state
  useEffect(() => {
    if (!currentPDF || pageNum < 1) return;
    localStorage.setItem(`pdf_pos_${currentPDF.url}`, pageNum.toString());
  }, [pageNum, currentPDF]);

  const scrollToPage = (p: number) => {
    if (p < 1 || p > numPages) return;
    setPageNum(p);
  };

  // Dynamic Fit Width Action
  const handleFitWidth = () => {
    if (!containerRef.current || !pdfDoc) return;
    pdfDoc.getPage(pageNum).then((page: any) => {
      const viewport = page.getViewport({ scale: 1.0 });
      const containerWidth = containerRef.current!.clientWidth - 64; // padding
      const newScale = containerWidth / viewport.width;
      setScale(Math.max(0.5, Math.min(newScale, 2.5)));
    });
  };

  // PDF Text Searching
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pdfDoc || !searchQuery.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    setIsSearching(true);
    const results: { page: number; text: string }[] = [];

    try {
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map((item: any) => item.str).join(" ");
        if (text.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ page: i, text });
        }
      }
      setSearchResults(results);
      if (results.length > 0) {
        setCurrentSearchIndex(0);
        scrollToPage(results[0].page);
      } else {
        setCurrentSearchIndex(-1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const navigateSearch = (direction: "prev" | "next") => {
    if (searchResults.length === 0) return;
    let nextIndex = currentSearchIndex;
    if (direction === "next") {
      nextIndex = (currentSearchIndex + 1) % searchResults.length;
    } else {
      nextIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    }
    setCurrentSearchIndex(nextIndex);
    scrollToPage(searchResults[nextIndex].page);
  };

  // Share Page Link Generator
  const handleShareLink = () => {
    const pageUrl = `${window.location.origin}${window.location.pathname}?pdf=${encodeURIComponent(currentPDF.url)}&page=${pageNum}`;
    navigator.clipboard.writeText(pageUrl);
    alert(`Lien généré et copié ! Accès direct à la page ${pageNum}.`);
  };

  // Native Print function
  const handlePrint = () => {
    const printWindow = window.open(currentPDF.url, "_blank");
    if (printWindow) {
      printWindow.addEventListener("load", () => {
        printWindow.print();
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-gray-100 text-gray-800 font-sans overflow-hidden">
      {/* 1. TOP UTILITY HEADER - THEME MATCHED */}
      <div className="h-16 bg-[#0F1E36] flex items-center justify-between px-4 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
            <FileText size={20} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold uppercase px-2 py-0.5 rounded tracking-wide border border-emerald-500/30">
                Lecteur Interactif
              </span>
              <span className="hidden md:inline text-[10px] bg-white/10 text-white/80 font-extrabold uppercase px-2 py-0.5 rounded tracking-wide border border-white/10">
                A-Zed Info
              </span>
            </div>
            <h3 className="text-white font-extrabold text-sm tracking-tight truncate max-w-[200px] sm:max-w-md mt-0.5">
              {currentPDF.name}
            </h3>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              showThumbnails ? "bg-emerald-500 text-white shadow-sm" : "bg-white/10 hover:bg-white/15 text-white"
            }`}
            title="Aperçu des miniatures"
          >
            <Bookmark size={15} />
            <span className="hidden sm:inline">Miniatures</span>
          </button>

          <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

          {/* Close button */}
          <button 
            onClick={closePDF}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all cursor-pointer font-extrabold w-9 h-9 flex items-center justify-center shadow-lg"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 2. THE MAIN WORKING AREA */}
      <div className="flex-1 flex overflow-hidden bg-gray-100 relative">
        
        {/* SIDE PANEL A: Thumbnails */}
        <AnimatePresence>
          {showThumbnails && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-gray-200 bg-white flex flex-col h-full overflow-hidden shrink-0"
            >
              <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <span className="text-xs font-extrabold tracking-wider uppercase text-gray-500">Pages du document</span>
                <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-black">{numPages} p.</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {Array.from({ length: numPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => scrollToPage(pNum)}
                      className={`w-full p-2.5 rounded-xl border transition-all text-left flex items-center gap-3 cursor-pointer ${
                        pageNum === pNum 
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm" 
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold border shrink-0 ${
                        pageNum === pNum ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-gray-700 border-gray-200"
                      }`}>
                        {pNum}
                      </div>
                      <div className="truncate text-left">
                        <span className="text-xs font-semibold block">Page {pNum}</span>
                        <span className="text-[9px] text-gray-400 font-medium">Contenu</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CENTER CONTAINER: PDF Canvas Viewport */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* INNER NAVIGATION BAR - CLEAN & PROFESSIONAL */}
          <div className="h-12 border-b border-gray-200 bg-white flex flex-wrap items-center justify-between px-4 gap-2 shadow-xs">
            {/* Page Nav */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => scrollToPage(Math.max(pageNum - 1, 1))}
                disabled={pageNum <= 1}
                className="p-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1.5 text-xs text-gray-700 font-bold">
                <span>Page</span>
                <input 
                  type="number"
                  value={pageNum}
                  min={1}
                  max={numPages || 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 1 && val <= numPages) scrollToPage(val);
                  }}
                  className="w-12 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 text-center text-[#0F1E36] font-extrabold focus:outline-none focus:border-emerald-500"
                />
                <span className="text-gray-400 font-medium">sur</span>
                <span className="text-gray-800 font-extrabold">{numPages || "..."}</span>
              </div>
              <button 
                onClick={() => scrollToPage(Math.min(pageNum + 1, numPages))}
                disabled={pageNum >= numPages}
                className="p-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Zoom / Layout controls */}
            <div className="flex items-center gap-1.5 text-xs">
              <button 
                onClick={() => setScale(s => Math.max(s - 0.15, 0.5))}
                className="p-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer text-gray-600 transition-colors"
                title="Zoom arrière"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-gray-700 font-extrabold w-12 text-center">{Math.round(scale * 100)}%</span>
              <button 
                onClick={() => setScale(s => Math.min(s + 0.15, 2.5))}
                className="p-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer text-gray-600 transition-colors"
                title="Zoom avant"
              >
                <ZoomIn size={14} />
              </button>
              <button 
                onClick={handleFitWidth}
                className="px-3 py-1 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer text-gray-700 font-bold text-xs transition-colors"
                title="Ajuster à la largeur de l'écran"
              >
                Plein écran/Largeur
              </button>
            </div>

            {/* Document actions */}
            <div className="flex items-center gap-1">
              <button 
                onClick={handleShareLink}
                className="p-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 cursor-pointer transition-colors"
                title="Copier le lien direct vers cette page"
              >
                <Share2 size={14} />
              </button>
              <button 
                onClick={handlePrint}
                className="p-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 cursor-pointer transition-colors"
                title="Imprimer le PDF"
              >
                <Printer size={14} />
              </button>
              <a 
                href={currentPDF.url}
                download
                className="p-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 cursor-pointer block transition-colors"
                title="Télécharger le fichier PDF"
              >
                <Download size={14} />
              </a>
            </div>
          </div>

          {/* INTERNAL CONTENT SEARCH BOX */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1 max-w-md flex items-center relative">
              <input 
                type="text" 
                placeholder="Rechercher un mot-clé dans ce document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500"
              />
              <button type="submit" className="absolute right-2.5 text-gray-400 hover:text-gray-700 cursor-pointer">
                <Search size={14} />
              </button>
            </form>

            {isSearching ? (
              <span className="text-[10px] text-emerald-600 animate-pulse font-bold">Analyse du document...</span>
            ) : searchResults.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-600 font-extrabold">
                  {currentSearchIndex + 1} / {searchResults.length} occurrences
                </span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => navigateSearch("prev")}
                    className="p-1 rounded bg-white hover:bg-gray-100 border border-gray-200 text-xs text-gray-700 cursor-pointer px-1.5 font-bold shadow-xs"
                  >
                    Précédent
                  </button>
                  <button 
                    onClick={() => navigateSearch("next")}
                    className="p-1 rounded bg-white hover:bg-gray-100 border border-gray-200 text-xs text-gray-700 cursor-pointer px-1.5 font-bold shadow-xs"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            ) : searchQuery.trim() !== "" ? (
              <span className="text-[10px] text-gray-400 italic font-medium">Aucun résultat trouvé</span>
            ) : null}
          </div>

          {/* VIEWPORT BODY (SCROLL CONTAINER) */}
          <div 
            ref={containerRef}
            className="flex-1 overflow-auto p-6 flex flex-col items-center bg-gray-100 relative scroll-smooth"
          >
            {loading ? (
              <div className="m-auto text-center py-12">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm font-bold text-gray-700">Chargement sécurisé et rendu de l'espace de cours...</p>
                <p className="text-xs text-gray-400 mt-1">Préparation du moteur natif PDF.js</p>
              </div>
            ) : error ? (
              <div className="m-auto max-w-md bg-red-500/10 border border-red-500/30 p-6 rounded-2xl text-center">
                <p className="text-sm font-bold text-red-500">{error}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Essayez d'ouvrir le document dans un nouvel onglet, ou contactez l'équipe pédagogique si le problème persiste.
                </p>
                <a 
                  href={currentPDF.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-bold transition-all text-white"
                >
                  <Eye size={13} />
                  Ouvrir en externe
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <PDFPageRenderer 
                  key={`${pageNum}_${scale}`} 
                  pdfDoc={pdfDoc} 
                  pageNum={pageNum} 
                  scale={scale} 
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. FOOTER READING STATS */}
      <div className="h-10 border-t border-gray-200 bg-gray-50 flex justify-between items-center px-4 text-[11px] text-gray-500 z-10 shrink-0">
        <div>
          Fichier : <span className="font-semibold text-gray-700">{currentPDF.name}</span>
        </div>
        <div className="flex gap-4">
          <span>Position : <span className="font-semibold text-emerald-600">Page {pageNum} sur {numPages}</span></span>
          <span className="hidden md:inline text-gray-300">|</span>
          <span className="hidden md:inline">Moteur de rendu natif de confiance</span>
        </div>
      </div>
    </div>
  );
}
