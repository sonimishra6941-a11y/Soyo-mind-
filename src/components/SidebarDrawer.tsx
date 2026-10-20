import React from 'react';
import {
  X,
  Globe,
  PenSquare,
  History,
  Trash2,
  Share2,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Palette,
  Volume2,
  User,
  ShieldCheck,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  ExternalLink,
  Key,
  Sun,
  Moon,
  LogIn,
  Check,
  ImagePlus,
  Upload,
} from 'lucide-react';
import { TranslationKeys, UserProfile, AppearanceSettings } from '../types';
import { triggerVisualFx, playTechClickSound } from '../utils/visualFx';
import { TEN_THEMES, ThemeId } from '../data/themes';
import { processGalleryImage } from '../utils/galleryTheme';

export type DrawerAction =
  | 'languages'
  | 'new-chat'
  | 'history'
  | 'delete-chat'
  | 'share-chat'
  | 'share-app'
  | 'photo-studio'
  | 'vision-camera'
  | 'api-key'
  | 'appearance'
  | 'voice-settings'
  | 'account'
  | 'privacy'
  | 'notifications'
  | 'about'
  | 'login'
  | 'logout';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: DrawerAction) => void;
  onSetThemeMode?: (mode: 'light' | 'dark') => void;
  onSelectTheme?: (themeId: ThemeId) => void;
  onSetCustomWallpaper?: (wallpaperDataUrl: string, fileName?: string) => void;
  onRemoveCustomWallpaper?: () => void;
  t: TranslationKeys;
  currentLanguageName: string;
  currentLanguageFlag: string;
  userProfile: UserProfile;
  appearance: AppearanceSettings;
  chatCount: number;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  onSetThemeMode,
  onSelectTheme,
  onSetCustomWallpaper,
  onRemoveCustomWallpaper,
  t,
  currentLanguageName,
  currentLanguageFlag,
  userProfile,
  appearance,
  chatCount,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isProcessingImage, setIsProcessingImage] = React.useState(false);

  if (!isOpen) return null;

  const handleAction = (action: DrawerAction, e: React.MouseEvent, color = '#6366f1') => {
    triggerVisualFx(e.clientX, e.clientY, color);
    onClose();
    onSelectAction(action);
  };

  const handleSelectTheme = (mode: 'light' | 'dark', e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, mode === 'light' ? '#f59e0b' : '#6366f1');
    playTechClickSound('tap');
    onSetThemeMode?.(mode);
  };

  const handleGalleryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingImage(true);
    try {
      const compressedDataUrl = await processGalleryImage(file);
      playTechClickSound('magic');
      onSetCustomWallpaper?.(compressedDataUrl, file.name);
    } catch (err) {
      console.error('Failed to process image from gallery:', err);
    } finally {
      setIsProcessingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Drawer Panel */}
      <aside className="absolute inset-y-0 left-0 max-w-[340px] w-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
        
        {/* Top Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                SOYO Mind
              </div>
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                A Virtual AI • Groq Powered
              </div>
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

        {/* Scrollable List of Features & Settings */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin">
          
          {/* Quick User Card / Log In Button */}
          {userProfile.isLoggedIn ? (
            <button
              onClick={(e) => handleAction('account', e, '#8b5cf6')}
              className="clickable-option w-full flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border border-slate-100 dark:border-slate-800 transition-colors text-left mb-2"
            >
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/40"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {userProfile.name}
                </div>
                <div className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{userProfile.memberTier} AI Member</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          ) : (
            <button
              onClick={(e) => handleAction('login', e, '#6366f1')}
              className="clickable-option w-full flex items-center justify-between p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all text-left mb-2.5 active:scale-[0.98]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <LogIn className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">Log In for Users</div>
                  <div className="text-[10px] text-indigo-100">Sync chats & preferences</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />
            </button>
          )}

          {/* TWO DIRECT THEME OPTIONS: LIGHT & DARK */}
          <div className="pt-1 pb-2">
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase px-3 py-1 tracking-wider">
              Screen Appearance
            </div>
            <div className="grid grid-cols-2 gap-2 px-1 pt-1">
              {/* Light Option (ChatGPT Screen) */}
              <button
                type="button"
                onClick={(e) => handleSelectTheme('light', e)}
                className={`clickable-option flex flex-col p-2.5 rounded-2xl border transition-all text-left ${
                  appearance.mode === 'light'
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-200 shadow-xs ring-2 ring-amber-400/30'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
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
                  Like ChatGPT
                </div>
              </button>

              {/* Dark Option (Whole App in Dark) */}
              <button
                type="button"
                onClick={(e) => handleSelectTheme('dark', e)}
                className={`clickable-option flex flex-col p-2.5 rounded-2xl border transition-all text-left ${
                  appearance.mode === 'dark'
                    ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 shadow-xs ring-2 ring-indigo-500/30'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
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
                  Whole App Dark
                </div>
              </button>
            </div>
          </div>

          {/* ADD THEME FROM GALLERY OPTION */}
          <div className="pt-1 pb-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleGalleryFileSelect}
            />
            <div className="flex items-center justify-between px-3 py-1 mb-1.5">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ImagePlus className="w-3.5 h-3.5 text-pink-500" />
                <span>Theme From Gallery</span>
              </span>
              {appearance.customWallpaper ? (
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  Active in Theme
                </span>
              ) : (
                <span className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold">
                  Custom Picture
                </span>
              )}
            </div>

            {appearance.customWallpaper ? (
              /* Active Gallery Theme Preview Card */
              <div className="mx-1 p-2.5 rounded-2xl border-2 border-pink-500/50 bg-pink-500/5 dark:bg-pink-950/30 flex items-center gap-3 shadow-xs">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-pink-500/40 shadow-xs relative bg-slate-900">
                  <img
                    src={appearance.customWallpaper}
                    alt="Active Gallery Theme"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1 p-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {appearance.customWallpaperName || 'Gallery Photo Theme'}
                  </div>
                  <div className="text-[10px] text-pink-600 dark:text-pink-400 font-medium">
                    Saved in AI Front Theme
                  </div>
                  <div className="flex items-center gap-2.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessingImage}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      {isProcessingImage ? 'Loading...' : 'Change Photo'}
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        triggerVisualFx(e.clientX, e.clientY, '#ef4444');
                        playTechClickSound('tap');
                        onRemoveCustomWallpaper?.();
                      }}
                      className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
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
                disabled={isProcessingImage}
                className="clickable-option w-full flex items-center justify-between p-3 rounded-2xl border border-dashed border-pink-400/80 dark:border-pink-500/60 bg-gradient-to-r from-pink-50/70 via-purple-50/50 to-indigo-50/70 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-indigo-950/20 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-all text-left group shadow-xs active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Add Theme from Gallery</span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-pink-500 text-white">
                        Photo
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isProcessingImage ? 'Loading picture...' : 'Choose any photo from gallery to save as theme'}
                    </div>
                  </div>
                </div>
                <div className="p-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 text-pink-600 dark:text-pink-400 group-hover:-translate-y-0.5 transition-transform shadow-2xs">
                  <Upload className="w-4 h-4" />
                </div>
              </button>
            )}
          </div>

          {/* 10 AI FRONT THEMES WITH COLOR NAMES */}
          <div className="pt-1 pb-3">
            <div className="flex items-center justify-between px-3 py-1 mb-1">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-500" />
                <span>AI Front Themes (10 Colors)</span>
              </span>
              <button
                type="button"
                onClick={(e) => handleAction('appearance', e, '#6366f1')}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Full Customizer
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5 px-1 max-h-56 overflow-y-auto scrollbar-thin">
              {TEN_THEMES.map((theme) => {
                const isSelected = !appearance.customWallpaper && (appearance.themeColor || 'royal-midnight-purple') === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={(e) => {
                      triggerVisualFx(e.clientX, e.clientY, theme.primaryColor);
                      playTechClickSound('tap');
                      onSelectTheme?.(theme.id);
                    }}
                    title={`${theme.name} - ${theme.tagline}`}
                    className={`clickable-option flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/70 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full shrink-0 shadow-2xs border border-black/10 dark:border-white/20"
                      style={{ background: theme.bgGradient }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold truncate text-slate-800 dark:text-slate-200 leading-tight">
                        {theme.name}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate capitalize">
                        {theme.mode} Mode
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase px-3 py-1 tracking-wider">
            Conversations & Tools
          </div>

          {/* 1. Languages (100+ World Languages) */}
          <button
            onClick={(e) => handleAction('languages', e, '#06b6d4')}
            className="clickable-option w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{t.languages}</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <span>{currentLanguageFlag}</span>
              <span className="truncate max-w-[70px]">{currentLanguageName}</span>
            </span>
          </button>

          {/* 2. New Chat */}
          <button
            onClick={(e) => handleAction('new-chat', e, '#6366f1')}
            className="clickable-option w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <PenSquare className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{t.newChat}</span>
            </div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">New</span>
          </button>

          {/* 3. Chat History */}
          <button
            onClick={(e) => handleAction('history', e, '#a855f7')}
            className="clickable-option w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{t.chatHistory}</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
              {chatCount}
            </span>
          </button>

          {/* 4. Delete Chat */}
          <button
            onClick={(e) => handleAction('delete-chat', e, '#ef4444')}
            className="clickable-option w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{t.deleteChat}</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          {/* 5. Share Chat */}
          <button
            onClick={(e) => handleAction('share-chat', e, '#3b82f6')}
            className="clickable-option w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{t.shareChat}</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">PDF • Image</span>
          </button>

          {/* 6. Share App */}
          <button
            onClick={(e) => handleAction('share-app', e, '#ec4899')}
            className="clickable-option w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                <ExternalLink className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{t.shareApp}</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase px-3 pt-3 pb-1 tracking-wider">
            AI Vision & Creativity
          </div>

          {/* 7. Edit & Enhance Photo */}
          <button
            onClick={(e) => handleAction('photo-studio', e, '#8b5cf6')}
            className="clickable-option w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{t.editEnhancePhoto}</span>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Studio</span>
          </button>

          {/* 8. AI Camera (Vision Mode) */}
          <button
            onClick={(e) => handleAction('vision-camera', e, '#10b981')}
            className="clickable-option w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{t.aiCamera}</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">OCR / Live</span>
          </button>

          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase px-3 pt-3 pb-1 tracking-wider">
            Preferences & Settings
          </div>

          {/* Groq API Key (.env.local) */}
          <button
            onClick={(e) => handleAction('api-key', e, '#eab308')}
            className="clickable-option w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium">Groq API Key</span>
                <span className="text-[10px] text-slate-400">.env.local setup</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
              Active
            </span>
          </button>

          {/* 9. Appearance Customizer */}
          <button
            onClick={(e) => handleAction('appearance', e, '#6366f1')}
            className="clickable-option w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Palette className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{t.appearance}</span>
            </div>
            <span className="text-xs text-slate-400 capitalize">{appearance.mode}</span>
          </button>

          {/* 10. Voice Settings */}
          <button
            onClick={(e) => handleAction('voice-settings', e, '#8b5cf6')}
            className="clickable-option w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{t.voiceSettings}</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          {/* 11. Account / Profile */}
          <button
            onClick={(e) => handleAction('account', e, '#3b82f6')}
            className="clickable-option w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{t.accountProfile}</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          {/* 12. Privacy & Data */}
          <button
            onClick={(e) => handleAction('privacy', e, '#10b981')}
            className="clickable-option w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{t.privacyData}</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          {/* 13. Notifications */}
          <button
            onClick={(e) => handleAction('notifications', e, '#f59e0b')}
            className="clickable-option w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-950/60 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{t.notifications}</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          {/* 14. About & Help */}
          <button
            onClick={(e) => handleAction('about', e, '#6366f1')}
            className="clickable-option w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{t.aboutHelp}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">v4.0.0</span>
          </button>

          {/* 15. Log In / Logout Button */}
          {userProfile.isLoggedIn ? (
            <button
              onClick={(e) => handleAction('logout', e, '#ef4444')}
              className="clickable-option w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{t.logout}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
          ) : (
            <button
              onClick={(e) => handleAction('login', e, '#6366f1')}
              className="clickable-option w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                  <LogIn className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold">Log In</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
          )}

        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            SOYO Mind VAI • Groq Llama 3.1
          </p>
        </div>
      </aside>
    </div>
  );
};
