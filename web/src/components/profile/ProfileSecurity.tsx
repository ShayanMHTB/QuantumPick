'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import useAuth from '@/hooks/useAuth';
import useProfile from '@/hooks/useProfile';
import { useTranslation } from '@/i18n';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  RiCheckLine,
  RiErrorWarningLine,
  RiLoader4Line,
  RiShieldLine,
} from 'react-icons/ri';
import { toast } from 'sonner';

export function ProfileSecurity() {
  const { t } = useTranslation('dashboard');
  const {
    profile,
    isLoading,
    changePassword,
    change2FAStatus,
    check2FAStatus,
    deleteAccount,
  } = useProfile();
  const { logout } = useAuth();

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Two-factor states
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorQrCode, setTwoFactorQrCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);

  // Password change states
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Account deletion states
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Get 2FA status on load
  useEffect(() => {
    async function fetchStatus() {
      if (!isLoading && profile) {
        try {
          setIs2FALoading(true);
          // Use the hook method
          const enabled = await check2FAStatus();

          // Now 'enabled' is a direct boolean, not an object property
          if (enabled !== null) {
            setIs2FAEnabled(enabled);
          } else if (profile?.preferences?.twoFactorEnabled !== undefined) {
            // Fall back to profile preferences if API call fails
            setIs2FAEnabled(profile.preferences.twoFactorEnabled);
          }
        } catch (error) {
          console.error('Failed to check 2FA status:', error);
          // Fall back to using profile preferences
          if (profile?.preferences?.twoFactorEnabled !== undefined) {
            setIs2FAEnabled(profile.preferences.twoFactorEnabled);
          }
        } finally {
          setIs2FALoading(false);
        }
      }
    }

    fetchStatus();
  }, [isLoading, profile, check2FAStatus]);

  // Handle password change
  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error(t('profile.security.password.noMatch'));
      return;
    }

    setIsChangingPassword(true);
    try {
      const success = await changePassword(currentPassword, newPassword);
      if (success) {
        setShowPasswordDialog(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        toast.success(t('profile.security.password.success'));
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle 2FA setup
  const handleSetup2FA = async () => {
    setIs2FALoading(true);
    try {
      const result = await change2FAStatus(true);
      if (result.success && result.qrCode) {
        setTwoFactorQrCode(result.qrCode);
        setTwoFactorSecret(result.secret || '');
        setShowTwoFactorDialog(true);
      }
    } catch (error) {
      // If 2FA is already enabled, update our state
      if (error.message?.includes('already enabled')) {
        setIs2FAEnabled(true);
        toast.info(t('profile.security.twoFactor.alreadyEnabled'));
      } else {
        toast.error(t('profile.security.twoFactor.setupError'));
      }
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFactorCode) {
      toast.error(t('profile.security.twoFactor.codeRequired'));
      return;
    }

    setIs2FALoading(true);
    try {
      const result = await change2FAStatus(true, twoFactorCode);
      if (result.success) {
        setShowTwoFactorDialog(false);
        setTwoFactorCode('');
        setTwoFactorQrCode('');
        setTwoFactorSecret('');
        setIs2FAEnabled(true);
        toast.success(t('profile.security.twoFactor.enableSuccess'));
      }
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleDisable2FA = async (code: string) => {
    if (!code) {
      toast.error(t('profile.security.twoFactor.codeRequired'));
      return;
    }

    setIs2FALoading(true);
    try {
      const result = await change2FAStatus(false, code);
      if (result.success) {
        setIs2FAEnabled(false);
        toast.success(t('profile.security.twoFactor.disableSuccess'));
        setTwoFactorCode('');
      }
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error(t('profile.security.deleteAccount.confirmationError'));
      return;
    }

    setIsDeletingAccount(true);
    try {
      // Use the hook method for account deletion
      const success = await deleteAccount(profile?.id);

      if (success) {
        // Log out and redirect to home page
        await logout();
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Account deletion failed:', error);
      // Error already handled by the hook with toast
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteAccountDialog(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(t('common.copiedToClipboard'));
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast.error(t('common.copyFailed'));
      });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.security.title')}</CardTitle>
          <CardDescription>{t('profile.security.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading || !profile ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <>
              {/* Change Password */}
              <div className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      {t('profile.security.password.title')}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {t('profile.security.password.description')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordDialog(true)}
                  >
                    {t('profile.security.password.change')}
                  </Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      {t('profile.security.twoFactor.title')}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {t('profile.security.twoFactor.description')}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {is2FALoading ? (
                      <div className="flex items-center">
                        <RiLoader4Line className="h-5 w-5 animate-spin mr-2" />
                        <span>{t('common.loading')}</span>
                      </div>
                    ) : (
                      <>
                        {is2FAEnabled ? (
                          <Badge className="mr-2 bg-green-500 hover:bg-green-600">
                            <RiCheckLine className="mr-1 h-3 w-3" />
                            {t('profile.security.twoFactor.enabled')}
                          </Badge>
                        ) : (
                          <Badge className="mr-2 bg-yellow-500 hover:bg-yellow-600">
                            <RiErrorWarningLine className="mr-1 h-3 w-3" />
                            {t('profile.security.twoFactor.disabled')}
                          </Badge>
                        )}
                        {is2FAEnabled ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline">
                                {t('profile.security.twoFactor.disable')}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  {t('profile.security.twoFactor.disableTitle')}
                                </DialogTitle>
                                <DialogDescription>
                                  {t(
                                    'profile.security.twoFactor.disableDescription',
                                  )}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="disable2faCode">
                                    {t('profile.security.twoFactor.enterCode')}
                                  </Label>
                                  <Input
                                    id="disable2faCode"
                                    placeholder="123456"
                                    value={twoFactorCode}
                                    onChange={(e) => {
                                      // Only allow digits and limit to 6 characters
                                      const value = e.target.value
                                        .replace(/[^0-9]/g, '')
                                        .slice(0, 6);
                                      setTwoFactorCode(value);
                                    }}
                                    className="text-center tracking-wider font-mono text-lg"
                                    maxLength={6}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setTwoFactorCode('')}
                                  disabled={is2FALoading}
                                >
                                  {t('common.cancel')}
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    handleDisable2FA(twoFactorCode)
                                  }
                                  disabled={
                                    is2FALoading || twoFactorCode.length !== 6
                                  }
                                >
                                  {is2FALoading ? (
                                    <RiLoader4Line className="h-4 w-4 animate-spin mr-2" />
                                  ) : null}
                                  {t('profile.security.twoFactor.disable')}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Button
                            variant="default"
                            onClick={handleSetup2FA}
                            disabled={is2FALoading}
                          >
                            {is2FALoading ? (
                              <RiLoader4Line className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {t('profile.security.twoFactor.enable')}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Two Factor Setup Dialog - Enhanced Version */}
              <Dialog
                open={showTwoFactorDialog}
                onOpenChange={setShowTwoFactorDialog}
              >
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {t('profile.security.twoFactor.setupTitle')}
                    </DialogTitle>
                    <DialogDescription>
                      {t('profile.security.twoFactor.setupDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {twoFactorQrCode && (
                      <div className="flex justify-center">
                        <div className="relative p-6 border rounded-xl bg-white shadow-sm overflow-hidden">
                          {/* Decorative elements */}
                          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary -translate-x-2 -translate-y-2 rounded-tl-lg" />
                          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary translate-x-2 translate-y-2 rounded-br-lg" />

                          {/* QR Code */}
                          <div className="relative">
                            <img
                              src={twoFactorQrCode}
                              alt="QR Code for 2FA"
                              className="w-56 h-56 object-contain"
                            />

                            {/* Logo overlay in the center (optional) */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-white p-2 rounded-md">
                                <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                                  <RiShieldLine className="h-5 w-5 text-white" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {twoFactorSecret && (
                      <div className="space-y-2 text-center">
                        <Label className="text-sm font-medium">
                          {t('profile.security.twoFactor.secretKey')}
                        </Label>
                        <div className="flex items-center">
                          <div className="bg-muted/50 p-3 rounded-l-lg font-mono text-sm tracking-wider flex-1 overflow-x-auto border border-r-0">
                            {twoFactorSecret
                              .match(/.{1,4}/g)
                              ?.map((chunk, i) => (
                                <span key={i} className="inline-block mx-0.5">
                                  {chunk}
                                </span>
                              ))}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-full rounded-l-none border-l-0"
                            onClick={() => copyToClipboard(twoFactorSecret)}
                          >
                            <Copy className="h-auto w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t('profile.security.twoFactor.secretKeyHelp')}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="verificationCode" className="font-medium">
                        {t('profile.security.twoFactor.verificationCode')}
                      </Label>
                      <div className="flex flex-col space-y-2">
                        <Input
                          id="verificationCode"
                          placeholder="123456"
                          value={twoFactorCode}
                          onChange={(e) => {
                            // Only allow digits and limit to 6 characters
                            const value = e.target.value
                              .replace(/[^0-9]/g, '')
                              .slice(0, 6);
                            setTwoFactorCode(value);
                          }}
                          className="text-center tracking-wider font-mono text-lg"
                          maxLength={6}
                        />
                        <p className="text-xs text-muted-foreground">
                          {t('profile.security.twoFactor.enterCodeFromApp')}
                        </p>
                      </div>
                    </div>

                    {/* Recommended Apps Section */}
                    <div className="mt-2 pt-4 border-t border-muted">
                      <h4 className="text-sm font-medium mb-2">
                        {t('profile.security.twoFactor.recommendedApps')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <span>Google Authenticator</span>
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <span>Authy</span>
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <span>Microsoft Authenticator</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowTwoFactorDialog(false);
                        setTwoFactorCode('');
                      }}
                      disabled={is2FALoading}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      onClick={handleVerify2FA}
                      disabled={is2FALoading || twoFactorCode.length !== 6}
                    >
                      {is2FALoading ? (
                        <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {t('profile.security.twoFactor.verify')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Session Management */}
              <div className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      {t('profile.security.sessions.title')}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {t('profile.security.sessions.description')}
                    </p>
                  </div>
                  <Button variant="outline">
                    {t('profile.security.sessions.view')}
                  </Button>
                </div>
              </div>

              {/* Account Deletion */}
              <div className="p-4 border border-red-200 dark:border-red-900/50 rounded-lg space-y-4 bg-red-50 dark:bg-red-950/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-600 dark:text-red-400">
                      {t('profile.security.deleteAccount.title')}
                    </h4>
                    <p className="text-red-500/80 dark:text-red-400/80 text-sm">
                      {t('profile.security.deleteAccount.description')}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        {t('profile.security.deleteAccount.button')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">
                          {t('profile.security.deleteAccount.confirmTitle')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t(
                            'profile.security.deleteAccount.confirmDescription',
                          )}
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
                            {t('profile.security.deleteAccount.warningMessage')}
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-2 py-4">
                        <Label htmlFor="deleteConfirmation">
                          {t('profile.security.deleteAccount.typeToConfirm', {
                            text: 'DELETE',
                          })}
                        </Label>
                        <Input
                          id="deleteConfirmation"
                          value={deleteConfirmation}
                          onChange={(e) =>
                            setDeleteConfirmation(e.target.value)
                          }
                          className="border-red-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          onClick={() => setDeleteConfirmation('')}
                        >
                          {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                          onClick={handleDeleteAccount}
                          disabled={
                            deleteConfirmation !== 'DELETE' || isDeletingAccount
                          }
                        >
                          {isDeletingAccount && (
                            <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {t('profile.security.deleteAccount.confirmButton')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <RiShieldLine className="h-12 w-12 text-primary" />
            <div>
              <h3 className="text-lg font-medium mb-1">
                {t('profile.security.info.title')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('profile.security.info.description')}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  {t('profile.security.info.securityTips')}
                </Button>
                <Button variant="outline" size="sm">
                  {t('profile.security.info.contact')}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('profile.security.password.changeTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('profile.security.password.changeDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                {t('profile.security.password.current')}
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">
                {t('profile.security.password.new')}
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">
                {t('profile.security.password.confirm')}
              </Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
              }}
              disabled={isChangingPassword}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={
                isChangingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmNewPassword
              }
            >
              {isChangingPassword ? (
                <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {t('profile.security.password.update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
