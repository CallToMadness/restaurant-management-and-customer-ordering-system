import { useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, ShoppingBag } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';

export default function HomePage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/' });
  const tableId = search.table;
  const { identity, login, loginStatus } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // If there's a table parameter, redirect to customer order page with the table parameter
  useEffect(() => {
    if (tableId) {
      navigate({ to: '/customer', search: { table: tableId } });
    }
  }, [tableId, navigate]);

  const handleManagerLogin = async () => {
    if (isAuthenticated) {
      // Already authenticated, just navigate
      navigate({ to: '/manager', search: {} });
    } else if (!isLoggingIn) {
      // Not authenticated and not currently logging in, start login
      try {
        await login();
        // After successful login, navigate to manager dashboard
        navigate({ to: '/manager', search: {} });
      } catch (error) {
        console.error('Login failed:', error);
      }
    }
  };

  const handleEmployeeLogin = () => {
    navigate({ to: '/employee-login', search: {} });
  };

  const handleCustomerLogin = async () => {
    if (isAuthenticated) {
      // Already authenticated, just navigate
      navigate({ to: '/customer-dashboard', search: {} });
    } else if (!isLoggingIn) {
      // Not authenticated and not currently logging in, start login
      try {
        await login();
        // After successful login, navigate to customer dashboard
        navigate({ to: '/customer-dashboard', search: {} });
      } catch (error) {
        console.error('Login failed:', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">RestaurantOS</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Complete Restaurant Management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              Welcome to RestaurantOS
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Choose your role to access the platform
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50"
              onClick={handleManagerLogin}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <img 
                    src="/assets/generated/manager-login-icon-transparent.png" 
                    alt="Manager" 
                    className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
                  />
                </div>
                <CardTitle className="text-lg sm:text-xl">Manager</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Manage your restaurant, menu, and staff
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg" disabled={isLoggingIn}>
                  {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Go to Dashboard' : 'Login as Manager'}
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50"
              onClick={handleEmployeeLogin}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center">
                  <img 
                    src="/assets/generated/employee-login-icon-transparent.png" 
                    alt="Employee" 
                    className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
                  />
                </div>
                <CardTitle className="text-lg sm:text-xl">Employee</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Access your work dashboard and orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="secondary" size="lg">
                  Login as Employee
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50 sm:col-span-2 lg:col-span-1"
              onClick={handleCustomerLogin}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-gradient-to-br from-accent/10 to-secondary/10 flex items-center justify-center">
                  <img 
                    src="/assets/generated/customer-login-icon-transparent.dim_64x64.png" 
                    alt="Customer" 
                    className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
                  />
                </div>
                <CardTitle className="text-lg sm:text-xl">Customer</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  View your order history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" size="lg" disabled={isLoggingIn}>
                  {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Go to Dashboard' : 'Login as Customer'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/50 border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <ShoppingBag className="w-5 h-5" />
                Customer Ordering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Customers can scan QR codes at tables to access the ordering interface directly without logging in.
                Table links are generated in the manager dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-6 sm:py-8">
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
