'use client'

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPageNumbers, type PaginationInfo } from "@/lib/pagination";

export interface PaginationControlsProps {
    info: PaginationInfo;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

/**
 * Pagination Controls Component - Numbered Pages
 */
export function PaginationControls({
    info,
    onPageChange,
    isLoading = false,
}: PaginationControlsProps) {
    const pageNumbers = getPageNumbers(info.currentPage, info.totalPages);

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 sm:px-4 py-3 border-t bg-gray-50">
            <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
                <span>
                    Halaman <span className="font-semibold">{info.currentPage}</span> dari{" "}
                    <span className="font-semibold">{info.totalPages}</span> (
                    <span className="font-semibold">{info.totalItems}</span> total)
                </span>
            </div>

            <div className="flex items-center justify-center gap-1 sm:gap-2 order-1 sm:order-2 flex-wrap">
                {/* Previous Button */}
                <Button
                    onClick={() => onPageChange(info.currentPage - 1)}
                    disabled={!info.canGoPrev || isLoading}
                    variant="outline"
                    size="sm"
                    className="gap-1 h-8 px-2 sm:px-3"
                >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">Previous</span>
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {pageNumbers.map((page, idx) => {
                        if (page === "...") {
                            return (
                                <span key={`dots-${idx}`} className="px-2 text-gray-500">
                                    ...
                                </span>
                            );
                        }

                        const pageNum = page as number;
                        const isActive = pageNum === info.currentPage;

                        return (
                            <Button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                disabled={isLoading}
                                variant={isActive ? "default" : "outline"}
                                size="sm"
                                className={`h-8 w-8 p-0 text-xs sm:text-sm ${isActive
                                        ? "bg-blue-900 hover:bg-blue-800 text-white"
                                        : "hover:bg-gray-100"
                                    }`}
                            >
                                {pageNum}
                            </Button>
                        );
                    })}
                </div>

                {/* Next Button */}
                <Button
                    onClick={() => onPageChange(info.currentPage + 1)}
                    disabled={!info.canGoNext || isLoading}
                    variant="outline"
                    size="sm"
                    className="gap-1 h-8 px-2 sm:px-3"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={16} />
                </Button>
            </div>
        </div>
    );
}
