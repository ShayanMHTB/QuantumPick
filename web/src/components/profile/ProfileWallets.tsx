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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import useProfile from '@/hooks/useProfile';
import { useTranslation } from '@/i18n';
import { Clipboard } from 'lucide-react';
import { useState } from 'react';
import {
  RiAddLine,
  RiCheckLine,
  RiClipboardLine,
  RiWalletLine,
} from 'react-icons/ri';
import { toast } from 'sonner';

// Wallet chains data
const WALLET_CHAINS = [
  { id: '1', name: 'Ethereum Mainnet' },
  { id: '137', name: 'Polygon Mainnet' },
  { id: '56', name: 'BNB Smart Chain' },
  { id: '42161', name: 'Arbitrum' },
  { id: '10', name: 'Optimism' },
];

export function ProfileWallets() {
  const { t } = useTranslation('dashboard');
  const { wallets, isLoading, addWallet, removeWallet, setPrimaryWallet } =
    useProfile();

  // Wallet states
  const [showAddWalletDialog, setShowAddWalletDialog] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletNickname, setNewWalletNickname] = useState('');
  const [newWalletChainId, setNewWalletChainId] = useState('1'); // Default to Ethereum mainnet
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);
  const [isAddingWallet, setIsAddingWallet] = useState(false);

  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4,
    )}`;
  };

  // Get chain name from chain ID
  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet';
      case 137:
        return 'Polygon Mainnet';
      case 56:
        return 'BNB Smart Chain';
      case 42161:
        return 'Arbitrum';
      case 10:
        return 'Optimism';
      default:
        return `Chain ID: ${chainId}`;
    }
  };

  // Handle adding a wallet
  const handleAddWallet = async () => {
    if (!newWalletAddress) {
      toast.error(t('profile.wallets.errors.noAddress'));
      return;
    }

    try {
      setIsAddingWallet(true);

      // 1. Get SIWE message for the wallet
      const messageResponse = await fetch(
        `/api/v1/wallets/verify/message?chainId=${newWalletChainId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem(
              'quantum_pick_auth_token',
            )}`,
          },
          body: JSON.stringify({ address: newWalletAddress }),
        },
      );

      if (!messageResponse.ok) {
        throw new Error('Failed to get verification message');
      }

      const { message } = await messageResponse.json();

      // 2. Request signature from wallet
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Request account access if needed
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          // Get the signature
          const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, newWalletAddress, ''],
          });

          // 3. Add wallet with signature
          await addWallet({
            address: newWalletAddress,
            chainId: parseInt(newWalletChainId),
            nickname: newWalletNickname || undefined,
            signature,
            message,
          });

          // Reset form
          setNewWalletAddress('');
          setNewWalletNickname('');
          setNewWalletChainId('1');
          setShowAddWalletDialog(false);
        } catch (error) {
          console.error('Wallet signature error:', error);
          toast.error(t('profile.wallets.errors.signature'));
        }
      } else {
        toast.error(t('profile.wallets.errors.noProvider'));
      }
    } catch (error) {
      console.error('Add wallet error:', error);
      toast.error(t('profile.wallets.errors.addFailed'));
    } finally {
      setIsAddingWallet(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{t('profile.wallets.title')}</CardTitle>
            <CardDescription>
              {t('profile.wallets.description')}
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddWalletDialog(true)}>
            <RiAddLine className="mr-2 h-4 w-4" />
            {t('profile.wallets.addWallet')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : wallets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <RiWalletLine className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>{t('profile.wallets.noWallets')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Primary Wallet - Displayed prominently at the top */}
              {wallets
                .filter((wallet) => wallet.isPrimary)
                .map((wallet) => (
                  <div
                    key={wallet.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border-2 border-primary rounded-lg space-y-4 md:space-y-0 bg-primary/5"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <h4 className="font-medium mr-2">
                          {wallet.nickname || formatAddress(wallet.address)}
                        </h4>
                        <Badge variant="default" className="bg-primary text-xs">
                          {t('profile.wallets.primary')}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <p className="text-muted-foreground text-sm mr-2">
                          {formatAddress(wallet.address)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            navigator.clipboard
                              .writeText(wallet.address)
                              .then(() => {
                                toast.success(t('profile.wallets.copied'));
                                setCopiedWallet(wallet.id);
                                setTimeout(() => setCopiedWallet(null), 2000);
                              })
                              .catch(() =>
                                toast.error(t('profile.wallets.copyFailed')),
                              );
                          }}
                        >
                          {copiedWallet === wallet.id ? (
                            <RiCheckLine className="h-4 w-4 text-green-500" />
                          ) : (
                            <RiClipboardLine />
                          )}
                          <span className="sr-only">
                            {t('profile.wallets.copy')}
                          </span>
                        </Button>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {getChainName(wallet.chainId)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge
                        variant="outline"
                        className="border-primary text-primary"
                      >
                        {t('profile.wallets.cannotRemove')}
                      </Badge>
                    </div>
                  </div>
                ))}

              {/* Secondary Wallets */}
              {wallets
                .filter((wallet) => !wallet.isPrimary)
                .map((wallet) => (
                  <div
                    key={wallet.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-muted rounded-lg space-y-4 md:space-y-0"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <h4 className="font-medium mr-2">
                          {wallet.nickname || formatAddress(wallet.address)}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {t('profile.wallets.secondary')}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <p className="text-muted-foreground text-sm mr-2">
                          {formatAddress(wallet.address)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            navigator.clipboard
                              .writeText(wallet.address)
                              .then(() => {
                                toast.success(t('profile.wallets.copied'));
                                setCopiedWallet(wallet.id);
                                setTimeout(() => setCopiedWallet(null), 2000);
                              })
                              .catch(() =>
                                toast.error(t('profile.wallets.copyFailed')),
                              );
                          }}
                        >
                          {copiedWallet === wallet.id ? (
                            <RiCheckLine className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clipboard className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {t('profile.wallets.copy')}
                          </span>
                        </Button>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {getChainName(wallet.chainId)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                          >
                            {t('profile.wallets.remove')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('profile.wallets.removeConfirm.title')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('profile.wallets.removeConfirm.description')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t('common.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeWallet(wallet.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              {t('profile.wallets.remove')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <RiWalletLine className="h-12 w-12 text-primary" />
            <div>
              <h3 className="text-lg font-medium mb-1">
                {t('profile.wallets.info.title')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('profile.wallets.info.description')}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  {t('profile.wallets.info.learnMore')}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Wallet Dialog */}
      <Dialog open={showAddWalletDialog} onOpenChange={setShowAddWalletDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('profile.wallets.add.title')}</DialogTitle>
            <DialogDescription>
              {t('profile.wallets.add.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="walletAddress">
                {t('profile.wallets.add.address')}
              </Label>
              <Input
                id="walletAddress"
                placeholder="0x..."
                value={newWalletAddress}
                onChange={(e) => setNewWalletAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t('profile.wallets.add.addressHelp')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="walletNickname">
                {t('profile.wallets.add.nickname')}
              </Label>
              <Input
                id="walletNickname"
                placeholder={t('profile.wallets.add.nicknamePlaceholder')}
                value={newWalletNickname}
                onChange={(e) => setNewWalletNickname(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t('profile.wallets.add.nicknameHelp')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="walletChain">
                {t('profile.wallets.add.chain')}
              </Label>
              <Select
                value={newWalletChainId}
                onValueChange={setNewWalletChainId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('profile.wallets.add.chainPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {WALLET_CHAINS.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('profile.wallets.add.chainHelp')}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddWalletDialog(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleAddWallet}
              disabled={isAddingWallet || !newWalletAddress}
            >
              {isAddingWallet ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t('profile.wallets.add.adding')}
                </span>
              ) : (
                <>{t('profile.wallets.add.addButton')}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
