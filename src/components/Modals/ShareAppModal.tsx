import React, { useState } from 'react';
import { X, Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { TranslationKeys } from '../../types';
import { triggerVisualFx } from '../../utils/visualFx';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationKeys;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose, t }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://soyo-mind.ai';
  const shareMessage = encodeURIComponent(
    `Experience SOYO Mind - A Virtual Artificial Intelligence (VAI) with intelligent conversation, live AI vision camera, photo enhancement studio, and 100+ languages! Try it now: ${appUrl}`
  );

  const handleCopyLink = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#10b981');
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-emerald-500',
      url: `https://api.whatsapp.com/send?text=${shareMessage}`,
    },
    {
      name: 'Twitter (X)',
      icon: '𝕏',
      color: 'bg-slate-900',
      url: `https://twitter.com/intent/tweet?text=${shareMessage}`,
    },
    {
      name: 'Facebook',
      icon: 'f',
      color: 'bg-blue-600',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`,
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-sky-500',
      url: `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${shareMessage}`,
    },
    {
      name: 'Instagram',
      icon: '📷',
      color: 'bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600',
      url: `https://www.instagram.com/`,
    },
    {
      name: 'YouTube',
      icon: '▶️',
      color: 'bg-red-600',
      url: `https://www.youtube.com/`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950/70 text-pink-600 dark:text-pink-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.shareApp}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share SOYO Mind VAI with friends
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

        {/* Copy Link Bar */}
        <div className="mt-4 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between gap-2 border border-slate-200/80 dark:border-slate-700">
          <span className="text-xs text-slate-600 dark:text-slate-300 truncate font-mono pl-1">
            {appUrl}
          </span>
          <button
            onClick={handleCopyLink}
            className="clickable-option shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Social Platforms Grid */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {platforms.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => triggerVisualFx(e.clientX, e.clientY, '#ec4899')}
              className="clickable-option flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-pink-500/50 hover:bg-pink-50/50 dark:hover:bg-pink-950/30 transition-all text-center group"
            >
              <div
                className={`w-10 h-10 rounded-2xl ${p.color} text-white font-bold flex items-center justify-center text-base shadow-sm group-hover:scale-105 transition-transform`}
              >
                {p.icon}
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                {p.name}
              </span>
            </a>
          ))}
        </div>

      </div>
    </div>
  );
};
