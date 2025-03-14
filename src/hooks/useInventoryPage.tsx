
import { useState, useCallback, useEffect } from "react";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import { InventoryItem, SortField, SortDirection } from "@/types/inventory";
import { toast } from "sonner";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";

export function useInventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Effect to set category filter from URL when the component mounts
  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      console.log(`Setting category filter from URL: ${category}`);
      setCategoryFilter(category);
    } else {
      setCategoryFilter(undefined);
    }
  }, [searchParams]);
  
  // Reset filter when navigating away from inventory page
  useEffect(() => {
    return () => {
      if (location.pathname !== "/inventory") {
        setCategoryFilter(undefined);
      }
    };
  }, [location.pathname]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);
  
  const { 
    items, 
    isLoading, 
    totalItems, 
    updateItem, 
    addItem, 
    deleteItem, 
    reorderItem, 
    reorderStock,
    fetchItems,
    reactivateAllItems,
    refresh
  } = useInventoryItems(
    currentPage, 
    searchQuery,
    sortField,
    sortDirection,
    categoryFilter
  );
  
  const itemsPerPage = 20;

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleCategoryFilterChange = useCallback((category: string | undefined) => {
    setCategoryFilter(category);
    // Update URL to reflect the category filter
    if (category) {
      navigate(`/inventory?category=${encodeURIComponent(category)}`, { replace: true });
    } else {
      navigate('/inventory', { replace: true });
    }
  }, [navigate]);

  const handleSaveItem = useCallback(async (updatedItem: InventoryItem) => {
    const success = await updateItem(updatedItem);
    if (success) {
      toast.success(`Successfully updated ${updatedItem.name}`);
    }
  }, [updateItem]);

  const handleAddItem = useCallback(async (newItem: InventoryItem) => {
    const success = await addItem(newItem);
    if (success) {
      toast.success(`Successfully added ${newItem.name} to inventory`);
    }
  }, [addItem]);

  const handleDeleteItem = useCallback(async (itemId: string) => {
    const itemName = items.find(item => item.id === itemId)?.name || "Item";
    const success = await deleteItem(itemId);
    if (success) {
      toast.error(`Successfully deleted ${itemName} from inventory`);
    }
  }, [items, deleteItem]);

  const handleReorderItem = useCallback((itemId: string, direction: 'up' | 'down') => {
    reorderItem(itemId, direction);
    toast.success(`Item moved ${direction}`);
  }, [reorderItem]);

  const handleOpenReorderDialog = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setReorderDialogOpen(true);
  }, []);

  const handleReorderStock = useCallback(async (item: InventoryItem, quantity: number) => {
    await reorderStock(item, quantity);
    toast.success(`Ordered ${quantity} units of ${item.name} from ${item.supplier}`);
  }, [reorderStock]);

  const handleTransferItem = useCallback(async (item: InventoryItem, quantity: number, newLocation: string) => {
    console.log(`Transferring ${quantity} units of ${item.name} from ${item.location} to ${newLocation}`);
    
    const sourceItem = { ...item, stock: item.stock - quantity };
    await updateItem(sourceItem);
    
    const existingDestItem = items.find(i => 
      i.sku === item.sku && i.location === newLocation
    );
    
    if (existingDestItem) {
      const destinationItem = { 
        ...existingDestItem, 
        stock: existingDestItem.stock + quantity 
      };
      await updateItem(destinationItem);
      console.log(`Updated existing item at ${newLocation}, new stock: ${destinationItem.stock}`);
    } else {
      const newDestinationItem = {
        ...item,
        id: `${item.id}-${Date.now()}`,
        location: newLocation,
        stock: quantity
      };
      await addItem(newDestinationItem);
      console.log(`Created new item at ${newLocation} with stock: ${quantity}`);
    }
    
    refresh();
    
    toast.success(`Successfully transferred ${quantity} units of ${item.name} to ${newLocation}`);
  }, [items, updateItem, addItem, refresh]);

  const handleReactivateAllItems = useCallback(async () => {
    try {
      await reactivateAllItems();
      toast.success("Successfully reactivated all inventory items");
    } catch (error) {
      console.error("Failed to reactivate all items:", error);
      toast.error("Failed to reactivate all inventory items");
    }
  }, [reactivateAllItems]);

  return {
    state: {
      searchQuery,
      currentPage,
      viewMode,
      sortField,
      sortDirection,
      reorderDialogOpen,
      selectedItem,
      items,
      isLoading,
      totalItems,
      itemsPerPage,
      categoryFilter,
    },
    actions: {
      setSearchQuery,
      setCurrentPage,
      setViewMode,
      setSortField,
      setSortDirection,
      setReorderDialogOpen,
      setSelectedItem,
      handleSort,
      handleSaveItem,
      handleAddItem,
      handleDeleteItem,
      handleReorderItem,
      handleOpenReorderDialog,
      handleReorderStock,
      handleTransferItem,
      setCategoryFilter: handleCategoryFilterChange,
      fetchItems: (forceRefresh = false) => {
        console.log("Calling refresh with forceRefresh:", forceRefresh);
        return refresh();
      },
      handleReactivateAllItems
    }
  };
}
