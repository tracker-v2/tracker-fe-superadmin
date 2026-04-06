export const PAGE_SIZE = 10; // Items per page

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
  canGoNext: boolean;
  canGoPrev: boolean;
}

/**
 * Calculate pagination info - fixed 10 items per page
 */
export function calculatePaginationInfo(
  totalItems: number,
  currentPage: number
): PaginationInfo {
  const itemsPerPage = PAGE_SIZE;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1,
  };
}

/**
 * Get paginated items
 */
export function getPaginatedItems<T>(items: T[], info: PaginationInfo): T[] {
  return items.slice(info.startIndex, info.endIndex);
}

/**
 * Generate page numbers to display (show surrounding pages)
 */
export function getPageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): (number | string)[] {
  const pages: (number | string)[] = [];

  if (totalPages <= maxVisible) {
    // Show all pages
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const halfVisible = Math.floor(maxVisible / 2);
    let startPage = currentPage - halfVisible;
    let endPage = currentPage + halfVisible;

    if (startPage < 1) {
      startPage = 1;
      endPage = maxVisible;
    }
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = totalPages - maxVisible + 1;
    }

    // Add first page
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
  }

  return pages;
}
