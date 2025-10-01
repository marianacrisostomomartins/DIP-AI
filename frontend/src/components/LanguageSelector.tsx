import React, { useState } from 'react';
import { Languages } from 'lucide-react';
import { useLanguage, Language } from '../contexts/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'pt', name: t('language.portuguese'), flag: '🇧🇷' },
    { code: 'en', name: t('language.english'), flag: '🇺🇸' }
  ];

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Languages className="w-4 h-4" />
        <span className="text-medium font-medium">{languages.find(l => l.code === language)?.flag}</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 py-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`
                w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center gap-3
                ${language === lang.code ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}
              `}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
              {language === lang.code && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}