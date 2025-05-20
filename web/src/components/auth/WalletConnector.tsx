// src/components/auth/WalletConnector.tsx - debugging improvements

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useAuth from '@/hooks/useAuth';
import authService from '@/services/auth/authService';

// Supported wallet types
type WalletType = 'metamask' | 'walletconnect' | 'coinbase';

const WalletConnector = () => {
  const { web3Login, error, isLoading, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [walletError, setWalletError] = useState<string | null>(null);
  const [connectingWallet, setConnectingWallet] = useState<WalletType | null>(
    null,
  );
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Check if MetaMask is available
  const [hasMetaMask, setHasMetaMask] = useState(false);

  useEffect(() => {
    setHasMetaMask(typeof window !== 'undefined' && !!window.ethereum);
  }, []);

  // Handle wallet connection
  const connectWallet = useCallback(
    async (walletType: WalletType) => {
      clearError();
      setWalletError(null);
      setDebugInfo(null);
      setConnectingWallet(walletType);

      try {
        if (walletType === 'metamask') {
          if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
          }

          // Request accounts from MetaMask
          setDebugInfo('Requesting accounts from MetaMask...');
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
          });

          if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
          }

          setDebugInfo(`Account connected: ${accounts[0]}`);

          // Get the chain ID
          const chainId = await window.ethereum.request({
            method: 'eth_chainId',
          });

          // Convert chain ID from hex to decimal
          const chainIdDecimal = parseInt(chainId, 16);
          setDebugInfo(`ChainID: ${chainIdDecimal}`);

          try {
            // Get SIWE message directly through authService
            setDebugInfo('Getting SIWE message...');
            const message = await authService.siwe.getMessage({
              address: accounts[0],
              chainId: chainIdDecimal,
            });

            setDebugInfo(`Message received: ${message.substring(0, 30)}...`);

            // Request signature
            setDebugInfo('Requesting signature...');
            const signature = await window.ethereum.request({
              method: 'personal_sign',
              params: [message, accounts[0], ''],
            });

            setDebugInfo(
              `Signature received: ${signature.substring(0, 30)}...`,
            );

            // Verify signature
            setDebugInfo('Verifying signature...');
            const authResponse = await authService.siwe.verify({
              message,
              signature,
            });

            setDebugInfo('Auth response received, setting tokens...');

            // Handle auth response manually to ensure cookies are set
            if (authResponse.accessToken) {
              // Set token in localStorage
              localStorage.setItem(
                'quantum_pick_auth_token',
                authResponse.accessToken,
              );

              // Set token in cookies
              document.cookie = `quantum_pick_auth_token=${authResponse.accessToken}; path=/; max-age=86400; samesite=lax`;

              // Store user data if available
              if (authResponse.user) {
                localStorage.setItem(
                  'quantum_pick_user',
                  JSON.stringify(authResponse.user),
                );
              }
            }

            // Navigate to dashboard or callback URL
            const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
            router.push(callbackUrl);
          } catch (err: any) {
            console.error('SIWE error:', err);
            setDebugInfo(`SIWE error: ${err.message || 'Unknown error'}`);
            setWalletError(
              `Error during Web3 authentication: ${
                err.message || 'Unknown error'
              }`,
            );
          }
        } else if (walletType === 'walletconnect') {
          setWalletError('WalletConnect integration coming soon');
        } else if (walletType === 'coinbase') {
          setWalletError('Coinbase Wallet integration coming soon');
        }
      } catch (err: any) {
        console.error('Wallet connection error:', err);
        setWalletError(err.message || 'Failed to connect wallet');
      } finally {
        setConnectingWallet(null);
      }
    },
    [clearError, router, searchParams],
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Connect Your Wallet
        </CardTitle>
        <CardDescription>
          Choose your preferred wallet to sign in with Ethereum
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(error || walletError) && (
          <Alert variant="destructive">
            <AlertDescription>{error || walletError}</AlertDescription>
          </Alert>
        )}

        {debugInfo && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800 font-mono text-xs">
              {debugInfo}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start h-16 relative"
            onClick={() => connectWallet('metamask')}
            disabled={isLoading || connectingWallet !== null || !hasMetaMask}
          >
            <div className="flex items-center">
              <Image
                src="/icons/metamask.svg"
                alt="MetaMask"
                width={32}
                height={32}
                className="mr-3"
              />
              <span>MetaMask</span>
              {!hasMetaMask && (
                <span className="text-xs text-muted-foreground ml-2">
                  (Not installed)
                </span>
              )}
            </div>
            {connectingWallet === 'metamask' && (
              <Loader2 className="absolute right-4 h-5 w-5 animate-spin" />
            )}
          </Button>

          <div className="flex flex-col md:flex-row justify-between">
            <Button
              variant="outline"
              className="justify-start h-12 relative"
              onClick={() => connectWallet('walletconnect')}
              disabled={isLoading || connectingWallet !== null}
            >
              <div className="flex items-center">
                <Image
                  src="/icons/walletconnect.svg"
                  alt="WalletConnect"
                  width={28}
                  height={28}
                  className="mr-3"
                />
                <span>WalletConnect</span>
              </div>
              {connectingWallet === 'walletconnect' && (
                <Loader2 className="absolute right-4 h-5 w-5 animate-spin" />
              )}
            </Button>
            <Button
              variant="outline"
              className="justify-start h-12 relative"
              onClick={() => connectWallet('coinbase')}
              disabled={isLoading || connectingWallet !== null}
            >
              <div className="flex items-center">
                <Image
                  src="/icons/coinbase.svg"
                  alt="Coinbase Wallet"
                  width={28}
                  height={28}
                  className="mr-3"
                />
                <span>Coinbase Wallet</span>
              </div>
              {connectingWallet === 'coinbase' && (
                <Loader2 className="absolute right-4 h-5 w-5 animate-spin" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-center text-sm text-muted-foreground flex flex-col">
        By connecting your wallet, you agree to our{' '}
        <div className="flex flex-row my-2">
          <a href="/terms" className="underline mx-4">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="underline mx-4">
            Privacy Policy
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};

export default WalletConnector;
