import React from 'react';
import { useLanguage } from './LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'ur', name: 'Urdu', native: 'اردو' },
    { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' }
  ];

  return (
    <div className="relative inline-block">
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="appearance-none bg-white/50 rounded-[14px] pl-10 pr-8 py-2 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-800 font-medium cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.native}
          </option>
        ))}
      </select>
      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600 pointer-events-none" />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}