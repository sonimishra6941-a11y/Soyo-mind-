import React from 'react';
import { Menu, PenSquare, Sparkles, Key, Mic, LogIn, User } from 'lucide-react';
import { triggerVisualFx, playTechClickSound } from '../utils/visualFx';
import { UserProfile } from '../types';

interface HeaderProps {
  onOpenDrawer: () => void;
  onNewChat: () => void;
  onOpenApiKey?: () => void;
  onOpenVoiceChat?: () => void;
  onOpenLogin?: () => void;
  userProfile?: UserProfile;
  hasApiKey?: boolean;
  currentLanguageFlag?: string;
  isStreaming?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDrawer,
  onNewChat,
  onOpenApiKey,
  onOpenVoiceChat,
  onOpenLogin,
  userProfile,
  hasApiKey = false,
  currentLanguageFlag = '🇺🇸',
  isStreaming = false,
}) => {
  const handleMenuClick = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#6366f1');
    onOpenDrawer();
  };

  const handleNewChatClick = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#a855f7');
    onNewChat();
  };

  const handleKeyClick = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#eab308');
    onOpenApiKey?.();
  };

  const handleVoiceChatClick = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#10b981');
    playTechClickSound('magic');
    onOpenVoiceChat?.();
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#6366f1');
    playTechClickSound('tap');
    onOpenLogin?.();
  };

  const isLoggedIn = userProfile?.isLoggedIn;

  return (
    <header className="relative z-30 flex items-center justify-between px-3 md:px-5 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/80 shadow-xs transition-colors duration-200">
      {/* Top Left: Hamburger Menu Icon */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleMenuClick}
          aria-label="Open Settings and Menu"
          className="clickable-option relative p-2.5 rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all duration-200 focus:outline-hidden"
        >
          <Menu className="w-5.5 h-5.5 stroke-[2.2]" />
        </button>

        {/* Brand Identity */}
        <div className="flex items-center gap-2 select-none">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-md shadow-indigo-500/20 text-white shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
            {isStreaming && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm md:text-base tracking-tight text-slate-900 dark:text-white">
                SOYO Mind
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40">
                Groq AI
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>{currentLanguageFlag}</span>
              <span>Virtual AI Assistant</span>
            </span>
          </div>
        </div>
      </div>

      {/* Top Right Controls: Online Voice Chat + Log In Button + Groq Key + New Chat */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* ONLINE VOICE CHAT OPTION */}
        <button
          onClick={handleVoiceChatClick}
          aria-label="Online Voice Chat"
          title="Start Online Voice Chat with SOYO Mind"
          className="clickable-option relative flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 hover:from-emerald-500/20 hover:to-indigo-500/20 dark:from-emerald-950/40 dark:to-indigo-950/40 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-xs hover:shadow-sm active:scale-95 transition-all duration-200 group"
        >
          <div className="relative flex items-center justify-center">
            <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-xs font-bold whitespace-nowrap">
            Voice Chat
          </span>
          <span className="hidden lg:inline text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500 text-white uppercase tracking-wider">
            Online
          </span>
        </button>

        {/* LOG IN BUTTON FOR USERS */}
        {onOpenLogin && (
          <button
            onClick={handleLoginClick}
            aria-label={isLoggedIn ? 'Account Profile' : 'Log In'}
            title={isLoggedIn ? `Logged in as ${userProfile?.name}` : 'Log In to SOYO Mind'}
            className={`clickable-option relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl transition-all duration-200 active:scale-95 ${
              isLoggedIn
                ? 'border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/70 shadow-xs'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 border border-indigo-500/50'
            }`}
          >
            {isLoggedIn && userProfile?.avatar ? (
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-4.5 h-4.5 rounded-full object-cover ring-1 ring-indigo-400"
              />
            ) : (
              <LogIn className="w-4 h-4 text-white" />
            )}
            <span className="text-xs font-bold whitespace-nowrap">
              {isLoggedIn ? (userProfile?.name?.split(' ')[0] || 'Profile') : 'Log In'}
            </span>
            {isLoggedIn && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            )}
          </button>
        )}

        {/* GROQ API KEY STATUS BUTTON */}
        {onOpenApiKey && (
          <button
            onClick={handleKeyClick}
            aria-label="Add Groq API Key"
            title={hasApiKey ? "Groq API Key: Active & Connected" : "Click to open Secret Box and configure Groq API Key"}
            className={`clickable-option relative hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border transition-all duration-200 focus:outline-hidden active:scale-95 ${
              hasApiKey
                ? 'border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/80'
                : 'border-amber-300 dark:border-amber-600/80 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 hover:bg-amber-100 shadow-xs'
            }`}
          >
            <Key className={`w-3.5 h-3.5 ${hasApiKey ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400 animate-pulse'}`} />
            <span className="text-xs font-bold">
              {hasApiKey ? 'Groq Active' : 'Add Key'}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${hasApiKey ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </button>
        )}

        {/* NEW CHAT BUTTON */}
        <button
          onClick={handleNewChatClick}
          aria-label="Start New Chat"
          title="Start New Chat"
          className="clickable-option relative p-2.5 rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all duration-200 focus:outline-hidden group"
        >
          <PenSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-200" />
        </button>
      </div>
    </header>
  );
};
