import React from 'react';
import { X, Palette, Sun, Moon, Monitor, Check, Sparkles } from 'lucide-react';
import { AppearanceSettings, TranslationKeys } from '../../types';
import { triggerVisualFx, playTechClickSound } from '../../utils/visualFx';

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  appearance: AppearanceSettings;
  onChangeAppearance: (settings: Partial<AppearanceSettings>) => void;
  t: TranslationKeys;
}

export const AppearanceModal: React.FC<AppearanceModalProps> = ({
  isOpen,
  onClose,
  appearance,
  onChangeAppearance,
  t,
}) => {
  if (!isOpen) return null;

  const themes = [
    {
      id: 'blue-purple',
      name: 'Blue & Purple (Default)',
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    },
    {
      id: 'electric-cyan',
      name: 'Electric Cyan & Neon',
      gradient: 'from-cyan-500 via-teal-500 to-blue-500',
    },
    {
      id: 'royal-violet',
      name: 'Royal Violet & Magenta',
      gradient: 'from-purple-600 via-fuchsia-500 to-pink-500',
    },
    {
      id: 'emerald-glow',
      name: 'Emerald & Mint Glow',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    },
  ];

  const handleSelectMode = (mode: 'light' | 'dark' | 'system', e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, mode === 'light' ? '#f59e0b' : '#6366f1');
    playTechClickSound('tap');
    onChangeAppearance({ mode });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.appearance}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Light, dark & themes
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

        <div className="mt-4 space-y-5">
          {/* 1. Light & Dark Screen Options */}
          <div>
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              App Screen Mode
            </label>
            <div className="grid grid-cols-2 gap-3 mb-2">
              {/* Light Mode Option */}
              <button
                type="button"
                onClick={(e) => handleSelectMode('light', e)}
                className={`clickable-option flex flex-col p-3.5 rounded-2xl border text-left transition-all ${
                  appearance.mode === 'light'
                    ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-sm ring-2 ring-amber-400/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300">
                    <Sun className="w-5 h-5" />
                  </div>
                  {appearance.mode === 'light' && (
                    <span className="p-0.5 rounded-full bg-amber-500 text-white">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold">Light Screen</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Clean crisp display like ChatGPT screen
                </div>
              </button>

              {/* Dark Mode Option */}
              <button
                type="button"
                onClick={(e) => handleSelectMode('dark', e)}
                className={`clickable-option flex flex-col p-3.5 rounded-2xl border text-left transition-all ${
                  appearance.mode === 'dark'
                    ? 'border-indigo-500 bg-indigo-950/60 text-indigo-200 shadow-sm ring-2 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <Moon className="w-5 h-5" />
                  </div>
                  {appearance.mode === 'dark' && (
                    <span className="p-0.5 rounded-full bg-indigo-500 text-white">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold">Dark Screen</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Whole app rendered in deep dark mode
                </div>
              </button>
            </div>

            {/* System Option */}
            <button
              type="button"
              onClick={(e) => handleSelectMode('system', e)}
              className={`clickable-option w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                appearance.mode === 'system'
                  ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                <span>{t.systemDefault} (Auto OS Sync)</span>
              </div>
              {appearance.mode === 'system' && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* 2. Color Accents */}
          <div>
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((theme) => {
                const isSelected = appearance.themeColor === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={(e) => {
                      triggerVisualFx(e.clientX, e.clientY, '#8b5cf6');
                      onChangeAppearance({ themeColor: theme.id as any });
                    }}
                    className={`clickable-option flex items-center gap-2.5 p-2 rounded-xl border text-left text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-950 dark:text-white font-bold ring-1 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg bg-gradient-to-tr ${theme.gradient} shrink-0 shadow-xs flex items-center justify-center text-white`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{theme.name.split(' (')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Font Sizing */}
          <div>
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              Font Sizing
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'small', label: 'Compact' },
                { id: 'medium', label: 'Standard' },
                { id: 'large', label: 'Comfort' },
              ].map(({ id, label }) => {
                const isSelected = appearance.fontSize === id;
                return (
                  <button
                    key={id}
                    onClick={(e) => {
                      triggerVisualFx(e.clientX, e.clientY, '#6366f1');
                      onChangeAppearance({ fontSize: id as any });
                    }}
                    className={`clickable-option p-2 rounded-xl border text-xs font-medium transition-all text-center ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={(e) => {
              triggerVisualFx(e.clientX, e.clientY, '#10b981');
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 active:scale-95 transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default AppearanceModal;
