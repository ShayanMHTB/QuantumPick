'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import useAuth from '@/hooks/useAuth';
import usePermission from '@/hooks/usePermission';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';
import { Permission } from '@/types/permission.types';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  RiCheckLine,
  RiComputerLine,
  RiDashboardLine,
  RiGamepadLine,
  RiLogoutBoxRLine,
  RiMoonLine,
  RiSettings3Line,
  RiSunLine,
  RiTicket2Line,
  RiTranslate2,
  RiUser3Line,
} from 'react-icons/ri';

// Define navigation items
const navItems = [
  {
    title: 'dashboard.navigation.dashboard',
    href: '/dashboard',
    icon: RiDashboardLine,
    variant: 'default' as const,
  },
  {
    title: 'dashboard.navigation.lotteries',
    href: '/dashboard/lotteries',
    icon: RiGamepadLine,
    variant: 'ghost' as const,
  },
  {
    title: 'dashboard.navigation.tickets',
    href: '/dashboard/tickets',
    icon: RiTicket2Line,
    variant: 'ghost' as const,
  },
  {
    title: 'dashboard.navigation.profile',
    href: '/dashboard/profile',
    icon: RiUser3Line,
    variant: 'ghost' as const,
  },
  {
    title: 'dashboard.navigation.admin',
    href: '/dashboard/admin',
    icon: RiSettings3Line,
    variant: 'ghost' as const,
    requiredPermission: Permission.VIEW_ADMIN_DASHBOARD,
  },
];

// Language options
const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'ru', name: 'Русский' },
  { code: 'fa', name: 'فارسی' },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  user: any;
}

export function DashboardSidebar({ isOpen, user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { t, i18n } = useTranslation('dashboard');
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const { hasPermission } = usePermission();

  const handleLogout = async () => {
    await logout();
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    setIsLanguageOpen(false);
  };

  return (
    <Sidebar>
      <ScrollArea className="h-full py-4">
        {/* SidebarHeader */}
        <SidebarHeader className="px-3 pb-4">
          <h2
            className={cn(
              'px-4 text-lg font-semibold tracking-tight transition-opacity',
              isOpen ? 'opacity-100' : 'opacity-0',
            )}
          >
            {t('dashboard.sidebar.title')}
          </h2>
        </SidebarHeader>

        {/* SidebarContent */}
        <SidebarContent className="px-3 py-2">
          <SidebarGroup>
            <nav className="grid gap-1">
              {navItems
                .filter(
                  (item) =>
                    !item.requiredPermission ||
                    hasPermission(item.requiredPermission),
                )
                .map((item, index) => (
                  <Link key={index} href={item.href} passHref>
                    <Button
                      variant={pathname === item.href ? 'default' : 'ghost'}
                      className={cn(
                        'justify-start h-10 w-full text-left',
                        !isOpen && 'justify-center px-0',
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-5 w-5',
                          pathname === item.href
                            ? 'text-primary-foreground'
                            : 'text-muted-foreground',
                        )}
                      />
                      <span
                        className={cn(
                          'ml-2 transition-opacity',
                          isOpen
                            ? 'opacity-100'
                            : 'opacity-0 w-0 overflow-hidden',
                        )}
                      >
                        {t(item.title)}
                      </span>
                    </Button>
                  </Link>
                ))}

              {/* Logout button */}
              <Button
                variant="ghost"
                className={cn(
                  'justify-start h-10 w-full text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20',
                  !isOpen && 'justify-center px-0',
                )}
                onClick={handleLogout}
              >
                <RiLogoutBoxRLine className="h-5 w-5" />
                <span
                  className={cn(
                    'ml-2 transition-opacity',
                    isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden',
                  )}
                >
                  {t('dashboard.navigation.logout')}
                </span>
              </Button>
            </nav>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        {/* SidebarFooter */}
        <SidebarFooter className="mt-auto px-3 py-2">
          <SidebarGroup>
            {/* Theme toggle using ToggleGroup */}
            <div className="flex flex-col mb-4">
              {isOpen && (
                <span className="text-sm text-muted-foreground mb-2">
                  {t('dashboard.sidebar.theme')}
                </span>
              )}
              <ToggleGroup
                type="single"
                value={theme}
                onValueChange={(value) => {
                  if (value) setTheme(value);
                }}
                className={cn('justify-start', !isOpen && 'justify-center')}
              >
                <ToggleGroupItem value="light" aria-label="Light mode">
                  <RiSunLine className="h-5 w-5" />
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" aria-label="Dark mode">
                  <RiMoonLine className="h-5 w-5" />
                </ToggleGroupItem>
                <ToggleGroupItem value="system" aria-label="System theme">
                  <RiComputerLine className="h-5 w-5" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Language selector */}
            <div className="relative">
              {isOpen && (
                <span className="text-sm text-muted-foreground mb-2">
                  {t('dashboard.sidebar.language', 'language')}
                </span>
              )}
              <Button
                variant="ghost"
                className={cn(
                  'justify-start h-10 w-full',
                  !isOpen && 'justify-center px-0',
                )}
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              >
                <RiTranslate2 className="h-5 w-5 text-muted-foreground" />
                <span
                  className={cn(
                    'ml-2 transition-opacity',
                    isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden',
                  )}
                >
                  {languages.find((lang) => lang.code === i18n.language)
                    ?.name || 'Language'}
                </span>
              </Button>

              {/* Language dropdown */}
              {isLanguageOpen && isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-popover border rounded-md shadow-md z-10">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant="ghost"
                      className="justify-start h-9 w-full px-2 text-sm"
                      onClick={() => changeLanguage(lang.code)}
                    >
                      <span>{lang.name}</span>
                      {lang.code === i18n.language && (
                        <RiCheckLine className="ml-auto h-4 w-4" />
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </SidebarGroup>
        </SidebarFooter>
      </ScrollArea>
    </Sidebar>
  );
}
