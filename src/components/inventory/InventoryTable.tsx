import React, { useState } from "react";
import { InventoryItem, SortField } from "@/types/inventory";
import { EditInventoryItem } from "./EditInventoryItem";
import { TransferInventoryItem } from "./TransferInventoryItem";
import { DeleteInventoryItem } from "./DeleteInventoryItem";
import { ReorderInventoryItem } from "./ReorderInventoryItem";
import { ShoppingCart, CircleSlash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface SortHeaderProps {
  field: SortField;
  label: string;
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  onSort: (field: SortField) => void;
}

const SortHeader: React.FC<SortHeaderProps> = ({ field, label, sortField, sortDirection, onSort }) => (
  <th 
    className="py-3 px-4 text-left font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center gap-1">
      {label}
      {sortField === field && (
        sortDirection === 'asc' ? 
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m18 15-6-6-6 6"/></svg> : 
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m6 9 6 6 6-6"/></svg>
      )}
    </div>
  </th>
);

interface InventoryTableProps {
  items: InventoryItem[];
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  onSort: (field: SortField) => void;
  onSaveItem: (updatedItem: InventoryItem) => void;
  onTransferItem: (item: InventoryItem, quantity: number, newLocation: string) => void;
  onDeleteItem: (itemId: string) => void;
  onReorderItem: (itemId: string, direction: 'up' | 'down') => void;
  onOpenReorderDialog: (item: InventoryItem) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  sortField,
  sortDirection,
  onSort,
  onSaveItem,
  onTransferItem,
  onDeleteItem,
  onReorderItem,
  onOpenReorderDialog,
}) => {
  const [discontinueItem, setDiscontinueItem] = useState<InventoryItem | null>(null);
  
  const handleDiscontinue = () => {
    if (discontinueItem) {
      const updatedItem = {
        ...discontinueItem,
        isActive: !discontinueItem.isActive,
        lastUpdated: new Date().toISOString()
      };
      onSaveItem(updatedItem);
      setDiscontinueItem(null);
    }
  };
  
  return (
    <div className="rounded-md border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <SortHeader field="sku" label="SKU" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
              <SortHeader field="name" label="Name" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
              <SortHeader field="category" label="Category" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
              <SortHeader field="cost" label="Cost" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
              <SortHeader field="rrp" label="RRP" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
              <SortHeader field="stock" label="Stock" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">Status</th>
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className={`border-b hover:bg-muted/50 ${!item.isActive ? 'opacity-60' : ''}`}>
                <td className="py-3 px-4">{item.sku}</td>
                <td className="py-3 px-4 font-medium break-words max-w-[200px]">{item.name}</td>
                <td className="py-3 px-4">{item.category}</td>
                <td className="py-3 px-4">${item.cost.toFixed(2)}</td>
                <td className="py-3 px-4">${item.rrp ? item.rrp.toFixed(2) : "-"}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.stock <= item.lowStockThreshold
                      ? "bg-red-100 text-red-800"
                      : item.stock <= item.lowStockThreshold * 2
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {item.stock}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {item.isActive ? (
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                      Discontinued
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => onOpenReorderDialog(item)}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reorder stock</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TransferInventoryItem item={item} onTransfer={onTransferItem} showLabel={false} />
                    <EditInventoryItem item={item} onSave={onSaveItem} showLabel={false} />
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant={item.isActive ? "outline" : "ghost"} 
                            size="icon"
                            className={cn(
                              "h-8 w-8",
                              item.isActive ? "text-amber-600 hover:bg-amber-100 hover:text-amber-700" : "text-green-600 hover:bg-green-100 hover:text-green-700"
                            )}
                            onClick={() => setDiscontinueItem(item)}
                          >
                            <CircleSlash className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{item.isActive ? "Discontinue" : "Reactivate"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <DeleteInventoryItem item={item} onDelete={onDeleteItem} showLabel={false} />
                    
                    <div className="ms-1">
                      <ReorderInventoryItem 
                        item={item}
                        isFirst={index === 0}
                        isLast={index === items.length - 1}
                        onReorder={onReorderItem}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <AlertDialog open={!!discontinueItem} onOpenChange={(open) => !open && setDiscontinueItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {discontinueItem?.isActive ? "Discontinue" : "Reactivate"} Item
            </AlertDialogTitle>
            <AlertDialogDescription>
              {discontinueItem?.isActive 
                ? "This will mark the item as discontinued. It will remain in your inventory but won't be available for new sales."
                : "This will reactivate the discontinued item, making it available for sales again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDiscontinue}
              className={cn(
                discontinueItem?.isActive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""
              )}
            >
              {discontinueItem?.isActive ? "Discontinue" : "Reactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
