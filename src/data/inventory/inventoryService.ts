
import { InventoryItem, SortField, SortDirection } from "@/types/inventory";
import { Purchase } from "@/types/purchase";
import { inventoryItems } from "./inventoryItems";
import { purchaseOrders } from "./mockData";

export const getInventoryItems = (
  page: number = 1,
  pageSize: number = 20,
  searchQuery: string = "",
  sortField: string = "name",
  sortDirection: "asc" | "desc" = "asc",
  categoryFilter?: string,
  locationFilter?: string
): { items: InventoryItem[], total: number } => {
  let filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply category filter if provided
  if (categoryFilter) {
    filteredItems = filteredItems.filter(item => 
      item.category === categoryFilter
    );
  }

  // Apply location filter if provided
  if (locationFilter) {
    filteredItems = filteredItems.filter(item => 
      item.location === locationFilter
    );
  }

  const start = (page - 1) * pageSize;
  const paginatedItems = filteredItems.slice(start, start + pageSize);

  return {
    items: paginatedItems,
    total: filteredItems.length
  };
};

// Function to get paginated and filtered purchase orders
export const getPurchases = (
  page: number = 1,
  pageSize: number = 20,
  searchQuery: string = ""
): { items: Purchase[], total: number } => {
  const filteredPurchases = purchaseOrders.filter(purchase =>
    purchase.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    purchase.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const start = (page - 1) * pageSize;
  const paginatedPurchases = filteredPurchases.slice(start, start + pageSize);

  return {
    items: paginatedPurchases,
    total: filteredPurchases.length
  };
};
