import React, { useState, useRef } from 'react';
import { X, User, Mail, Shield, Check, Camera, Sparkles } from 'lucide-react';
import { UserProfile, TranslationKeys } from '../../types';
import { triggerVisualFx } from '../../utils/visualFx';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  t: TranslationKeys;
  totalChatsCount: number;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  t,
  totalChatsCount,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [savedToast, setSavedToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#10b981');
    onUpdateProfile({ name, email, isLoggedIn: true });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onUpdateProfile({ avatar: ev.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.accountProfile}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                User profile & membership
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

        <div className="mt-4 space-y-4">
          {/* Avatar & Badge */}
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/30 shadow-md"
              />
              <button
                onClick={(e) => {
                  triggerVisualFx(e.clientX, e.clientY, '#6366f1');
                  fileInputRef.current?.click();
                }}
                className="clickable-option absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-colors"
                title="Change Avatar"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200/50 dark:border-indigo-800/40">
              <Sparkles className="w-3 h-3" />
              <span>{t.proMember}</span>
            </div>

            {/* Quick avatar choices */}
            <div className="mt-3 flex items-center gap-2">
              {PRESET_AVATARS.map((avUrl, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    triggerVisualFx(e.clientX, e.clientY, '#8b5cf6');
                    onUpdateProfile({ avatar: avUrl });
                  }}
                  className={`clickable-option w-8 h-8 rounded-full overflow-hidden border-2 transition-transform ${
                    userProfile.avatar === avUrl ? 'border-indigo-600 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={avUrl} alt="Avatar" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* User Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {totalChatsCount}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Conversations
              </div>
            </div>
            <div>
              <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                Unlimited
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">
                AI Reasoning
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-1">
            <button
              onClick={handleSave}
              className="clickable-option w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-colors"
            >
              {savedToast ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Profile Saved!</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
