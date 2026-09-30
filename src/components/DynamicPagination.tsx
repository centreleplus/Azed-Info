import React from 'react';

export interface DynamicPaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const DynamicPagination: React.FC<DynamicPaginationProps> = ({ 
  totalItems, 
  itemsPerPage = 10, 
  currentPage, 
  onPageChange 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 mt-4 select-none">
      <span className="text-xs font-bold text-slate-500">
        Page {currentPage} sur {totalPages} ({totalItems} éléments au total)
      </span>
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all"
        >
          ◀ Précédent
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            type="button"
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
              currentPage === page ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all"
        >
          Suivant ▶
        </button>
      </div>
    </div>
  );
};

export default DynamicPagination;
