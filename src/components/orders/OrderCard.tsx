
import React from "react";
import { format } from "date-fns";
import { Order } from "@/types/order";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Eye, Package, Truck } from "lucide-react";

interface OrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  badgeDisplayMode: "inline" | "stacked";
}

export const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  onViewDetails, 
  badgeDisplayMode = "inline" 
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        {badgeDisplayMode === "inline" ? (
          // Inline display mode - status badge next to order number
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
              <CardDescription>{order.customer.name}</CardDescription>
            </div>
            <div>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        ) : (
          // Stacked display mode - order info and status badge in columns
          <div>
            <div className="mb-3">
              <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
              <CardDescription>{order.customer.name}</CardDescription>
            </div>
            <div className="flex flex-col gap-2">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-0">
        <div className="space-y-3">
          <div className="text-sm">
            <p className="text-muted-foreground">Date:</p>
            <p className="font-medium">{formatDate(order.createdAt)}</p>
          </div>
          <div className="text-sm">
            <p className="text-muted-foreground">Items:</p>
            <p className="font-medium">{order.items.length} items</p>
          </div>
          <div className="text-sm">
            <p className="text-muted-foreground">Total:</p>
            <p className="font-medium">${order.grandTotal.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={() => onViewDetails(order)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
