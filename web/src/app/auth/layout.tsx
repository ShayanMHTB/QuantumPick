'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AuthProvider from '@/providers/auth-provider';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

// Import the LanguageToggle component when it's fixed
// Instead of importing from the non-existent shared folder, let's create a placeholder
const LanguageToggle = () => (
  <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
    <span>🌐</span>
    <span className="sr-only">Switch language</span>
  </Button>
);

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex min-h-screen">
          {/* Left side: Theme image/animation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:flex w-1/2 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 justify-center items-center"
          >
            <div className="max-w-md text-white p-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h1 className="text-4xl font-bold mb-6">QuantumPick</h1>
                <p className="text-xl mb-6">
                  The transparent Web3 lottery platform that puts fairness and
                  trust first.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-white mr-2" />
                    <span>Provably fair randomness</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-white mr-2" />
                    <span>Create your own lotteries</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-white mr-2" />
                    <span>Transparent blockchain verification</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </motion.div>

          {/* Right side: Auth content */}
          <div className="flex flex-col w-full lg:w-1/2">
            <div className="flex justify-between items-center p-6">
              <Button variant="ghost" asChild>
                <Link href="/">
                  <span>← Back to Home</span>
                </Link>
              </Button>
              <LanguageToggle />
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-md px-6 py-8">{children}</div>
            </div>
          </div>
        </div>
        <Toaster position="top-right" />
      </ThemeProvider>
    </AuthProvider>
  );
}
