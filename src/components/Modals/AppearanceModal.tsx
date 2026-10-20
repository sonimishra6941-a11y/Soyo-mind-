import React, { useRef, useState } from 'react';
import { X, Palette, Sun, Moon, Monitor, Check, Sparkles, Layers, ImagePlus, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { AppearanceSettings, TranslationKeys } from '../../types';
import { triggerVisualFx, playTechClickSound } from '../../utils/visualFx';
import { TEN_THEMES, ThemeId, getThemeById } from '../../data/themes';
import { processGalleryImage, CURATED_GALLERY_PRESETS } from '../../utils/galleryTheme';

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const currentTheme = getThemeById(appearance.themeColor);

  const handleSelectMode = (mode: 'light' | 'dark' | 'system', e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, mode === 'light' ? '#f59e0b' : '#6366f1');
    playTechClickSound('tap');
    onChangeAppearance({ mode });
  };

  const handleSelectTheme = (themeId: ThemeId, e: React.MouseEvent) => {
    const selectedTheme = getThemeById(themeId);
    triggerVisualFx(e.clientX, e.clientY, selectedTheme.primaryColor);
    playTechClickSound('tap');
    onChangeAppearance({
      themeColor: themeId,
      mode: selectedTheme.mode,
      customWallpaper: undefined,
      customWallpaperName: undefined,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const dataUrl = await processGalleryImage(file);
      playTechClickSound('magic');
      onChangeAppearance({
        customWallpaper: dataUrl,
        customWallpaperName: file.name,
      });
    } catch (err) {
      console.error('Failed to load gallery picture:', err);
    } finally {
      setIsProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.appearance || 'Appearance & Themes'}
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  10 Palettes
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose from 10 front themes with custom gradients and ambient glows
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

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          
          {/* Active Theme Highlight Banner */}
          <div
            className="relative overflow-hidden rounded-2xl p-4 text-white shadow-lg transition-all duration-500 border border-white/20"
            style={{ background: currentTheme.bgGradient }}
          >
            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/20 text-white backdrop-blur-xs">
                  Active Front Theme
                </span>
                <h3 className="text-base font-extrabold mt-1 text-white drop-shadow-sm">
                  {currentTheme.name}
                </h3>
                <p className="text-xs text-white/80 mt-0.5 max-w-sm">
                  {currentTheme.tagline}
                </p>
              </div>
              <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md text-white border border-white/10 shrink-0">
                {currentTheme.mode} mode
              </span>
            </div>
          </div>

          {/* 1. Add Theme from Gallery */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ImagePlus className="w-3.5 h-3.5 text-pink-500" />
                <span>Add Theme from Gallery</span>
              </label>
              {appearance.customWallpaper && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase">
                  Active
                </span>
              )}
            </div>

            {appearance.customWallpaper ? (
              /* Active Gallery Picture Preview */
              <div className="p-3 rounded-2xl border-2 border-pink-500/50 bg-pink-500/5 dark:bg-pink-950/30 flex items-center gap-3.5 shadow-xs mb-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-pink-500/40 shadow-sm relative bg-slate-900">
                  <img
                    src={appearance.customWallpaper}
                    alt="Active Gallery Wallpaper"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1 p-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {appearance.customWallpaperName || 'Gallery Photo Theme'}
                  </div>
                  <p className="text-[11px] text-pink-600 dark:text-pink-400 font-medium mt-0.5">
                    Saved in Front Theme background
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {isProcessing ? 'Loading...' : 'Change Picture'}
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        triggerVisualFx(e.clientX, e.clientY, '#ef4444');
                        playTechClickSound('tap');
                        onChangeAppearance({
                          customWallpaper: undefined,
                          customWallpaperName: undefined,
                        });
                      }}
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Reset to Themes
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Choose Picture from Gallery Button */
              <button
                type="button"
                onClick={(e) => {
                  triggerVisualFx(e.clientX, e.clientY, '#ec4899');
                  playTechClickSound('tap');
                  fileInputRef.current?.click();
                }}
                disabled={isProcessing}
                className="clickable-option w-full flex items-center justify-between p-3.5 rounded-2xl border border-dashed border-pink-400/80 dark:border-pink-500/60 bg-gradient-to-r from-pink-50/70 via-purple-50/50 to-indigo-50/70 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-indigo-950/20 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-all text-left group shadow-xs active:scale-[0.98] mb-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Add Theme from Gallery</span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-pink-500 text-white">
                        Upload
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isProcessing ? 'Processing image...' : 'Choose any photo from gallery to save in front theme'}
                    </div>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 text-pink-600 dark:text-pink-400 group-hover:-translate-y-0.5 transition-transform shadow-2xs">
                  <Upload className="w-4 h-4" />
                </div>
              </button>
            )}

            {/* Quick Gallery Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-semibold text-slate-400 uppercase shrink-0">
                Presets:
              </span>
              {CURATED_GALLERY_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={(e) => {
                    triggerVisualFx(e.clientX, e.clientY, preset.primaryColor);
                    playTechClickSound('magic');
                    onChangeAppearance({
                      customWallpaper: preset.url,
                      customWallpaperName: preset.name,
                      mode: preset.mode,
                    });
                  }}
                  className="clickable-option flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-950/40 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-all shrink-0 active:scale-95"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: preset.primaryColor }}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. All 10 Themes Selection */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>10 Curated AI Front Themes</span>
              </label>
              <span className="text-[11px] text-slate-400">Tap to apply theme</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TEN_THEMES.map((theme) => {
                const isSelected = !appearance.customWallpaper && (appearance.themeColor || 'royal-midnight-purple') === theme.id;

                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={(e) => handleSelectTheme(theme.id, e)}
                    className={`clickable-option flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/70 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    {/* Visual Preview Swatch Circle */}
                    <div
                      className="w-10 h-10 rounded-2xl shrink-0 shadow-sm border border-black/10 dark:border-white/20 flex items-center justify-center relative overflow-hidden"
                      style={{ background: theme.bgGradient }}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: theme.primaryColor,
                          boxShadow: `0 0 8px ${theme.primaryColor}`,
                        }}
                      />
                    </div>

                    {/* Theme Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                          {theme.name}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {theme.tagline}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase"
                          style={{
                            backgroundColor: `${theme.primaryColor}20`,
                            color: theme.primaryColor,
                          }}
                        >
                          {theme.mode}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Light & Dark Screen Mode Overrides */}
          <div>
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Screen Contrast Mode</span>
            </label>
            <div className="grid grid-cols-2 gap-3 mb-2">
              {/* Light Mode Option */}
              <button
                type="button"
                onClick={(e) => handleSelectMode('light', e)}
                className={`clickable-option flex flex-col p-3 rounded-2xl border text-left transition-all ${
                  appearance.mode === 'light'
                    ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-sm ring-2 ring-amber-400/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300">
                    <Sun className="w-4 h-4" />
                  </div>
                  {appearance.mode === 'light' && (
                    <span className="p-0.5 rounded-full bg-amber-500 text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold">Light Screen</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Clean crisp paper / ChatGPT style
                </div>
              </button>

              {/* Dark Mode Option */}
              <button
                type="button"
                onClick={(e) => handleSelectMode('dark', e)}
                className={`clickable-option flex flex-col p-3 rounded-2xl border text-left transition-all ${
                  appearance.mode === 'dark'
                    ? 'border-indigo-500 bg-indigo-950/60 text-indigo-200 shadow-sm ring-2 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <Moon className="w-4 h-4" />
                  </div>
                  {appearance.mode === 'dark' && (
                    <span className="p-0.5 rounded-full bg-indigo-500 text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold">Dark Screen</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Deep obsidian / midnight theme
                </div>
              </button>
            </div>

            {/* Auto System Sync */}
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
                <span>{t.systemDefault || 'System Default'} (Sync with Operating System)</span>
              </div>
              {appearance.mode === 'system' && <Check className="w-3.5 h-3.5" />}
            </button>
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
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Active: <strong className="text-slate-800 dark:text-slate-200">{currentTheme.name}</strong>
          </span>
          <button
            onClick={(e) => {
              triggerVisualFx(e.clientX, e.clientY, '#10b981');
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default AppearanceModal;
