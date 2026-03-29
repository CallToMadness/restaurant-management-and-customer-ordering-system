import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { useVerifyAccessCode } from '@/hooks/useQueries';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

interface AccessCodeModalProps {
  onSuccess: (data: { role: string; restaurantId?: string; employeeId?: string }) => void;
}

export default function AccessCodeModal({ onSuccess }: AccessCodeModalProps) {
  const [code, setCode] = useState('');
  const verifyCodeMutation = useVerifyAccessCode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error('Please enter a complete 6-digit code');
      return;
    }

    try {
      const result = await verifyCodeMutation.mutateAsync(code);
      if (result.isValid && result.role) {
        toast.success('Access code verified successfully!');
        onSuccess({
          role: result.role,
          restaurantId: result.restaurantId,
          employeeId: result.employeeId,
        });
      } else {
        toast.error(result.error || 'Invalid access code');
        setCode('');
      }
    } catch (error) {
      toast.error('Failed to verify access code. Please try again.');
      setCode('');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <img
              src="/assets/generated/access-code-icon-transparent.png"
              alt="Access Code"
              className="w-10 h-10 object-contain"
            />
          </div>
          <DialogTitle className="text-center">Enter Access Code</DialogTitle>
          <DialogDescription className="text-center">
            Please enter your assigned 6-digit access code to continue
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="access-code" className="text-center block">
              Access Code
            </Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => setCode(value)}
                disabled={verifyCodeMutation.isPending}
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
              Enter the 6-digit code provided to you
            </p>
          </div>

          {verifyCodeMutation.isError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>Invalid or expired access code. Please check and try again.</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={verifyCodeMutation.isPending || code.length !== 6}
          >
            {verifyCodeMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
