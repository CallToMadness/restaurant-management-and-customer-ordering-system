import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, ArrowLeft, LogOut, Copy, Check, Shield, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import RestaurantSetup from '@/components/manager/RestaurantSetup';
import MenuManagement from '@/components/manager/MenuManagement';
import TableManagement from '@/components/manager/TableManagement';
import OrdersView from '@/components/manager/OrdersView';
import EmployeeManagement from '@/components/manager/EmployeeManagement';
import ProfileSetupModal from '@/components/ProfileSetupModal';
import { useRestaurants, useGetCallerUserProfile, useIsCallerAdmin } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useActor } from '@/hooks/useActor';
import { toast } from 'sonner';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { identity, clear, loginStatus } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: restaurants, isLoading: restaurantsLoading, error: restaurantsError } = useRestaurants();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const [selectedIdentityId, setSelectedIdentityId] = useState<string | null>(null);
  const [copiedIdentityId, setCopiedIdentityId] = useState(false);

  const isAuthenticated = !!identity;
  const selectedRestaurant = restaurants?.find((r) => r.identityId === selectedIdentityId);
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/', search: {} });
  };

  const handleCopyIdentityId = async () => {
    if (selectedRestaurant?.identityId) {
      try {
        await navigator.clipboard.writeText(selectedRestaurant.identityId);
        setCopiedIdentityId(true);
        toast.success('Restaurant ID copied to clipboard');
        setTimeout(() => setCopiedIdentityId(false), 2000);
      } catch (error) {
        toast.error('Failed to copy Restaurant ID');
      }
    }
  };

  const handleResetComplete = () => {
    setSelectedIdentityId(null);
    toast.info('Please set up your restaurant again');
  };

  // Handle authentication requirement
  useEffect(() => {
    if (loginStatus === 'idle' && !isAuthenticated) {
      // User is not authenticated and not in the process of logging in
      navigate({ to: '/', search: {} });
    }
  }, [isAuthenticated, loginStatus, navigate]);

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
  if (actorFetching || profileLoading || !isFetched || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error if restaurants failed to load
  if (restaurantsError) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
        <header className="border-b bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/', search: {} })} className="h-9 w-9 sm:h-10 sm:w-10">
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <h1 className="text-base sm:text-xl font-bold">Restaurant Manager</h1>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="h-9 sm:h-10">
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 flex items-center justify-center">
          <Card className="max-w-md w-full border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                Error Loading Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                There was an error loading your restaurant data. This might be due to permission issues or a backend error.
              </p>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs font-mono text-destructive">
                  {restaurantsError instanceof Error ? restaurantsError.message : 'Unknown error'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => window.location.reload()} className="flex-1">
                  Retry
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <>
      {showProfileSetup && <ProfileSetupModal />}
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
        <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/', search: {} })} className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10">
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-xl font-bold truncate">
                    Restaurant Manager
                    {isAdmin && <span className="ml-2 text-xs sm:text-sm text-destructive">(Admin)</span>}
                  </h1>
                  {selectedRestaurant && (
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{selectedRestaurant.name}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {userProfile && (
                  <span className="text-xs sm:text-sm text-muted-foreground hidden md:inline">Welcome, {userProfile.name}</span>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout} className="h-9 sm:h-10">
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
            
            {selectedRestaurant?.identityId && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between gap-2 bg-muted/50 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Restaurant ID:</span>
                    <code className="text-xs sm:text-sm font-mono font-semibold text-foreground bg-background px-2 py-1 rounded truncate">
                      {selectedRestaurant.identityId}
                    </code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyIdentityId}
                    className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                    title="Copy Restaurant ID"
                  >
                    {copiedIdentityId ? (
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    <span className="hidden sm:inline sm:ml-2">Copy</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {restaurantsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground">Loading restaurants...</p>
              </div>
            </div>
          ) : !selectedIdentityId || !selectedRestaurant ? (
            <RestaurantSetup
              restaurants={restaurants || []}
              onSelectRestaurant={setSelectedIdentityId}
            />
          ) : (
            <Tabs defaultValue="menu" className="w-full">
              <TabsList className={`grid w-full max-w-3xl mx-auto ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'} mb-4 sm:mb-8 h-auto`}>
                <TabsTrigger value="menu" className="text-xs sm:text-sm py-2 sm:py-2.5">Menu</TabsTrigger>
                <TabsTrigger value="employees" className="text-xs sm:text-sm py-2 sm:py-2.5">
                  <span className="hidden sm:inline">Employees</span>
                  <span className="sm:hidden">Staff</span>
                </TabsTrigger>
                <TabsTrigger value="tables" className="text-xs sm:text-sm py-2 sm:py-2.5">Tables</TabsTrigger>
                <TabsTrigger value="orders" className="text-xs sm:text-sm py-2 sm:py-2.5">Orders</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs sm:text-sm py-2 sm:py-2.5">
                  <span className="hidden sm:inline">Settings</span>
                  <span className="sm:hidden">Set</span>
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="admin" className="text-xs sm:text-sm py-2 sm:py-2.5">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Admin</span>
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="menu">
                <MenuManagement restaurant={selectedRestaurant} />
              </TabsContent>

              <TabsContent value="employees">
                <EmployeeManagement restaurant={selectedRestaurant} />
              </TabsContent>

              <TabsContent value="tables">
                <TableManagement restaurant={selectedRestaurant} />
              </TabsContent>

              <TabsContent value="orders">
                <OrdersView identityId={selectedRestaurant.identityId} />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <RestaurantSetup
                  restaurants={restaurants || []}
                  onSelectRestaurant={setSelectedIdentityId}
                  editingRestaurant={selectedRestaurant}
                />
              </TabsContent>

              {isAdmin && (
                <TabsContent value="admin" className="space-y-6">
                  <Card className="border-destructive/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-destructive" />
                        Platform Administrator
                      </CardTitle>
                      <CardDescription>
                        You are the default admin (first Internet Identity account)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            Admin Dashboard - Limited Functionality
                          </CardTitle>
                          <CardDescription>
                            Advanced admin features require additional backend implementation
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            The admin dashboard is currently limited due to missing backend endpoints. 
                            Full restaurant management, canister health monitoring, and migration features 
                            will be available once the backend is updated with the required methods.
                          </p>
                          <div className="bg-muted/50 rounded-lg p-4">
                            <h3 className="font-semibold mb-2">Required Backend Methods:</h3>
                            <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                              <li>getAdminDashboardData()</li>
                              <li>migrateRestaurant()</li>
                              <li>addCanisterHealth() / getAllCanisterHealth()</li>
                              <li>resetRestaurantData() for any restaurant</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          )}
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
    </>
  );
}
