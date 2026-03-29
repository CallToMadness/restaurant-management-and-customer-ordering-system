import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useActor } from '@/hooks/useActor';
import { useGetCallerUserProfile, useCustomerOrderHistory } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChefHat, LogOut, History, MapPin, Calendar, ShoppingBag, DollarSign } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import ProfileSetupModal from '@/components/ProfileSetupModal';
import { OrderStatus, Currency } from '@/backend';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clear, identity, loginStatus } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: orderHistory, isLoading: ordersLoading } = useCustomerOrderHistory();

  const isAuthenticated = !!identity;

  // Handle authentication requirement
  useEffect(() => {
    if (loginStatus === 'idle' && !isAuthenticated) {
      // User is not authenticated and not in the process of logging in
      navigate({ to: '/', search: {} });
    }
  }, [isAuthenticated, loginStatus, navigate]);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/', search: {} });
  };

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Show loading while initializing or logging in
  if (loginStatus === 'initializing' || loginStatus === 'logging-in') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground">
            {loginStatus === 'logging-in' ? 'Logging in...' : 'Initializing...'}
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated after initialization, don't render (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Show loading while actor or profile is loading
  if (actorFetching || profileLoading || !isFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  const formatPrice = (price: bigint, currency: Currency) => {
    return `${getCurrencySymbol(currency)}${(Number(price) / 100).toFixed(2)} ${getCurrencyCode(currency)}`;
  };

  const calculateOrderTotal = (items: any[]) => {
    return items.reduce((total, item) => total + Number(item.quantity), 0);
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.ordered:
        return 'Ordered';
      case OrderStatus.readyToServe:
        return 'Ready to Serve';
      case OrderStatus.toBePaid:
        return 'To Be Paid';
      case OrderStatus.paid:
        return 'Paid';
      default:
        return 'Unknown';
    }
  };

  const getStatusVariant = (status: OrderStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case OrderStatus.ordered:
        return 'default';
      case OrderStatus.readyToServe:
        return 'secondary';
      case OrderStatus.toBePaid:
        return 'outline';
      case OrderStatus.paid:
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">Customer Dashboard</h1>
                {userProfile && (
                  <p className="text-xs sm:text-sm text-muted-foreground">Welcome, {userProfile.name}</p>
                )}
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="h-9 sm:h-10">
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center">
              <img
                src="/assets/generated/order-history-icon-transparent.dim_64x64.png"
                alt="Order History"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Order History</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                View all your past orders and visits
              </p>
            </div>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !orderHistory || orderHistory.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <History className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">No Orders Yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md">
                  Your order history will appear here once you place your first order at a restaurant.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-280px)] sm:h-[calc(100vh-300px)]">
              <div className="space-y-4 sm:space-y-6 pr-4">
                {orderHistory
                  .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                  .map((order) => (
                    <Card key={order.id.toString()} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg sm:text-xl">Order #{order.id.toString()}</CardTitle>
                              <Badge variant={getStatusVariant(order.status)} className="text-xs">
                                {getStatusLabel(order.status)}
                              </Badge>
                            </div>
                            <div className="flex flex-col gap-1 text-xs sm:text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>{formatDate(order.timestamp)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Table: {order.tableId}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Currency: {getCurrencyCode(order.currency)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            <span>{calculateOrderTotal(order.items)} items</span>
                          </div>
                        </div>
                      </CardHeader>
                      <Separator />
                      <CardContent className="px-4 sm:px-6 py-4">
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Order Items
                          </h4>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-semibold text-primary">
                                      {item.quantity.toString()}x
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm sm:text-base font-medium truncate">
                                      {item.menuItemId}
                                    </p>
                                    <p className="text-xs text-muted-foreground capitalize">
                                      {item.category}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </main>

      <footer className="border-t py-4 sm:py-6 mt-8">
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
