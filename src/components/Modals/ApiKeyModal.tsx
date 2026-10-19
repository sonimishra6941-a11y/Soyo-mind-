import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Check,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  Sparkles,
  Zap,
  ShieldCheck,
  ClipboardPaste,
  Lock,
} from 'lucide-react';
import { triggerVisualFx } from '../../utils/visualFx';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeyUpdated }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [status, setStatus] = useState<{
    provider?: string;
    hasKey: boolean;
    source: string;
    isPlaceholder: boolean;
    hasLocalFile: boolean;
    maskedKey: string | null;
  }>({
    hasKey: false,
    source: 'none',
    isPlaceholder: true,
    hasLocalFile: true,
    maskedKey: null,
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    text?: string;
    model?: string;
    error?: string;
    latencyMs?: number;
  } | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/key/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to load key status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestKey = async () => {
    setIsTesting(true);
    setTestResult(null);
    const start = performance.now();
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'What is 7+3?' }),
      });
      const elapsed = Math.round(performance.now() - start);
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          text: data.text || data.response,
          model: data.model,
          latencyMs: elapsed,
        });
      } else {
        setTestResult({
          success: false,
          error: data.details || data.error || 'Failed to get answer from Groq.',
          latencyMs: elapsed,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || 'Network error reaching /api/chat',
        latencyMs: Math.round(performance.now() - start),
      });
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setSaveSuccess(false);
      setTestResult(null);
    }
  }, [isOpen]);

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setApiKeyInput(text.trim());
        }
      }
    } catch {
      // Clipboard access blocked by browser permission
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#6366f1');
    if (!apiKeyInput.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/key/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyInput.trim() }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setApiKeyInput('');
        await fetchStatus();
        onKeyUpdated?.();
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Failed saving key:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/65 dark:bg-black/80 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Groq API Key Secret Box</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800">
                  Llama 3.1
                </span>
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Encrypted & stored in <code className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-amber-600 dark:text-amber-400">.env.local</code> (GROQ_API_KEY)
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              triggerVisualFx(e.clientX, e.clientY, '#ef4444');
              onClose();
            }}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-4">
          {/* Current Status Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status:</span>
                {status.hasKey ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    Groq Active & Connected ({status.source})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Groq Key Required
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {status.hasKey
                  ? `Active Groq key detected (${status.maskedKey || 'Configured'}). SOYO Mind generates high-speed responses with Llama 3.1 on Groq.`
                  : `Paste your Groq API key (starts with gsk_...) below. It will be stored secretly in .env.local on the server.`}
              </p>
            </div>
            <button
              onClick={fetchStatus}
              disabled={isLoading}
              title="Refresh connection status"
              className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>

          {/* Test AI Live Response (7+3) button */}
          <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/50 flex items-center justify-between gap-3">
            <div className="text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Verify AI Inference (7+3):
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Tests /api/chat with live Groq server
              </span>
            </div>
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting || !status.hasKey}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test Now (7+3)</span>
                </>
              )}
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-2xl border text-xs leading-relaxed animate-in fade-in ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold mb-1">
                <span>{testResult.success ? 'Groq Test Succeeded!' : 'Groq Test Failed'}</span>
                {testResult.latencyMs && (
                  <span className="text-[10px] opacity-75 font-mono">{testResult.latencyMs}ms</span>
                )}
              </div>
              {testResult.model && (
                <div className="text-[10px] font-mono opacity-80 mb-1">Model: {testResult.model}</div>
              )}
              <div className="text-xs whitespace-pre-wrap font-sans">
                {testResult.success ? testResult.text : testResult.error}
              </div>
            </div>
          )}

          {/* Dedicated Secret Input Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10 border-2 border-amber-500/30 dark:border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Secret Groq API Key Input Box:</span>
              </label>
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-500" />
                <span>Masked for privacy</span>
              </span>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="gsk_... (Paste your Groq API key here)"
                autoComplete="off"
                spellCheck="false"
                className="w-full px-4 py-3.5 pr-24 rounded-2xl border border-amber-200 dark:border-amber-900 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 font-mono text-sm shadow-inner focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  title="Paste from clipboard"
                  className="px-2 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded-lg border border-amber-200/60 dark:border-amber-800/50 flex items-center gap-1 transition-colors"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span>Paste</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  title={showKey ? 'Hide key' : 'Show key'}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 stroke-[2.5] text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Successfully saved Groq key to .env.local! SOYO Mind VAI is live.</span>
              </div>
            )}

            {/* Save Button */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={isSaving || !apiKeyInput.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/25 hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:active:scale-100 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Secretly...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Key to .env.local</span>
                  </>
                )}
              </button>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
              >
                <span>Groq Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Guide on Groq Keys */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Where to Add Your Groq Secret Key:
            </span>

            {/* Way 1: In the box above */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                1
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  In this Secret Box:
                </span>
                <p className="text-slate-500 dark:text-slate-400">
                  Paste your Groq key into the box above and click <span className="font-semibold text-amber-600 dark:text-amber-400">Save Key</span>. It writes secretly to <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">.env.local</code>.
                </p>
              </div>
            </div>

            {/* Way 2: In Secrets Panel */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                2
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  In AI Studio Secrets Panel:
                </span>
                <p className="text-slate-500 dark:text-slate-400">
                  Add secret variable name <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">GROQ_API_KEY</code> with value <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">gsk_...</code>.
                </p>
              </div>
            </div>

            {/* Way 3: Directly in .env.local file */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                3
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Directly in file <code className="font-mono text-emerald-600 dark:text-emerald-400">.env.local</code>:
                </span>
                <div className="mt-1 p-2 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] select-all">
                  <code>GROQ_API_KEY=gsk_...</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ApiKeyModal;
