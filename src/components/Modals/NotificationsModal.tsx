import React, { useState } from 'react';
import { X, Bell, Volume2, Sparkles, Check } from 'lucide-react';
import { TranslationKeys } from '../../types';
import { triggerVisualFx } from '../../utils/visualFx';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationKeys;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose, t }) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [dailyTips, setDailyTips] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const handleTestNotification = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#f59e0b');
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-yellow-100 dark:bg-yellow-950/70 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.notifications}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Push alerts & sound notifications
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

        <div className="mt-4 space-y-3">
          {/* 1. Push Notifications Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Push Notifications
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Receive instant AI response alerts
              </div>
            </div>
            <button
              onClick={(e) => {
                triggerVisualFx(e.clientX, e.clientY, '#f59e0b');
                setPushEnabled((prev) => !prev);
              }}
              className={`clickable-option relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                pushEnabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  pushEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. Daily Smart AI Tips */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Daily AI Insights & Tips</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Productivity prompts & world intelligence
              </div>
            </div>
            <button
              onClick={(e) => {
                triggerVisualFx(e.clientX, e.clientY, '#f59e0b');
                setDailyTips((prev) => !prev);
              }}
              className={`clickable-option relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                dailyTips ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  dailyTips ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Audio Chime Alerts */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Sound Chime on Response</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Play subtle ambient cue when answer finishes
              </div>
            </div>
            <button
              onClick={(e) => {
                triggerVisualFx(e.clientX, e.clientY, '#6366f1');
                setSoundAlerts((prev) => !prev);
              }}
              className={`clickable-option relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                soundAlerts ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  soundAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Test Notification Banner */}
          {testSent && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Notification sent! "SOYO Mind VAI is active and ready."</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleTestNotification}
              className="clickable-option w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              Send Test Notification
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
