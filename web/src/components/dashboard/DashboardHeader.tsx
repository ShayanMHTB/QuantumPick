'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useAuth from '@/hooks/useAuth';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  RiLogoutBoxRLine,
  RiNotification3Line,
  RiSettings4Line,
  RiUser3Line,
} from 'react-icons/ri';
import { SidebarTrigger } from '../ui/sidebar';

// Function to get title based on pathname
const getPageTitle = (pathname: string): string => {
  const path = pathname.split('/').pop() || 'dashboard';
  const capitalized = path.charAt(0).toUpperCase() + path.slice(1);
  return capitalized;
};

interface DashboardHeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  user: any;
}

export function DashboardHeader({
  toggleSidebar,
  isSidebarOpen,
  user,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const { t } = useTranslation('dashboard');
  const { logout } = useAuth();
  const [pageTitle, setPageTitle] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);

  // Set page title based on pathname
  useEffect(() => {
    setPageTitle(getPageTitle(pathname));
  }, [pathname]);

  // Mock notifications - in a real app, you'd fetch these from an API
  useEffect(() => {
    setNotifications([
      {
        id: 1,
        title: 'New lottery started',
        message: 'A new lottery you might be interested in has started.',
        time: '5 min ago',
        read: false,
      },
      {
        id: 2,
        title: 'Ticket purchase successful',
        message: 'Your recent ticket purchase was successful.',
        time: '1 hour ago',
        read: true,
      },
    ]);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center bg-background border-b px-4 md:px-6">
      <div className="flex items-center w-full">
        <SidebarTrigger />

        <h1 className="text-lg font-medium">
          {t(`dashboard.pages.${pageTitle.toLowerCase()}`)}
        </h1>

        <div className="ml-auto flex items-center gap-2">
          {/* Notifications dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <RiNotification3Line className="h-5 w-5" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-medium">
                  {t('dashboard.header.notifications')}
                </span>
                <Button variant="ghost" size="sm" className="text-xs">
                  {t('dashboard.header.markAllRead')}
                </Button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {t('dashboard.header.noNotifications')}
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer',
                        !notification.read && 'bg-muted/20',
                      )}
                    >
                      <div className="flex items-start">
                        <div
                          className={cn(
                            'w-2 h-2 mt-1.5 rounded-full mr-2',
                            notification.read ? 'bg-muted' : 'bg-primary',
                          )}
                        />
                        <div>
                          <div className="font-medium text-sm">
                            {notification.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {notification.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t text-center">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  {t('dashboard.header.viewAll')}
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase() ||
                    user?.id?.charAt(0).toUpperCase() ||
                    'U'}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium">
                  {user?.email || `User-${user?.id?.substring(0, 6)}`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {user?.role === 'PREMIUM' ? 'Premium User' : 'Standard User'}
                </p>
              </div>
              <DropdownMenuItem asChild>
                <a href="/dashboard/profile" className="cursor-pointer">
                  <RiUser3Line className="mr-2 h-4 w-4" />
                  <span>{t('dashboard.header.profile')}</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/dashboard/settings" className="cursor-pointer">
                  <RiSettings4Line className="mr-2 h-4 w-4" />
                  <span>{t('dashboard.header.settings')}</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-500 hover:text-red-600 cursor-pointer"
              >
                <RiLogoutBoxRLine className="mr-2 h-4 w-4" />
                <span>{t('dashboard.header.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
