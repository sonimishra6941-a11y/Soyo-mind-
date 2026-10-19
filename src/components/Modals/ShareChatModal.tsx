import React, { useState } from 'react';
import {
  X,
  Share2,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Copy,
  Check,
  Send,
  Mail,
  Download,
} from 'lucide-react';
import { ChatSession, TranslationKeys } from '../../types';
import { exportChatAsText, exportChatAsPdf, exportChatAsImage } from '../../services/exportChat';
import { triggerVisualFx } from '../../utils/visualFx';

interface ShareChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ChatSession;
  t: TranslationKeys;
}

export const ShareChatModal: React.FC<ShareChatModalProps> = ({
  isOpen,
  onClose,
  session,
  t,
}) => {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyChatText = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#10b981');
    const text = session.messages
      .map((m) => `${m.role === 'user' ? 'You' : 'SOYO Mind VAI'}:\n${m.content}\n`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportText = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#6366f1');
    exportChatAsText(session);
  };

  const handleExportPdf = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#ec4899');
    setExporting('pdf');
    setTimeout(() => {
      exportChatAsPdf(session);
      setExporting(null);
    }, 200);
  };

  const handleExportImage = async (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#8b5cf6');
    setExporting('image');
    await exportChatAsImage(session);
    setExporting(null);
  };

  const shareTextSummary = encodeURIComponent(
    `Check out this conversation with SOYO Mind VAI: "${session.title}"\n\n${session.messages[0]?.content || ''}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.shareChat}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                {session.title}
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

        {/* Export Formats */}
        <div className="p-5 space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Export File Formats
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* 1. Text */}
            <button
              onClick={handleExportText}
              className="clickable-option flex flex-col items-center justify-center p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Text File</span>
              <span className="text-[10px] text-slate-400 mt-0.5">.txt</span>
            </button>

            {/* 2. PDF */}
            <button
              onClick={handleExportPdf}
              disabled={exporting === 'pdf'}
              className="clickable-option flex flex-col items-center justify-center p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-pink-500 dark:hover:border-pink-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-pink-50/50 dark:hover:bg-pink-950/40 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-2">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">PDF Doc</span>
              <span className="text-[10px] text-slate-400 mt-0.5">.pdf</span>
            </button>

            {/* 3. Image */}
            <button
              onClick={handleExportImage}
              disabled={exporting === 'image'}
              className="clickable-option flex flex-col items-center justify-center p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50/50 dark:hover:bg-purple-950/40 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
                <ImageIcon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Image Card</span>
              <span className="text-[10px] text-slate-400 mt-0.5">.png</span>
            </button>
          </div>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">
            Instant Social & App Sharing
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${shareTextSummary}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => triggerVisualFx(e.clientX, e.clientY, '#22c55e')}
              className="clickable-option flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors text-slate-700 dark:text-slate-200 text-xs font-semibold"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                💬
              </div>
              <span>WhatsApp</span>
            </a>

            {/* Telegram */}
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${shareTextSummary}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => triggerVisualFx(e.clientX, e.clientY, '#0284c7')}
              className="clickable-option flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-colors text-slate-700 dark:text-slate-200 text-xs font-semibold"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center">
                <Send className="w-3.5 h-3.5" />
              </div>
              <span>Telegram</span>
            </a>

            {/* Email */}
            <a
              href={`mailto:?subject=${encodeURIComponent(`SOYO Mind Conversation: ${session.title}`)}&body=${shareTextSummary}`}
              onClick={(e) => triggerVisualFx(e.clientX, e.clientY, '#6366f1')}
              className="clickable-option flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors text-slate-700 dark:text-slate-200 text-xs font-semibold"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <span>Email</span>
            </a>

            {/* Copy All */}
            <button
              onClick={handleCopyChatText}
              className="clickable-option flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 text-xs font-semibold"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-600 text-white flex items-center justify-center">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              </div>
              <span>{copied ? 'Copied!' : 'Copy Formatted'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
