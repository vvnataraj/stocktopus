
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SalesTable } from "@/components/sales/SalesTable";
import { CreateSaleModal } from "@/components/sales/CreateSaleModal";
import { useSales } from "@/hooks/useSales";
import { SaleStatus } from "@/types/sale";
import { ListControls, ViewMode } from "@/components/common/ListControls";
import { SalesCardGrid } from "@/components/sales/SalesCardGrid";
import { SalesPagination } from "@/components/sales/SalesPagination";
import { SalesHeader } from "@/components/sales/SalesHeader";
import { SortField, SortDirection, getSortedSales, getSortOptions } from "@/components/sales/SalesSorter";

export default function Sales() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = useState<SaleStatus | undefined>(undefined);
  
  const { sales, totalSales, isLoading, addSale } = useSales(currentPage, 10, searchQuery);

  const handleCreateSale = (newSale: any) => {
    addSale(newSale);
    setIsCreateModalOpen(false);
  };

  const handleSort = (field: string) => {
    const saleField = field as SortField;
    if (saleField === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(saleField);
      setSortDirection('asc');
    }
  };

  const sortOptions = getSortOptions();
  const sortedSales = getSortedSales(sales, sortField, sortDirection);

  return (
    <MainLayout>
      <SalesHeader onCreateClick={() => setIsCreateModalOpen(true)} />

      <ListControls 
        searchPlaceholder="Search sales..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        availableViewModes={["grid", "table"]}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSort}
        onSortDirectionChange={setSortDirection}
        sortOptions={sortOptions}
      />

      {viewMode === "table" ? (
        <SalesTable 
          sales={sortedSales} 
          isLoading={isLoading}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      ) : (
        <SalesCardGrid sales={sortedSales} />
      )}

      <SalesPagination 
        currentPage={currentPage}
        totalItems={totalSales}
        pageSize={10}
        onPageChange={setCurrentPage}
      />

      <CreateSaleModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreateSale={handleCreateSale}
      />
    </MainLayout>
  );
}
