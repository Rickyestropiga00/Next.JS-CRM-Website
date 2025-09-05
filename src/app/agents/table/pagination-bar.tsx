import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationBarProps {
  selectedCount: number;
  totalRows: number;
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  setRowsPerPage: (n: number) => void;
  setCurrentPage: (n: number) => void;
}

const paginationIconBtnClass =
  "flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground";

export function AgentsPaginationBar({
  selectedCount,
  totalRows,
  currentPage,
  totalPages,
  rowsPerPage,
  setRowsPerPage,
  setCurrentPage,
}: PaginationBarProps) {
  return (
    <div className="flex flex-wrap lg:flex-nowrap items-center justify-between mt-4 px-2 gap-2">
      <div className="text-sm text-muted-foreground whitespace-nowrap w-[140px]">
        {`${selectedCount} of ${totalRows} row(s) selected.`}
      </div>
      <Pagination>
        <PaginationContent className="gap-2">
          <PaginationItem>
            <button
              type="button"
              aria-label="Go to first page"
              className={`${paginationIconBtnClass} ${
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }`}
              onClick={() => currentPage !== 1 && setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          </PaginationItem>
          <PaginationItem>
            <button
              type="button"
              aria-label="Go to previous page"
              className={`${paginationIconBtnClass} ${
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }`}
              onClick={() =>
                currentPage !== 1 &&
                setCurrentPage(Math.max(1, currentPage - 1))
              }
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </PaginationItem>
          {Array.from({ length: totalPages }).map((_, idx) => {
            const page = idx + 1;
            const isActive = page === currentPage;
            const show =
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1;
            if (
              !show &&
              ((page < currentPage && page > 1) ||
                (page > currentPage && page < totalPages))
            ) {
              if (
                (page === currentPage - 2 && page > 1) ||
                (page === currentPage + 2 && page < totalPages)
              ) {
                return (
                  <PaginationItem key={`ellipsis-${page}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            }
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={isActive}
                  className="rounded-md"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    setCurrentPage(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <button
              type="button"
              aria-label="Go to next page"
              className={`${paginationIconBtnClass} ${
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
              onClick={() =>
                currentPage !== totalPages &&
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </PaginationItem>
          <PaginationItem>
            <button
              type="button"
              aria-label="Go to last page"
              className={`${paginationIconBtnClass} ${
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
              onClick={() =>
                currentPage !== totalPages && setCurrentPage(totalPages)
              }
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="flex items-center gap-2 text-sm whitespace-nowrap">
        <span>Rows per page</span>
        <Select
          value={String(rowsPerPage)}
          onValueChange={(v) => setRowsPerPage(Number(v))}
        >
          <SelectTrigger className="w-[60px] h-8 px-2 py-1 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="30">30</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
