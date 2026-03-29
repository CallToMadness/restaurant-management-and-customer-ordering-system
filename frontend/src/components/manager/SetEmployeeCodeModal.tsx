import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSetCustomAccessCode } from '@/hooks/useQueries';
import { toast } from 'sonner';
import type { Employee, RestaurantIdentityId } from '@/backend';

interface SetEmployeeCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  identityId: RestaurantIdentityId;
  onSuccess?: () => Promise<void>;
}

export default function SetEmployeeCodeModal({ open, onOpenChange, employee, identityId, onSuccess }: SetEmployeeCodeModalProps) {
  const [code, setCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');

  const setCodeMutation = useSetCustomAccessCode();

  const handleNext = () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    setError('');
    setStep('confirm');
  };

  const handleBack = () => {
    setStep('enter');
    setConfirmCode('');
    setError('');
  };

  const handleSubmit = async () => {
    if (code !== confirmCode) {
      setError('Codes do not match. Please try again.');
      return;
    }

    if (!employee) {
      setError('No employee selected');
      return;
    }

    try {
      await setCodeMutation.mutateAsync({
        identityId,
        employeeId: employee.id,
        customCode: code,
      });

      toast.success(`Custom code set for ${employee.name}`);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        await onSuccess();
      }
      
      // Reset and close
      setCode('');
      setConfirmCode('');
      setStep('enter');
      setError('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to set custom code:', error);
      if (error.message.includes('Duplicate')) {
        setError('This code is already in use. Please choose a different code.');
      } else {
        setError(error.message || 'Failed to set custom code. Please try again.');
      }
    }
  };

  const handleClose = () => {
    setCode('');
    setConfirmCode('');
    setStep('enter');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Custom Access Code</DialogTitle>
          <DialogDescription>
            {step === 'enter' 
              ? `Set a custom 6-digit one-time code for ${employee?.name || 'this employee'}`
              : 'Confirm the code by entering it again'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'enter' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-center block">
                  Enter 6-Digit Code
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={(value) => {
                      setCode(value);
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
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="confirmCode" className="text-center block">
                  Confirm Code
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={confirmCode}
                    onChange={(value) => {
                      setConfirmCode(value);
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
              </div>

              {code === confirmCode && confirmCode.length === 6 && (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-300">
                    Codes match! Click "Set Code" to confirm.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          {step === 'enter' ? (
            <>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="button" onClick={handleNext} disabled={code.length !== 6}>
                Next
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit} 
                disabled={confirmCode.length !== 6 || setCodeMutation.isPending}
              >
                {setCodeMutation.isPending ? 'Setting...' : 'Set Code'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
