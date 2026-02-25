import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, languages, LanguageCode } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LanguageToggle = () => {
  const { currentLanguage, setLanguage, t } = useLanguage();

  const handleLanguageChange = (code: LanguageCode) => {
    setLanguage(code);
    console.log(`Language changed to: ${code}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <span className="text-sm">{currentLanguage.flag}</span>
          <Globe className="h-4 w-4" />
          <span className="sr-only">{t('nav.changeLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center gap-3"
          >
            <span className="text-lg">{language.flag}</span>
            <span className="flex-1">{language.name}</span>
            {currentLanguage.code === language.code && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;