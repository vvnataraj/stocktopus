
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { InventoryItem, SortField, SortDirection } from "@/types/inventory";
import { MainLayout } from "@/components/layout/MainLayout";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryControls } from "@/components/inventory/InventoryControls";
import { InventoryGrid } from "@/components/inventory/InventoryGrid";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";
import { ReorderDialog } from "@/components/inventory/ReorderDialog";
import { getInventoryItems, syncInventoryItemsToSupabase } from "@/data/inventory/inventoryService";

export default function Inventory() {
  const [searchParams] = useSearchParams();
  const [syncingDb, setSyncingDb] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [locationFilter, setLocationFilter] = useState<string | undefined>();
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const itemsPerPage = 20;
  
  // Parse URL parameters for filters
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || undefined;
    const location = searchParams.get("location") || undefined;
    const sort = searchParams.get("sort") as SortField || "name";
    const order = searchParams.get("order") as SortDirection || "asc";
    const view = searchParams.get("view") as "grid" | "table" || "table";
    
    setCurrentPage(page);
    setSearchQuery(search);
    setCategoryFilter(category);
    setLocationFilter(location);
    setSortField(sort);
    setSortDirection(order);
    setViewMode(view);
    
    fetchItems();
  }, [searchParams]);
  
  const fetchItems = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      const result = await getInventoryItems(
        currentPage,
        itemsPerPage,
        searchQuery,
        sortField,
        sortDirection,
        categoryFilter,
        locationFilter
      );
      
      setItems(result.items);
      setTotalItems(result.total);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      toast.error("Failed to load inventory items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    fetchItems();
  };
  
  const handleSaveItem = (updatedItem: InventoryItem) => {
    // Implementation for saving item changes would go here
    toast.success(`Item "${updatedItem.name}" updated successfully`);
    fetchItems(true);
  };
  
  const handleAddItem = (newItem: InventoryItem) => {
    // Implementation for adding a new item would go here
    toast.success(`Item "${newItem.name}" added successfully`);
    fetchItems(true);
  };
  
  const handleDeleteItem = (itemId: string) => {
    // Implementation for deleting an item would go here
    const itemToDelete = items.find(item => item.id === itemId);
    if (itemToDelete) {
      toast.success(`Item "${itemToDelete.name}" deleted successfully`);
      fetchItems(true);
    }
  };
  
  // Updated to match the expected signature from InventoryGrid/InventoryTable
  const handleTransferItem = (item: InventoryItem, quantity: number, newLocation: string) => {
    // Implementation for transferring items between locations would go here
    toast.success(`Transferred ${quantity} items from ${item.location} to ${newLocation}`);
    fetchItems(true);
  };
  
  // Updated to match the expected signature from InventoryTable
  const handleReorderItem = (itemId: string, direction: 'up' | 'down') => {
    // Implementation for reordering items would go here
    toast.success(`Item moved ${direction}`);
    fetchItems(true);
  };
  
  const handleOpenReorderDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setReorderDialogOpen(true);
  };
  
  const handleReorderStock = (item: InventoryItem, quantity: number) => {
    // Implementation for reordering stock would go here
    toast.success(`Reordered ${quantity} units of "${item.name}"`);
    setReorderDialogOpen(false);
    fetchItems(true);
  };
  
  const handleImportItems = (importedItems: InventoryItem[]) => {
    // Implementation for importing items would go here
    toast.success(`Successfully imported ${importedItems.length} items`);
    fetchItems(true);
  };
  
  const handleSyncToDatabase = async () => {
    setSyncingDb(true);
    try {
      const result = await syncInventoryItemsToSupabase();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Failed to sync inventory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSyncingDb(false);
      fetchItems(true);
    }
  };
  
  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <InventoryHeader 
            onAddItem={handleAddItem} 
            items={items}
            onImportItems={handleImportItems}
          />
          <Button 
            onClick={handleSyncToDatabase} 
            disabled={syncingDb}
            variant="outline"
            className="ml-2 h-10"
          >
            {syncingDb ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>Sync to Database</>
            )}
          </Button>
        </div>
        
        <InventoryControls 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onSortDirectionChange={setSortDirection}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          locationFilter={locationFilter}
          onLocationFilterChange={setLocationFilter}
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <h3 className="text-xl font-semibold mb-2">No inventory items found</h3>
            <p className="text-muted-foreground mb-4">Try changing your search criteria or add new items.</p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <InventoryGrid 
                items={items}
                onSaveItem={handleSaveItem}
                onTransferItem={handleTransferItem}
                onDeleteItem={handleDeleteItem}
                onReorderStock={handleReorderStock}
              />
            ) : (
              <InventoryTable 
                items={items}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onSaveItem={handleSaveItem}
                onTransferItem={handleTransferItem}
                onDeleteItem={handleDeleteItem}
                onReorderItem={handleReorderItem}
                onOpenReorderDialog={handleOpenReorderDialog}
              />
            )}

            <InventoryPagination 
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {selectedItem && (
          <ReorderDialog
            item={selectedItem}
            open={reorderDialogOpen}
            onClose={() => setReorderDialogOpen(false)}
            onReorder={handleReorderStock}
          />
        )}
      </div>
    </MainLayout>
  );
}
