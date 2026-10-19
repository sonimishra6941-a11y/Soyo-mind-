import React, { useState } from 'react';
import { X, ShieldCheck, Trash2, Download, Check, FileText } from 'lucide-react';
import { TranslationKeys, ChatSession } from '../../types';
import { triggerVisualFx } from '../../utils/visualFx';

interface PrivacyDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearCache: () => void;
  sessions: ChatSession[];
  t: TranslationKeys;
}

export const PrivacyDataModal: React.FC<PrivacyDataModalProps> = ({
  isOpen,
  onClose,
  onClearCache,
  sessions,
  t,
}) => {
  const [activeTab, setActiveTab] = useState<'manage' | 'policy'>('manage');
  const [cacheCleared, setCacheCleared] = useState(false);

  if (!isOpen) return null;

  const handleClearCacheClick = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#ef4444');
    onClearCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  const handleExportAllData = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#10b981');
    const backupData = {
      app: 'SOYO Mind - A Virtual Artificial Intelligence',
      version: '3.2.0',
      exportedAt: new Date().toISOString(),
      sessions,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOYO_Mind_Data_Backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.privacyData}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data sovereignty & storage controls
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

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'manage' ? 'bg-white dark:bg-slate-900 shadow-xs text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
            }`}
          >
            Manage Data & Cache
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'policy' ? 'bg-white dark:bg-slate-900 shadow-xs text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
            }`}
          >
            Privacy Policy
          </button>
        </div>

        {activeTab === 'manage' ? (
          <div className="mt-4 space-y-4">
            {/* Storage Usage Overview */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Local Browser Storage</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">Encrypted & Private</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Your conversations, voice settings, and custom preferences are stored locally on your device.
              </p>
            </div>

            {/* Clear Cache Action */}
            <div className="p-3.5 rounded-2xl border border-rose-200/70 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-rose-700 dark:text-rose-300">
                  {t.clearCache}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Free up memory & clear temporary cache
                </div>
              </div>
              <button
                onClick={handleClearCacheClick}
                className="clickable-option flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                {cacheCleared ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Cleared!</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Export All Data Backup */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Export Complete Backup
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Download all chats and session histories (.json)
                </div>
              </div>
              <button
                onClick={handleExportAllData}
                className="clickable-option flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-semibold transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 max-h-60 overflow-y-auto p-3 text-xs text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed bg-slate-50 dark:bg-slate-800/40 rounded-2xl scrollbar-thin">
            <h4 className="font-bold text-slate-900 dark:text-white">1. Data Ownership</h4>
            <p>
              SOYO Mind VAI guarantees that your conversations and personal files belong strictly to you. We do not sell your personal data or photos.
            </p>
            <h4 className="font-bold text-slate-900 dark:text-white">2. AI Processing</h4>
            <p>
              Camera images, voice audio, and queries processed via Groq AI are transmitted using encrypted SSL protocols solely to generate your answers in real time.
            </p>
            <h4 className="font-bold text-slate-900 dark:text-white">3. Local Storage</h4>
            <p>
              Chat history and settings remain safely saved inside your device's browser memory until you choose to delete them.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
