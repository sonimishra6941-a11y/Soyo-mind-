import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { TranslationKeys } from '../../types';
import { triggerVisualFx } from '../../utils/visualFx';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  t: TranslationKeys;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true,
  t,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 text-center overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Warning Icon */}
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
            isDestructive
              ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400'
              : 'bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400'
          }`}
        >
          {isDestructive ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
        </div>

        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          {title || t.confirmDeleteTitle}
        </h3>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2">
          {description}
        </p>

        {/* Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              triggerVisualFx(e.clientX, e.clientY, '#94a3b8');
              onClose();
            }}
            className="clickable-option py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {cancelLabel || t.cancel}
          </button>

          <button
            type="button"
            onClick={(e) => {
              triggerVisualFx(e.clientX, e.clientY, isDestructive ? '#ef4444' : '#6366f1');
              onConfirm();
              onClose();
            }}
            className={`clickable-option py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-colors ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
            }`}
          >
            {confirmLabel || t.confirm}
          </button>
        </div>

      </div>
    </div>
  );
};
