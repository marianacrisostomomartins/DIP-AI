import { useLanguage } from '../contexts/LanguageContext';

export default function LoadingSpinner() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 text-sm">{t('loading.text')}</p>
      </div>
    </div>
  );
}
