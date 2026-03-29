import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, LogOut, ChefHat, Wine, UserCircle, Clock, CheckCircle2, DollarSign, Receipt } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useOrdersByCategory, useMenuItems, useGetCallerUserProfile, useUpdateOrderStatus } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { EmployeeRole, OrderStatus } from '@/backend';
import type { OrderBatch } from '@/backend';
import { toast } from 'sonner';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const updateOrderStatusMutation = useUpdateOrderStatus();
  
  // Get employee details from URL search params
  const search = useSearch({ from: '/employee-dashboard' });
  const restaurantId = search.restaurantId as string;
  const employeeName = search.name as string;
  const employeeCategory = search.category as EmployeeRole;

  const { data: orders, isLoading: ordersLoading } = useOrdersByCategory(
    restaurantId || '',
    employeeCategory
  );
  const { data: menuItems } = useMenuItems(restaurantId || '');

  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/', search: {} });
  };

  const handleMarkReady = async (orderId: bigint) => {
    try {
      await updateOrderStatusMutation.mutateAsync({
        orderId,
        newStatus: OrderStatus.readyToServe,
      });
      toast.success('Order marked as ready to serve!');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleMarkServed = async (orderId: bigint) => {
    try {
      await updateOrderStatusMutation.mutateAsync({
        orderId,
        newStatus: OrderStatus.toBePaid,
      });
      toast.success('Order marked as served!');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !restaurantId || !employeeName || !employeeCategory) {
      navigate({ to: '/', search: {} });
    }
  }, [isAuthenticated, restaurantId, employeeName, employeeCategory, navigate]);

  const getCategoryIcon = () => {
    switch (employeeCategory) {
      case EmployeeRole.kitchen:
        return <ChefHat className="w-5 h-5 sm:w-6 sm:h-6" />;
      case EmployeeRole.bar:
        return <Wine className="w-5 h-5 sm:w-6 sm:h-6" />;
      case EmployeeRole.waiter:
        return <UserCircle className="w-5 h-5 sm:w-6 sm:h-6" />;
      default:
        return <ChefHat className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };

  const getCategoryLabel = () => {
    switch (employeeCategory) {
      case EmployeeRole.kitchen:
        return 'Kitchen';
      case EmployeeRole.bar:
        return 'Bar';
      case EmployeeRole.waiter:
        return 'Waiter';
      default:
        return 'Employee';
    }
  };

  const getMenuItemName = (menuItemId: string) => {
    const item = menuItems?.find((m) => m.id === menuItemId);
    return item?.name || 'Unknown Item';
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.ordered:
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs sm:text-sm">
            <Clock className="w-3 h-3 mr-1" />
            Ordered
          </Badge>
        );
      case OrderStatus.readyToServe:
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs sm:text-sm">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Ready to Serve
          </Badge>
        );
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
    }
  };

  // Filter orders based on employee category and status
  const filteredOrders = orders?.filter((order) => {
    if (employeeCategory === EmployeeRole.kitchen || employeeCategory === EmployeeRole.bar) {
      // Kitchen and bar see only "ordered" status orders
      return order.status === OrderStatus.ordered;
    } else if (employeeCategory === EmployeeRole.waiter) {
      // Waiters see "ordered" orders (to prepare/serve directly) and "ready to serve" orders (from kitchen/bar)
      return order.status === OrderStatus.ordered || order.status === OrderStatus.readyToServe;
    }
    return false;
  });

  if (ordersLoading || !restaurantId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/', search: {} })} className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white flex-shrink-0">
                {getCategoryIcon()}
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-xl font-bold truncate">{employeeName} - {getCategoryLabel()}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Order management</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {userProfile && (
                <span className="text-xs sm:text-sm text-muted-foreground hidden lg:inline truncate max-w-[120px]">Logged in as {userProfile.name}</span>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout} className="h-9 sm:h-10">
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {getCategoryIcon()}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold truncate">Welcome, {employeeName}!</h2>
                <p className="text-sm sm:text-base text-muted-foreground truncate">
                  {employeeCategory === EmployeeRole.waiter 
                    ? 'Orders to serve' 
                    : `Showing orders for ${getCategoryLabel()} category`}
                </p>
              </div>
            </div>
          </div>

          {!filteredOrders || filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-8 sm:py-12 text-center px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-muted flex items-center justify-center">
                  {getCategoryIcon()}
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">No orders yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {employeeCategory === EmployeeRole.waiter 
                    ? 'Orders to serve will appear here' 
                    : 'New orders will appear here automatically'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id.toString()}>
                  <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate">Order #{order.id.toString()}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm truncate">Table: {order.tableId}</CardDescription>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50 gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base truncate">{getMenuItemName(item.menuItemId)}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Quantity: {item.quantity.toString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs flex-shrink-0">{getCategoryLabel()}</Badge>
                        </div>
                      ))}
                    </div>
                    
                    {/* Action buttons based on employee category and order status */}
                    <div className="mt-4 pt-4 border-t">
                      {(employeeCategory === EmployeeRole.kitchen || employeeCategory === EmployeeRole.bar) && order.status === OrderStatus.ordered && (
                        <Button 
                          onClick={() => handleMarkReady(order.id)}
                          disabled={updateOrderStatusMutation.isPending}
                          className="w-full"
                          size="lg"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {updateOrderStatusMutation.isPending ? 'Updating...' : 'Ready'}
                        </Button>
                      )}
                      
                      {employeeCategory === EmployeeRole.waiter && (
                        <>
                          {order.status === OrderStatus.ordered && (
                            <Button 
                              onClick={() => handleMarkServed(order.id)}
                              disabled={updateOrderStatusMutation.isPending}
                              className="w-full"
                              size="lg"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              {updateOrderStatusMutation.isPending ? 'Updating...' : 'Served'}
                            </Button>
                          )}
                          {order.status === OrderStatus.readyToServe && (
                            <Button 
                              onClick={() => handleMarkServed(order.id)}
                              disabled={updateOrderStatusMutation.isPending}
                              className="w-full"
                              size="lg"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              {updateOrderStatusMutation.isPending ? 'Updating...' : 'Served'}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t py-4 sm:py-6 mt-8 sm:mt-12">
        <div className="container mx-auto px-4 sm:px-6 text-center text-xs sm:text-sm text-muted-foreground">
          © 2025 RestaurantOS. Built with <span className="text-destructive">♥</span> using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}

