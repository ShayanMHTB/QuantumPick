'use client';

import LoginForm from '@/components/auth/LoginForm';
import WalletConnector from '@/components/auth/WalletConnector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<string>('wallet');

  return (
    <div className="container flex flex-col items-center justify-center space-y-6 py-8 md:py-12">
      <h1 className="text-3xl text-center font-bold">
        Welcome Back to QuantumPick
      </h1>
      <p className="text-muted-foreground text-center max-w-md">
        Sign in to access your account, join lotteries, or manage your existing
        ones
      </p>

      <Tabs
        defaultValue="email"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full max-w-md"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="email">Email & Password</TabsTrigger>
        </TabsList>
        <TabsContent value="wallet" className="mt-6">
          <WalletConnector />
        </TabsContent>
        <TabsContent value="email" className="mt-6">
          <LoginForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
