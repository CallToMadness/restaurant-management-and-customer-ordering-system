import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Receipt } from 'lucide-react';
import { useOrdersForRestaurant, useMenuItems } from '@/hooks/useQueries';
import { OrderStatus } from '@/backend';
import type { OrderBatch, RestaurantIdentityId } from '@/backend';

interface OrdersViewProps {
  identityId: RestaurantIdentityId;
}

export default function OrdersView({ identityId }: OrdersViewProps) {
  const { data: orders, isLoading: ordersLoading } = useOrdersForRestaurant(identityId);
  const { data: menuItems } = useMenuItems(identityId);

  const getMenuItemName = (menuItemId: string) => {
    const item = menuItems?.find((m) => m.id === menuItemId);
    return item?.name || 'Unknown Item';
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.toBePaid:
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs sm:text-sm">
            <DollarSign className="w-3 h-3 mr-1" />
            To Be Paid
          </Badge>
        );
      case OrderStatus.paid:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm">
            <Receipt className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs sm:text-sm">
            <Clock className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground">Orders awaiting payment will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Orders</h2>
        <p className="text-muted-foreground">View orders awaiting payment or already paid</p>
      </div>

      {orders.map((order: OrderBatch) => (
        <Card key={order.id.toString()}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Order #{order.id.toString()}</CardTitle>
                <CardDescription>Table: {order.tableId}</CardDescription>
              </div>
              {getStatusBadge(order.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{getMenuItemName(item.menuItemId)}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity.toString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
