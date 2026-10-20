import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  Play,
  Square,
  Check,
  Sparkles,
  Bot,
  Sliders,
  Shield,
  Radio,
} from 'lucide-react';
import { VoiceSettings, TranslationKeys } from '../../types';
import { speechService } from '../../services/speech';
import { triggerVisualFx } from '../../utils/visualFx';
import { TEN_VOICE_PROFILES, VoiceToneId, VoiceToneProfile } from '../../data/voiceTones';

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
  const [playingToneId, setPlayingToneId] = useState<string | null>(null);
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

  const currentGender = voiceSettings.voiceGender || 'male';
  const currentPitch = voiceSettings.pitch !== undefined ? voiceSettings.pitch : 0.88;
  const currentSpeed = voiceSettings.speed !== undefined ? voiceSettings.speed : 1.02;
  const selectedToneId: VoiceToneId = voiceSettings.voiceTone || 'jarvis-deep';

  // Active tone profile
  const activeProfile =
    TEN_VOICE_PROFILES.find((p) => p.id === selectedToneId) || TEN_VOICE_PROFILES[0];

  // Handler to select and preview a tone
  const handleSelectTone = (profile: VoiceToneProfile, e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, profile.themeColor);
    onChangeVoiceSettings({
      voiceTone: profile.id,
      voiceGender: profile.gender,
      pitch: profile.pitch,
      speed: profile.speed,
      preset: profile.id === 'jarvis-deep' ? 'jarvis' : 'custom',
    });
  };

  const handlePlayToneSample = (profile: VoiceToneProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerVisualFx(e.clientX, e.clientY, profile.themeColor);

    if (playingToneId === profile.id) {
      speechService.stopSpeaking();
      setPlayingToneId(null);
      return;
    }

    setPlayingToneId(profile.id);

    speechService.speak(
      profile.previewSample,
      {
        speed: profile.speed,
        pitch: profile.pitch,
        voiceIndex: voiceSettings.voiceIndex,
        voiceGender: profile.gender,
        voiceName: voiceSettings.voiceName,
        voiceTone: profile.id,
        onEnd: () => setPlayingToneId(null),
      }
    );
  };

  const handleTestActiveVoice = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#6366f1');
    if (playingToneId === 'active') {
      speechService.stopSpeaking();
      setPlayingToneId(null);
    } else {
      setPlayingToneId('active');
      speechService.speak(
        activeProfile.previewSample,
        {
          speed: currentSpeed,
          pitch: currentPitch,
          voiceIndex: voiceSettings.voiceIndex,
          voiceGender: currentGender,
          voiceName: voiceSettings.voiceName,
          voiceTone: selectedToneId,
          onEnd: () => setPlayingToneId(null),
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[94vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.voiceSettings || 'Voice Personality & Tone'}
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  10 Expressive Voices
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select from 10 distinct vocal emotional tones (named in 4 words)
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

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          
          {/* Active Voice Summary Banner */}
          <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{activeProfile.emoji}</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-extrabold text-white">
                      {activeProfile.name}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-white/10 text-cyan-300 border border-white/10">
                      {activeProfile.emotion}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {activeProfile.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-cyan-200/90 font-mono">
                    <span>Gender: <strong className="text-white capitalize">{currentGender}</strong></span>
                    <span>•</span>
                    <span>Pitch: <strong className="text-white">{currentPitch.toFixed(2)}x</strong></span>
                    <span>•</span>
                    <span>Speed: <strong className="text-white">{currentSpeed.toFixed(2)}x</strong></span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestActiveVoice}
                className="clickable-option shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md transition-all"
              >
                {playingToneId === 'active' ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Test Tone</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 10 Voice Types Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>10 Expressive Voice Personalities</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Tap to select • Play button to audition
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TEN_VOICE_PROFILES.map((profile) => {
                const isSelected = selectedToneId === profile.id;
                const isPlayingThis = playingToneId === profile.id;

                return (
                  <div
                    key={profile.id}
                    onClick={(e) => handleSelectTone(profile, e)}
                    className={`clickable-option group relative flex flex-col justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    {/* Top Row: Emoji + 4-Word Title + Play Button */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl shrink-0 mt-0.5">{profile.emoji}</span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                              {profile.name}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            )}
                          </div>
                          <span
                            className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-md"
                            style={{
                              backgroundColor: `${profile.themeColor}18`,
                              color: profile.themeColor,
                            }}
                          >
                            {profile.emotion} • {profile.badge}
                          </span>
                        </div>
                      </div>

                      {/* Audition Button */}
                      <button
                        type="button"
                        onClick={(e) => handlePlayToneSample(profile, e)}
                        title={`Audition ${profile.name}`}
                        className={`clickable-option p-2 rounded-xl shrink-0 transition-colors ${
                          isPlayingThis
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-600 shadow-2xs'
                        }`}
                      >
                        {isPlayingThis ? (
                          <Square className="w-3.5 h-3.5 fill-white" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                      </button>
                    </div>

                    {/* Description & Sample snippet */}
                    <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      "{profile.previewSample}"
                    </div>

                    {/* Bottom Specs */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="capitalize">
                        Gender: <strong className="text-slate-600 dark:text-slate-300">{profile.gender}</strong>
                      </span>
                      <span className="font-mono">
                        {profile.pitch}x pitch • {profile.speed}x speed
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Synthesizer Voice Selector */}
          {voices.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                <span>Underlying Voice Engine</span>
                <span className="text-[10px] font-normal text-slate-500">
                  {voices.length} synthesized voices available
                </span>
              </label>
              <select
                value={voiceSettings.voiceName || (voiceSettings.voiceIndex >= 0 ? voiceSettings.voiceIndex : -1)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '-1') {
                    onChangeVoiceSettings({ voiceIndex: -1, voiceName: '' });
                  } else {
                    const foundVoice = voices.find((v) => v.name === val);
                    const idx = foundVoice ? voices.indexOf(foundVoice) : Number(val);
                    onChangeVoiceSettings({
                      voiceIndex: idx,
                      voiceName: foundVoice ? foundVoice.name : '',
                    });
                  }
                }}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden font-medium"
              >
                <option value="-1">
                  ⚡ Auto-Match Best Engine for Tone (Recommended)
                </option>
                {voices.map((v, i) => {
                  const isMale = speechService.isMaleVoice(v);
                  const isJarvis = speechService.isJarvisCandidate(v);
                  const tag = isJarvis ? '⚡ [Jarvis AI]' : isMale ? '🎙️ [Male]' : '🌸 [Female]';
                  return (
                    <option key={i} value={v.name}>
                      {tag} {v.name} ({v.lang})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Fine-Tuning Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pitch Depth Slider */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                  Vocal Pitch Depth
                </span>
                <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold text-[11px]">
                  {currentPitch.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min={0.65}
                max={1.30}
                step={0.02}
                value={currentPitch}
                onChange={(e) => {
                  onChangeVoiceSettings({ pitch: parseFloat(e.target.value) });
                }}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.65x (Deep Bass)</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-semibold">0.88x (Jarvis)</span>
                <span>1.30x (High)</span>
              </div>
            </div>

            {/* Cadence Speed Slider */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Cadence & Speed
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold text-[11px]">
                  {currentSpeed.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min={0.75}
                max={1.5}
                step={0.05}
                value={currentSpeed}
                onChange={(e) => {
                  onChangeVoiceSettings({ speed: parseFloat(e.target.value) });
                }}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.75x (Relaxed)</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">1.02x (Standard)</span>
                <span>1.50x (Fast)</span>
              </div>
            </div>
          </div>

          {/* Auto-Read Responses Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>{t.autoRead || 'Auto-Read Responses Aloud'}</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Automatically speak responses aloud with "{activeProfile.name}"
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

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Selected: <strong className="text-slate-800 dark:text-slate-200">{activeProfile.name}</strong>
          </div>
          <button
            onClick={(e) => {
              triggerVisualFx(e.clientX, e.clientY, '#6366f1');
              speechService.stopSpeaking();
              onClose();
            }}
            className="clickable-option w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            Save Voice Personality
          </button>
        </div>

      </div>
    </div>
  );
};
