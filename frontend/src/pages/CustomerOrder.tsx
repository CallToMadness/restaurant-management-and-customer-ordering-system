import { useState, useEffect } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, Trash2, AlertCircle, ArrowLeft, DollarSign, Receipt } from 'lucide-react';
import { useRestaurantByTableId, useMenuItemsPublic, usePlaceOrder, useExchangeRate, useOrdersForCustomerAtTable, useUpdateOrderStatus } from '@/hooks/useQueries';
import { toast } from 'sonner';
import { EmployeeRole, Currency, OrderStatus } from '@/backend';
import type { OrderItem, MenuItem } from '@/backend';

export default function CustomerOrder() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/customer' });
  const tableId = search.table as string | undefined;

  const { data: restaurant, isLoading: restaurantLoading, error: restaurantError } = useRestaurantByTableId(tableId || '');
  const { data: menuItems, isLoading: menuLoading } = useMenuItemsPublic(restaurant?.identityId || '', !!restaurant);
  const { data: exchangeRate } = useExchangeRate();
  const { data: customerOrders } = useOrdersForCustomerAtTable(restaurant?.identityId || '', tableId || '', !!restaurant && !!tableId);
  const placeOrderMutation = usePlaceOrder();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(Currency.usd);
  const [cart, setCart] = useState<Map<string, { item: MenuItem; quantity: number }>>(new Map());

  // Get table name from restaurant tables
  const tableName = restaurant?.tables.find(t => t.id === tableId)?.name || tableId;

  // Group menu items by category
  const menuItemsByCategory = menuItems?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>) || {};

  const categories = Object.keys(menuItemsByCategory).sort();

  // Filter orders to show only "to be paid" status
  const ordersAwaitingPayment = customerOrders?.filter(order => order.status === OrderStatus.toBePaid) || [];

  useEffect(() => {
    // Set default currency to restaurant's default when restaurant loads
    if (restaurant) {
      setSelectedCurrency(restaurant.defaultCurrency);
    }
  }, [restaurant]);

  const getCurrencySymbol = (currency: Currency) => {
    switch (currency) {
      case Currency.usd:
        return '$';
      case Currency.eur:
        return '€';
    }
  };

  const getCurrencyCode = (currency: Currency) => {
    return currency.toUpperCase();
  };

  const convertPrice = (price: bigint, fromCurrency: Currency, toCurrency: Currency): number => {
    const priceInCents = Number(price);
    
    if (fromCurrency === toCurrency) {
      return priceInCents / 100;
    }

    if (!exchangeRate) {
      return priceInCents / 100;
    }

    const priceInDollars = priceInCents / 100;

    if (fromCurrency === Currency.usd && toCurrency === Currency.eur) {
      return priceInDollars * exchangeRate.usdToEur;
    } else if (fromCurrency === Currency.eur && toCurrency === Currency.usd) {
      return priceInDollars * exchangeRate.eurToUsd;
    }

    return priceInDollars;
  };

  const formatPrice = (price: bigint, fromCurrency: Currency, displayCurrency: Currency): string => {
    const convertedPrice = convertPrice(price, fromCurrency, displayCurrency);
    return `${getCurrencySymbol(displayCurrency)}${convertedPrice.toFixed(2)} ${getCurrencyCode(displayCurrency)}`;
  };

  const addToCart = (menuItem: MenuItem) => {
    const newCart = new Map(cart);
    const existing = newCart.get(menuItem.id);
    if (existing) {
      newCart.set(menuItem.id, { item: menuItem, quantity: existing.quantity + 1 });
    } else {
      newCart.set(menuItem.id, { item: menuItem, quantity: 1 });
    }
    setCart(newCart);
  };

  const removeFromCart = (menuItemId: string) => {
    const newCart = new Map(cart);
    const existing = newCart.get(menuItemId);
    if (existing && existing.quantity > 1) {
      newCart.set(menuItemId, { ...existing, quantity: existing.quantity - 1 });
    } else {
      newCart.delete(menuItemId);
    }
    setCart(newCart);
  };

  const clearCart = () => {
    setCart(new Map());
  };

  const calculateCartTotal = (): string => {
    if (!restaurant) return '0.00';
    
    const total = Array.from(cart.values()).reduce((sum, { item, quantity }) => {
      const convertedPrice = convertPrice(item.price, restaurant.defaultCurrency, selectedCurrency);
      return sum + (convertedPrice * quantity);
    }, 0);

    return `${getCurrencySymbol(selectedCurrency)}${total.toFixed(2)} ${getCurrencyCode(selectedCurrency)}`;
  };

  const handlePlaceOrder = async () => {
    if (!restaurant || cart.size === 0 || !tableId) return;

    const orderItems: OrderItem[] = Array.from(cart.values()).map(({ item, quantity }) => ({
      menuItemId: item.id,
      quantity: BigInt(quantity),
      componentId: item.componentId,
      category: item.routedBy as EmployeeRole,
    }));

    try {
      await placeOrderMutation.mutateAsync({
        identityId: restaurant.identityId,
        tableId,
        items: orderItems,
        currency: selectedCurrency,
      });
      toast.success('Order placed successfully!');
      clearCart();
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    }
  };

  const handlePayOrder = async (orderId: bigint) => {
    try {
      await updateOrderStatusMutation.mutateAsync({
        orderId,
        newStatus: OrderStatus.paid,
      });
      toast.success('Payment processed successfully!');
    } catch (error) {
      toast.error('Failed to process payment');
    }
  };

  const cartTotal = Array.from(cart.values()).reduce((sum, { quantity }) => sum + quantity, 0);

  // Error state - no table ID provided
  if (!tableId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/' })}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold">Customer Order</h1>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                Invalid Table Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>
                  No table ID provided. Please scan a valid QR code or use a table link from your restaurant.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => navigate({ to: '/' })} 
                className="w-full mt-4"
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Error state - table not found or other error
  if (restaurantError || (!restaurantLoading && !restaurant)) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/' })}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold">Customer Order</h1>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                Table Not Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>
                  The table ID "{tableId}" could not be found. Please check your QR code or table link and try again.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => navigate({ to: '/' })} 
                className="w-full mt-4"
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Loading state
  if (restaurantLoading || menuLoading || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{restaurant.name}</h1>
              <p className="text-sm text-muted-foreground">{restaurant.address}</p>
            </div>
            <Button variant="outline" size="sm" className="relative">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
              {cartTotal > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {cartTotal}
                </Badge>
              )}
            </Button>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <img
                src="/assets/generated/currency-selector-icon-transparent.dim_32x32.png"
                alt="Currency"
                className="w-6 h-6 object-contain"
              />
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">
                  View prices in:
                </label>
                <Select value={selectedCurrency} onValueChange={(value) => setSelectedCurrency(value as Currency)}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Currency.usd}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{getCurrencySymbol(Currency.usd)}</span>
                        <span>USD - US Dollar</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={Currency.eur}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{getCurrencySymbol(Currency.eur)}</span>
                        <span>EUR - Euro</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {selectedCurrency !== restaurant.defaultCurrency && (
              <p className="text-xs text-muted-foreground mt-2">
                Prices converted from {getCurrencyCode(restaurant.defaultCurrency)} at current exchange rate
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Welcome Message */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome to {tableName}!</h2>
          {restaurant.description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {restaurant.description}
            </p>
          )}
        </div>

        <Separator className="mb-6" />

        {/* Orders Awaiting Payment */}
        {ordersAwaitingPayment.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Orders Ready for Payment</h3>
            <div className="space-y-4">
              {ordersAwaitingPayment.map((order) => (
                <Card key={order.id.toString()}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Order #{order.id.toString()}</CardTitle>
                        <CardDescription>Table: {order.tableId}</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        <DollarSign className="w-3 h-3 mr-1" />
                        To Be Paid
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => {
                        const menuItem = menuItems?.find(m => m.id === item.menuItemId);
                        return (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                            <div>
                              <p className="font-medium text-sm">{menuItem?.name || 'Unknown Item'}</p>
                              <p className="text-xs text-muted-foreground">Quantity: {item.quantity.toString()}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <Button 
                      onClick={() => handlePayOrder(order.id)}
                      disabled={updateOrderStatusMutation.isPending}
                      className="w-full"
                      size="lg"
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      {updateOrderStatusMutation.isPending ? 'Processing...' : 'Pay'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Separator className="my-8" />
          </div>
        )}

        {/* Menu Items by Category */}
        <div className="space-y-8">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category}>
                <h3 className="text-xl font-semibold mb-4 capitalize">{category}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuItemsByCategory[category].map((item) => (
                    <Card key={item.id}>
                      <CardHeader>
                        <CardTitle>{item.name}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">
                            {formatPrice(item.price, restaurant.defaultCurrency, selectedCurrency)}
                          </span>
                          <Button onClick={() => addToCart(item)} size="sm">
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No menu items available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {cart.size > 0 && (
        <div className="border-t bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-4">
              {Array.from(cart.values()).map(({ item, quantity }) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price, restaurant.defaultCurrency, selectedCurrency)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                    >
                      {quantity === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => addToCart(item)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold">{calculateCartTotal()}</span>
                </div>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={placeOrderMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {placeOrderMutation.isPending ? 'Placing Order...' : 'Place Order'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          © 2025. Built with <span className="text-destructive">♥</span> using{' '}
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
