import React, { useState } from 'react';
import { X, Search, Check, Globe } from 'lucide-react';
import { WORLD_LANGUAGES } from '../../data/languages';
import { LanguageItem, TranslationKeys } from '../../types';
import { triggerVisualFx } from '../../utils/visualFx';

interface LanguagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageItem;
  onSelectLanguage: (lang: LanguageItem) => void;
  t: TranslationKeys;
}

export const LanguagesModal: React.FC<LanguagesModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
  t,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredLanguages = WORLD_LANGUAGES.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.nativeName.toLowerCase().includes(q) ||
      item.region.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950/70 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.selectLanguage}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                100+ World Languages supported
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              triggerVisualFx(e.clientX, e.clientY, '#94a3b8');
              onClose();
            }}
            className="clickable-option p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchLanguage || 'Search among 100+ languages...'}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 dark:focus:border-indigo-400"
            />
          </div>
        </div>

        {/* Language List */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100 dark:divide-slate-800/60 scrollbar-thin">
          {filteredLanguages.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No matching languages found
            </div>
          ) : (
            filteredLanguages.map((lang) => {
              const isSelected = currentLanguage.code === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={(e) => {
                    triggerVisualFx(e.clientX, e.clientY, '#06b6d4');
                    onSelectLanguage(lang);
                    onClose();
                  }}
                  className={`clickable-option w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="text-left">
                      <div className="text-sm font-medium flex items-center gap-2">
                        <span>{lang.name}</span>
                        <span className="text-xs text-slate-400 font-normal">({lang.nativeName})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">
                        {lang.region}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
