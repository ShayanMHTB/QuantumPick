import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Loader2, Copy, Check } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useTwoFactor from '@/hooks/useTwoFactor';

// Validation schema for 2FA verification code
const verifySchema = z.object({
  code: z.string().length(6, 'Code must be exactly 6 digits').regex(/^\d+$/, 'Code must only contain digits'),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

const TwoFactorSetup = () => {
  const { 
    isEnabled,
    isLoading, 
    error, 
    setupData, 
    enable, 
    verify, 
    disable, 
    resetSetupData,
    clearError
  } = useTwoFactor();
  
  const [activeTab, setActiveTab] = useState(isEnabled ? 'disable' : 'enable');
  const [showSuccess, setShowSuccess] = useState(false);
  const [disableSuccess, setDisableSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    },
  });

  // Handle enable 2FA
  const handleEnable = async () => {
    clearError();
    try {
      await enable();
    } catch (err) {
      // Error handled by the hook
    }
  };

  // Handle verify 2FA
  const handleVerify = async (data: VerifyFormValues) => {
    clearError();
    try {
      const success = await verify(data.code);
      
      if (success) {
        setShowSuccess(true);
        resetSetupData();
        reset();
      }
    } catch (err) {
      // Error handled by the hook
    }
  };

  // Handle disable 2FA
  const handleDisable = async (data: VerifyFormValues) => {
    clearError();
    try {
      const success = await disable(data.code);
      
      if (success) {
        setDisableSuccess(true);
        reset();
      }
    } catch (err) {
      // Error handled by the hook
    }
  };

  // Handle copy secret to clipboard
  const copyToClipboard = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account with two-factor authentication
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enable" disabled={isEnabled && !disableSuccess}>
              Enable 2FA
            </TabsTrigger>
            <TabsTrigger value="disable" disabled={!isEnabled || disableSuccess}>
              Disable 2FA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enable" className="space-y-4 mt-4">
            {showSuccess ? (
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">
                  Two-factor authentication has been successfully enabled for your account.
                </AlertDescription>
              </Alert>
            ) : setupData ? (
              <form onSubmit={handleSubmit(handleVerify)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Scan the QR code with your authenticator app or manually enter the secret key
                    </p>
                    
                    <div className="bg-white p-2 inline-block mb-4 mx-auto">
                      <Image
                        src={`data:image/png;base64,${setupData.qrCode}`}
                        alt="QR Code for 2FA"
                        width={180}
                        height={180}
                      />
                    </div>
                    
                    <div className="relative mb-4">
                      <Input
                        value={setupData.secret}
                        readOnly
                        className="pr-10 text-center font-mono"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2"
                        onClick={copyToClipboard}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      placeholder="123456"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      maxLength={6}
                      {...register('code')}
                    />
                    {errors.code && (
                      <p className="text-sm text-red-500">{errors.code.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={resetSetupData}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Enable'
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <p>
                  Two-factor authentication adds an extra layer of security to your account by requiring a code from your phone in addition to your password.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Protect your account from unauthorized access</li>
                  <li>Receive codes via an authenticator app like Google Authenticator or Authy</li>
                  <li>Required for high-value transactions and security-sensitive actions</li>
                </ul>
                <Button onClick={handleEnable} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing Setup...
                    </>
                  ) : (
                    'Setup Two-Factor Authentication'
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="disable" className="space-y-4 mt-4">
            {disableSuccess ? (
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">
                  Two-factor authentication has been successfully disabled for your account.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit(handleDisable)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    To disable two-factor authentication, please enter the verification code from your authenticator app.
                  </p>
                  
                  <Label htmlFor="disableCode">Verification Code</Label>
                  <Input
                    id="disableCode"
                    placeholder="123456"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    maxLength={6}
                    {...register('code')}
                  />
                  {errors.code && (
                    <p className="text-sm text-red-500">{errors.code.message}</p>
                  )}
                </div>

                <Alert variant="warning">
                  <AlertDescription>
                    Warning: Disabling two-factor authentication will make your account less secure.
                  </AlertDescription>
                </Alert>

                <Button type="submit" variant="destructive" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Disable Two-Factor Authentication'
                  )}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <p>
          We recommend using authenticator apps like Google Authenticator, Authy, or Microsoft Authenticator for the best security.
        </p>
      </CardFooter>
    </Card>
  );
};

export default TwoFactorSetup;

