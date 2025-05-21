"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiGlobalLine, RiCheckLine } from "react-icons/ri";

// Supported languages
const languages = [
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "it", name: "Italiano" },
  { code: "ru", name: "Русский" },
  { code: "fa", name: "فارسی" },
];

export function LanguageToggle() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");

  // Initialize with the current language
  useEffect(() => {
    if (i18n.language) {
      setCurrentLanguage(i18n.language);
    }
  }, [i18n.language]);

  const changeLanguage = (langCode: string) => {
    // Change language in i18next
    i18n.changeLanguage(langCode);
    
    // Store language preference
    localStorage.setItem("language", langCode);
    
    setCurrentLanguage(langCode);

    // Navigate to the same page with the new locale
    // This assumes you have locale-specific routing set up
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(/^\/[a-z]{2}\//, `/${langCode}/`);
    
    if (currentPath !== newPath) {
      router.push(newPath);
    }
  };

  // Get the details of the current language
  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
          <RiGlobalLine className="h-5 w-5" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className="flex items-center justify-between"
          >
            <span>{language.name}</span>
            {language.code === currentLanguage && (
              <RiCheckLine className="ml-2 h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
