
import { useState, useCallback } from "react";
import { InventoryItem, SortField, SortDirection } from "@/types/inventory";
import { inventoryItems } from "@/data/inventoryData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useInventoryDatabase() {
  const fetchFromSupabase = useCallback(async (
    page: number = 1,
    searchQuery: string = "",
    sortField: SortField = 'name',
    sortDirection: SortDirection = 'asc',
    categoryFilter?: string,
    locationFilter?: string
  ) => {
    try {
      let supabaseQuery = supabase
        .from('inventory_items')
        .select('*');
      
      if (searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase().trim();
        supabaseQuery = supabaseQuery.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
      }
      
      if (categoryFilter) {
        supabaseQuery = supabaseQuery.eq('category', categoryFilter);
      }
      
      if (locationFilter) {
        supabaseQuery = supabaseQuery.eq('location', locationFilter);
      }
      
      const supabaseSortField = sortField === 'rrp' ? 'price' : sortField;
      supabaseQuery = supabaseQuery.order(supabaseSortField, { ascending: sortDirection === 'asc' });
      
      const pageSize = 20;
      const start = (page - 1) * pageSize;
      supabaseQuery = supabaseQuery.range(start, start + pageSize - 1);
      
      const { data, error: fetchError, count } = await supabaseQuery;
      
      if (fetchError) {
        console.error("Error fetching from Supabase:", fetchError);
        throw new Error("Failed to fetch from database");
      }
      
      if (!data || data.length === 0) {
        return { items: [], count: 0, error: null };
      }
      
      const dbItems = data.map(item => mapSupabaseItemToInventoryItem(item));
      return { items: dbItems, count: count || dbItems.length, error: null };
    } catch (error) {
      console.error("Failed to fetch from Supabase:", error);
      return { items: [], count: 0, error };
    }
  }, []);

  const fetchFromLocal = useCallback((
    page: number = 1,
    searchQuery: string = "",
    sortField: SortField = 'name',
    sortDirection: SortDirection = 'asc',
    categoryFilter?: string,
    locationFilter?: string
  ) => {
    let filteredItems = [...inventoryItems];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }
    
    if (categoryFilter) {
      filteredItems = filteredItems.filter(item => 
        item.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    if (locationFilter) {
      filteredItems = filteredItems.filter(item => 
        item.location.toLowerCase() === locationFilter.toLowerCase()
      );
    }
    
    const sortedItems = filteredItems.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      const comparison = typeof aValue === 'string' 
        ? aValue.localeCompare(bValue as string)
        : Number(aValue) - Number(bValue);
        
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    const total = sortedItems.length;
    const pageSize = 20;
    const start = (page - 1) * pageSize;
    const paginatedItems = sortedItems.slice(start, start + pageSize);
    
    return { items: paginatedItems, total };
  }, []);

  const mapSupabaseItemToInventoryItem = (item: any): InventoryItem => {
    const dimensionsObj = item.dimensions as Record<string, any> | null;
    const weightObj = item.weight as Record<string, any> | null;
    
    return {
      id: item.id,
      sku: item.sku,
      name: item.name,
      description: item.description || "",
      category: item.category || "",
      subcategory: item.subcategory || "",
      brand: item.brand || "",
      rrp: item.price || 0,
      cost: item.cost || 0,
      stock: item.stock || 0,
      lowStockThreshold: item.low_stock_threshold || 5,
      minStockCount: item.min_stock_count || 1,
      location: item.location || "",
      barcode: item.barcode || "",
      dateAdded: item.date_added,
      lastUpdated: item.last_updated,
      imageUrl: item.image_url,
      dimensions: dimensionsObj ? {
        length: Number(dimensionsObj.length) || 0,
        width: Number(dimensionsObj.width) || 0,
        height: Number(dimensionsObj.height) || 0,
        unit: (dimensionsObj.unit as 'cm' | 'mm' | 'in') || 'cm'
      } : undefined,
      weight: weightObj ? {
        value: Number(weightObj.value) || 0,
        unit: (weightObj.unit as 'kg' | 'g' | 'lb') || 'kg'
      } : undefined,
      isActive: item.is_active,
      supplier: item.supplier || "",
      tags: item.tags || []
    } as InventoryItem;
  };

  const mapInventoryItemToSupabaseItem = (item: InventoryItem) => {
    return {
      id: item.id,
      sku: item.sku,
      name: item.name,
      description: item.description,
      category: item.category,
      subcategory: item.subcategory,
      brand: item.brand,
      price: item.rrp,
      cost: item.cost,
      stock: item.stock,
      low_stock_threshold: item.lowStockThreshold,
      min_stock_count: item.minStockCount,
      location: item.location,
      barcode: item.barcode,
      date_added: item.dateAdded,
      last_updated: item.lastUpdated || new Date().toISOString(),
      image_url: item.imageUrl,
      dimensions: item.dimensions,
      weight: item.weight,
      is_active: item.isActive,
      supplier: item.supplier,
      tags: item.tags
    };
  };

  return {
    fetchFromSupabase,
    fetchFromLocal,
    mapSupabaseItemToInventoryItem,
    mapInventoryItemToSupabaseItem
  };
}
