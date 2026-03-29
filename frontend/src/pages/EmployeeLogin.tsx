import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile, useValidateRestaurantIdentityId, useVerifyAndClaimAccessCode, useCheckEmployeeLink, useGetEmployeeDetails } from '@/hooks/useQueries';
import { toast } from 'sonner';
import ProfileSetupModal from '@/components/ProfileSetupModal';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const validateRestaurantMutation = useValidateRestaurantIdentityId();
  const verifyAndClaimMutation = useVerifyAndClaimAccessCode();
  const checkLinkMutation = useCheckEmployeeLink();
  const getEmployeeDetailsMutation = useGetEmployeeDetails();

  const [restaurantId, setRestaurantId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [step, setStep] = useState<'restaurant' | 'code'>('restaurant');
  const [error, setError] = useState('');
  const [validatedIdentityId, setValidatedIdentityId] = useState<string | null>(null);
  const [checkingLink, setCheckingLink] = useState(false);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    if (!isAuthenticated && loginStatus !== 'logging-in') {
      handleLogin();
    }
  }, [isAuthenticated, loginStatus]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Failed to authenticate. Please try again.');
    }
  };

  const handleRestaurantIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!restaurantId.trim()) {
      setError('Please enter a restaurant ID');
      return;
    }

    // Validate the restaurant ID format
    if (!restaurantId.match(/^RID-\d+$/i)) {
      setError('Invalid restaurant ID format. Expected format: RID-# (e.g., RID-1)');
      return;
    }

    setCheckingLink(true);

    try {
      // Validate that the restaurant exists
      const isValid = await validateRestaurantMutation.mutateAsync(restaurantId.toUpperCase());
      
      if (!isValid) {
        setError('Restaurant ID not found. Please check with your manager.');
        setCheckingLink(false);
        return;
      }

      // Check if there's an existing link for this Internet Identity and restaurant
      const employeeId = await checkLinkMutation.mutateAsync(restaurantId.toUpperCase());
      
      if (employeeId) {
        // Link exists - fetch employee details and navigate directly to dashboard
        try {
          const employeeDetails = await getEmployeeDetailsMutation.mutateAsync({
            identityId: restaurantId.toUpperCase(),
            employeeId,
          });
          
          if (employeeDetails) {
            toast.success(`Welcome back, ${employeeDetails.name}!`);
            navigate({
              to: '/employee-dashboard',
              search: {
                restaurantId: restaurantId.toUpperCase(),
                name: employeeDetails.name,
                category: employeeDetails.role,
              },
            });
            return;
          }
        } catch (err) {
          console.error('Error fetching employee details:', err);
          setError('Failed to load employee details. Please try again.');
          setCheckingLink(false);
          return;
        }
      }
      
      // No link exists - proceed to code entry
      setValidatedIdentityId(restaurantId.toUpperCase());
      setStep('code');
      setCheckingLink(false);
    } catch (error: any) {
      console.error('Restaurant validation error:', error);
      setError(error.message || 'Failed to validate restaurant ID. Please try again.');
      setCheckingLink(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accessCode.trim() || accessCode.length !== 6) {
      setError('Please enter a valid 6-digit access code');
      return;
    }

    try {
      const result = await verifyAndClaimMutation.mutateAsync({
        code: accessCode,
        identityId: restaurantId.toUpperCase(),
      });
      
      if (result.success && result.employeeData) {
        // Successfully claimed the code and linked to employee
        toast.success(`Welcome, ${result.employeeData.name}!`);
        
        // Navigate to employee dashboard with employee details
        navigate({
          to: '/employee-dashboard',
          search: {
            restaurantId: restaurantId.toUpperCase(),
            name: result.employeeData.name,
            category: result.employeeData.category,
          },
        });
      } else {
        // Code is invalid - show generic error without revealing codes
        setError('Invalid access code. Please check with your manager and try again.');
      }
    } catch (error: any) {
      console.error('Code verification error:', error);
      setError('Failed to verify access code. Please check with your manager and try again.');
    }
  };

  const handleBack = () => {
    if (step === 'code') {
      setStep('restaurant');
      setAccessCode('');
      setError('');
      setValidatedIdentityId(null);
    } else {
      navigate({ to: '/', search: {} });
    }
  };

  if (!isAuthenticated || loginStatus === 'logging-in') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showProfileSetup && <ProfileSetupModal />}
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
        <header className="border-b bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack} className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <div>
                <h1 className="text-base sm:text-xl font-bold">Employee Login</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {step === 'restaurant' ? 'Enter your restaurant ID' : 'Enter your access code'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-12 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {step === 'restaurant' ? 'Restaurant ID' : 'Access Code'}
              </CardTitle>
              <CardDescription>
                {step === 'restaurant' 
                  ? 'Enter the restaurant ID provided by your manager (e.g., RID-1)'
                  : 'Enter the 6-digit access code provided by your manager (first-time login only)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 'restaurant' ? (
                <form onSubmit={handleRestaurantIdSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurantId">Restaurant ID</Label>
                    <Input
                      id="restaurantId"
                      value={restaurantId}
                      onChange={(e) => {
                        setRestaurantId(e.target.value.toUpperCase());
                        setError('');
                      }}
                      placeholder="RID-1"
                      className="font-mono"
                      autoComplete="off"
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: RID-# (e.g., RID-1, RID-2, RID-10)
                    </p>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={validateRestaurantMutation.isPending || checkingLink || !restaurantId.trim()}
                  >
                    {(validateRestaurantMutation.isPending || checkingLink) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Continue
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accessCode" className="text-center block">
                      Access Code
                    </Label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={accessCode}
                        onChange={(value) => {
                          setAccessCode(value);
                          setError('');
                        }}
                        autoFocus
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Only needed for first-time login
                    </p>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={verifyAndClaimMutation.isPending || accessCode.length !== 6}
                  >
                    {verifyAndClaimMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Verify & Link Account
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </main>

        <footer className="border-t py-4 sm:py-6">
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
