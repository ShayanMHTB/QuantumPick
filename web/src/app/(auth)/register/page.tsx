'use client';

import WalletConnector from '@/components/auth/WalletConnector';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useState } from 'react';

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<string>('wallet');

  return (
    <div className="container flex flex-col items-center justify-center space-y-6 py-8 md:py-12">
      <h1 className="text-3xl text-center font-bold">Join QuantumPick</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Create an account to participate in lotteries or create your own
      </p>

      <Tabs
        defaultValue="email"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full max-w-md"
      >
        {/* <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="email">Email & Password</TabsTrigger>
        </TabsList> */}
        <TabsContent value="wallet" className="mt-6">
          <WalletConnector />
        </TabsContent>
        {/* <TabsContent value="email" className="mt-6">
          <RegisterForm />
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
