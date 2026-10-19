import React, { useState, useEffect } from 'react';
import { X, Volume2, Play, Square, Check } from 'lucide-react';
import { VoiceSettings, TranslationKeys } from '../../types';
import { speechService } from '../../services/speech';
import { triggerVisualFx } from '../../utils/visualFx';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceSettings: VoiceSettings;
  onChangeVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  t: TranslationKeys;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  voiceSettings,
  onChangeVoiceSettings,
  t,
}) => {
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        setVoices(speechService.getVoices());
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  if (!isOpen) return null;

  const handleTestVoice = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#8b5cf6');
    if (isPlayingTest) {
      speechService.stopSpeaking();
      setIsPlayingTest(false);
    } else {
      setIsPlayingTest(true);
      const sampleText =
        voiceSettings.voiceGender === 'female'
          ? "Hello, I am SOYO Mind VAI, your virtual artificial intelligence assistant. How may I assist you?"
          : "Greetings! I am SOYO Mind VAI, your hyper-intelligent AI assistant ready to solve any task.";

      speechService.speak(
        sampleText,
        voiceSettings.speed,
        voiceSettings.pitch,
        voiceSettings.voiceIndex,
        () => setIsPlayingTest(false)
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.voiceSettings}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speech synthesis & voice persona
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              triggerVisualFx(e.clientX, e.clientY, '#94a3b8');
              speechService.stopSpeaking();
              onClose();
            }}
            className="clickable-option p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* 1. Voice Gender Selection */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              {t.voiceGender}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={(e) => {
                  triggerVisualFx(e.clientX, e.clientY, '#ec4899');
                  onChangeVoiceSettings({ voiceGender: 'female' });
                }}
                className={`clickable-option flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  voiceSettings.voiceGender === 'female'
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🌸</span>
                  <span>{t.female}</span>
                </div>
                {voiceSettings.voiceGender === 'female' && <Check className="w-4 h-4 text-indigo-600" />}
              </button>

              <button
                onClick={(e) => {
                  triggerVisualFx(e.clientX, e.clientY, '#3b82f6');
                  onChangeVoiceSettings({ voiceGender: 'male' });
                }}
                className={`clickable-option flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  voiceSettings.voiceGender === 'male'
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>{t.male}</span>
                </div>
                {voiceSettings.voiceGender === 'male' && <Check className="w-4 h-4 text-indigo-600" />}
              </button>
            </div>
          </div>

          {/* 2. Specific Engine Voice Selection */}
          {voices.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Installed Synthesizer Voice
              </label>
              <select
                value={voiceSettings.voiceIndex}
                onChange={(e) => onChangeVoiceSettings({ voiceIndex: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value={-1}>System Default Voice</option>
                {voices.map((v, i) => (
                  <option key={i} value={i}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 3. Voice Speed Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              <span>{t.voiceSpeed}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                {voiceSettings.speed}x
              </span>
            </div>
            <input
              type="range"
              min={0.75}
              max={1.5}
              step={0.05}
              value={voiceSettings.speed}
              onChange={(e) => onChangeVoiceSettings({ speed: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>0.75x (Relaxed)</span>
              <span>1.0x (Normal)</span>
              <span>1.5x (Fast)</span>
            </div>
          </div>

          {/* 4. Auto-Read Responses Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t.autoRead}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Automatically speak assistant answers
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                triggerVisualFx(e.clientX, e.clientY, '#10b981');
                onChangeVoiceSettings({ autoReadResponses: !voiceSettings.autoReadResponses });
              }}
              className={`clickable-option relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                voiceSettings.autoReadResponses ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  voiceSettings.autoReadResponses ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Test Voice Button */}
          <div className="pt-2">
            <button
              onClick={handleTestVoice}
              className="clickable-option w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-colors"
            >
              {isPlayingTest ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Stop Voice Preview</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Test Voice Sample</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
