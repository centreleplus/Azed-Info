import { useState, useMemo, useEffect } from 'react';

interface UsePaginationOptions<T> {
  data: T[];
  initialItemsPerPage?: number;
}

export function usePagination<T>({ data, initialItemsPerPage = 10 }: UsePaginationOptions<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Réinitialiser à la page 1 si les données filtrées changent
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    paginatedData,
    goToPage,
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1),
    totalItems: data.length,
    startIndex: data.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1,
    endIndex: Math.min(currentPage * itemsPerPage, data.length),
  };
}

export default usePagination;
