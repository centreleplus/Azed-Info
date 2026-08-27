import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  pageSizeOptions?: number[];
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [5, 10, 20, 50],
}) => {
  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-slate-200 rounded-b-2xl">
      {/* Informations de pagination */}
      <div className="flex items-center gap-4 text-xs font-medium text-slate-600 flex-wrap">
        <span>
          Affichage de <strong className="text-slate-900">{startIndex}</strong> à{' '}
          <strong className="text-slate-900">{endIndex}</strong> sur{' '}
          <strong className="text-slate-900">{totalItems}</strong> résultats
        </span>

        {/* Sélecteur de taille de page */}
        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
          <span>Afficher</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span>par page</span>
        </div>
      </div>

      {/* Boutons de navigation */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          title="Première page"
        >
          <ChevronsLeft className="w-4 h-4"/>
        </button>

        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          title="Page précédente"
        >
          <ChevronLeft className="w-4 h-4"/>
        </button>

        <span className="px-3 py-1 text-xs font-bold text-slate-800 bg-slate-100 rounded-lg border border-slate-200">
          Page {currentPage} sur {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          title="Page suivante"
        >
          <ChevronRight className="w-4 h-4"/>
        </button>

        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          title="Dernière page"
        >
          <ChevronsRight className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
