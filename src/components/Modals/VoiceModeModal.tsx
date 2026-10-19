import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  Repeat,
  Radio,
  Square,
  ArrowRight,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { AiOrb } from '../AiOrb';
import { speechService } from '../../services/speech';
import { triggerVisualFx, playTechClickSound } from '../../utils/visualFx';
import { VoiceSettings } from '../../types';

interface VoiceTurn {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

interface VoiceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceSubmitted: (transcript: string) => void;
  languageCode: string;
  languageName?: string;
  voiceSettings?: VoiceSettings;
  onTurnCompleted?: (userText: string, assistantReply: string) => void;
}

export const VoiceModeModal: React.FC<VoiceModeModalProps> = ({
  isOpen,
  onClose,
  onVoiceSubmitted,
  languageCode,
  languageName = 'English',
  voiceSettings,
  onTurnCompleted,
}) => {
  // Mode: continuous 2-way conversation (like ChatGPT Voice)
  const [isContinuous, setIsContinuous] = useState(true);
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [aiSpokenText, setAiSpokenText] = useState('');
  const [historyTurns, setHistoryTurns] = useState<VoiceTurn[]>([]);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number[]>([15, 25, 40, 20, 10]);

  const isContinuousRef = useRef(isContinuous);
  isContinuousRef.current = isContinuous;

  const turnsRef = useRef<VoiceTurn[]>(historyTurns);
  turnsRef.current = historyTurns;

  const isMountedRef = useRef(false);

  // Audio bars animation loop when speaking or listening
  useEffect(() => {
    let animId: number;
    const updateLevels = () => {
      if (orbState === 'listening' || orbState === 'speaking') {
        setAudioLevel([
          Math.floor(10 + Math.random() * 50),
          Math.floor(20 + Math.random() * 70),
          Math.floor(30 + Math.random() * 90),
          Math.floor(20 + Math.random() * 70),
          Math.floor(10 + Math.random() * 50),
        ]);
      } else {
        setAudioLevel([12, 18, 24, 18, 12]);
      }
      animId = requestAnimationFrame(updateLevels);
    };
    animId = requestAnimationFrame(updateLevels);
    return () => cancelAnimationFrame(animId);
  }, [orbState]);

  // Lifecycle on modal open / close
  useEffect(() => {
    isMountedRef.current = true;
    if (isOpen) {
      setAiSpokenText('');
      setCurrentTranscript('');
      startVoiceListeningLoop();
    } else {
      stopAllVoiceActivity();
    }
    return () => {
      isMountedRef.current = false;
      stopAllVoiceActivity();
    };
  }, [isOpen]);

  const stopAllVoiceActivity = () => {
    speechService.stopListening();
    speechService.stopSpeaking();
    setIsMicActive(false);
    setOrbState('idle');
  };

  // Start speech recognition loop
  const startVoiceListeningLoop = () => {
    speechService.stopSpeaking();
    speechService.stopListening();
    setIsMicActive(true);
    setOrbState('listening');
    setCurrentTranscript('');

    speechService.startListening(
      (text, isFinal) => {
        if (!isMountedRef.current) return;
        setCurrentTranscript(text);
        if (isFinal && text.trim().length > 0) {
          processUserVoiceTurn(text.trim());
        }
      },
      (err) => {
        console.warn('Speech recognition error in Voice Mode:', err);
        setIsMicActive(false);
        if (isMountedRef.current && isContinuousRef.current && orbState !== 'speaking') {
          // If transient error, retry listening after brief delay
          setTimeout(() => {
            if (isMountedRef.current && orbState === 'listening') {
              startVoiceListeningLoop();
            }
          }, 1500);
        }
      },
      () => {
        // onEnd of speech recognition
        setIsMicActive(false);
      },
      languageCode || 'en-US'
    );
  };

  // Handle user's finalized voice query
  const processUserVoiceTurn = async (userText: string) => {
    speechService.stopListening();
    setIsMicActive(false);
    setOrbState('thinking');
    setIsAiResponding(true);

    const newTurn: VoiceTurn = { role: 'user', text: userText, timestamp: Date.now() };
    const updatedHistory = [...turnsRef.current, newTurn];
    setHistoryTurns(updatedHistory);

    try {
      // Build brief memory context for Groq
      const contextMsgs = updatedHistory.slice(-6).map((t) => ({
        role: t.role,
        content: t.text,
      }));

      // Call Groq backend
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          messages: contextMsgs,
          language: languageName,
        }),
      });

      if (!res.ok) {
        throw new Error('Could not receive voice response from server.');
      }

      const data = await res.json();
      const aiReply: string = data.text || data.response || "I hear you! How can I help you next?";

      if (!isMountedRef.current) return;

      const assistantTurn: VoiceTurn = {
        role: 'assistant',
        text: aiReply,
        timestamp: Date.now(),
      };
      setHistoryTurns((prev) => [...prev, assistantTurn]);
      setAiSpokenText(aiReply);
      setIsAiResponding(false);

      // Notify parent app to register conversation turn in chat session
      if (onTurnCompleted) {
        onTurnCompleted(userText, aiReply);
      } else {
        onVoiceSubmitted(userText);
      }

      // Speak response aloud via Text-to-Speech
      setOrbState('speaking');
      speechService.speak(
        aiReply,
        voiceSettings?.speed || 1.05,
        voiceSettings?.pitch || 1.0,
        voiceSettings?.voiceIndex ?? -1,
        // onEnd:
        () => {
          if (!isMountedRef.current) return;
          // IF Continuous Conversation is ON, resume listening automatically like ChatGPT
          if (isContinuousRef.current) {
            setOrbState('listening');
            startVoiceListeningLoop();
          } else {
            setOrbState('idle');
          }
        },
        // onBoundary
        undefined,
        // onStart
        () => {
          if (isMountedRef.current) {
            setOrbState('speaking');
          }
        }
      );
    } catch (err: any) {
      console.error('Error generating voice turn:', err);
      setIsAiResponding(false);
      setOrbState('idle');
      setAiSpokenText("I had trouble hearing that. Please tap the microphone to try again.");
    }
  };

  // Interrupt AI speaking or toggle microphone
  const handleToggleMic = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, orbState === 'listening' ? '#ef4444' : '#10b981');
    playTechClickSound('tap');

    if (orbState === 'speaking') {
      // Interrupt AI speaking and start listening immediately
      speechService.stopSpeaking();
      startVoiceListeningLoop();
    } else if (orbState === 'listening') {
      // Pause listening
      speechService.stopListening();
      setIsMicActive(false);
      setOrbState('idle');
    } else {
      // Start listening
      startVoiceListeningLoop();
    }
  };

  // Toggle Continuous Conversation Mode
  const handleToggleContinuous = (e: React.MouseEvent) => {
    const nextState = !isContinuous;
    setIsContinuous(nextState);
    triggerVisualFx(e.clientX, e.clientY, nextState ? '#10b981' : '#f59e0b');
    playTechClickSound('magic');

    if (nextState && orbState === 'idle') {
      startVoiceListeningLoop();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-6 bg-slate-950/98 text-white backdrop-blur-2xl animate-in fade-in select-none">
      
      {/* Top Header Bar */}
      <div className="w-full max-w-xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div className="flex flex-col text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <span>Online Voice Chat</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-[9px] text-emerald-300">
                LIVE
              </span>
            </span>
            <span className="text-[10px] text-slate-400">
              High-speed Groq AI • {languageName}
            </span>
          </div>
        </div>

        {/* Continuous Conversation Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleContinuous}
            type="button"
            title={isContinuous ? "Continuous Voice On (Auto responds & listens back)" : "Continuous Voice Off"}
            className={`clickable-option flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all duration-200 active:scale-95 ${
              isContinuous
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Repeat className={`w-3.5 h-3.5 ${isContinuous ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            <span className="hidden sm:inline">Continuous:</span>
            <span>{isContinuous ? 'ON' : 'OFF'}</span>
          </button>

          {/* Close Voice Mode */}
          <button
            onClick={(e) => {
              triggerVisualFx(e.clientX, e.clientY, '#94a3b8');
              stopAllVoiceActivity();
              onClose();
            }}
            aria-label="Close voice mode"
            className="clickable-option p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Central Interactive Voice Orb & Live Visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-auto w-full max-w-xl px-4">
        
        {/* Dynamic State Pill */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              orbState === 'listening'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 animate-pulse'
                : orbState === 'thinking'
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-bounce'
                : orbState === 'speaking'
                ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                : 'bg-white/10 border border-white/15 text-slate-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${
              orbState === 'listening' ? 'bg-emerald-400' :
              orbState === 'thinking' ? 'bg-amber-400' :
              orbState === 'speaking' ? 'bg-indigo-400 animate-ping' : 'bg-slate-400'
            }`} />
            {orbState === 'listening' && 'Listening to you...'}
            {orbState === 'thinking' && 'Groq AI Thinking...'}
            {orbState === 'speaking' && 'SOYO Speaking...'}
            {orbState === 'idle' && 'Paused. Tap Mic to Talk'}
          </span>
        </div>

        {/* Liquid AI Animated Orb */}
        <div className="relative cursor-pointer my-2" onClick={handleToggleMic}>
          <AiOrb
            state={orbState}
            greetingTitle=""
            subtitle=""
            size="normal"
          />

          {/* Sound Wave Frequency Bars (ChatGPT style) */}
          <div className="flex items-center justify-center gap-1.5 mt-4 h-8">
            {audioLevel.map((height, idx) => (
              <span
                key={idx}
                className={`w-1 rounded-full transition-all duration-100 ${
                  orbState === 'listening'
                    ? 'bg-emerald-400'
                    : orbState === 'speaking'
                    ? 'bg-indigo-400'
                    : 'bg-white/20'
                }`}
                style={{
                  height: `${Math.max(8, height * 0.45)}px`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Real-time Subtitle Cards */}
        <div className="w-full max-w-md mt-4 min-h-[90px] flex flex-col items-center justify-center">
          {/* User Transcript */}
          {currentTranscript ? (
            <div className="w-full px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-sm font-medium text-slate-100 animate-in fade-in shadow-lg">
              <span className="text-[11px] font-bold text-emerald-400 block mb-0.5 uppercase tracking-wide">You</span>
              "{currentTranscript}"
            </div>
          ) : aiSpokenText && orbState === 'speaking' ? (
            <div className="w-full px-4 py-2.5 rounded-2xl bg-indigo-950/60 backdrop-blur-md border border-indigo-800/60 text-sm font-normal text-indigo-100 animate-in fade-in shadow-lg max-h-36 overflow-y-auto scrollbar-thin">
              <span className="text-[11px] font-bold text-indigo-400 block mb-0.5 uppercase tracking-wide">SOYO Mind</span>
              {aiSpokenText}
            </div>
          ) : (
            <div className="text-center text-xs text-slate-400/80 max-w-xs">
              {orbState === 'listening' ? (
                <span>Speak naturally in {languageName}. Continuous conversation will keep answering & listening back.</span>
              ) : orbState === 'speaking' ? (
                <span>Tap the circle to interrupt SOYO anytime and ask another question.</span>
              ) : (
                <span>Tap the microphone below or say something to begin.</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="w-full max-w-md flex flex-col items-center space-y-3 z-10">
        
        {/* Main Mic / Action Button */}
        <div className="flex items-center gap-4">
          
          {/* Repeat / Continuous Mode Indicator Button */}
          <button
            onClick={handleToggleContinuous}
            title={isContinuous ? "Continuous Conversation ON" : "Continuous Conversation OFF"}
            className={`clickable-option p-3 rounded-2xl border transition-all ${
              isContinuous
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Repeat className="w-5 h-5" />
          </button>

          {/* Primary Big Mic Orb */}
          <button
            onClick={handleToggleMic}
            aria-label={orbState === 'speaking' ? 'Interrupt Speaking' : isMicActive ? 'Pause Listening' : 'Start Speaking'}
            className={`clickable-option relative p-6 rounded-full shadow-2xl transition-all duration-300 active:scale-90 ${
              orbState === 'speaking'
                ? 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-orange-500/40 hover:scale-105'
                : isMicActive || orbState === 'listening'
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-emerald-500/40 ring-4 ring-emerald-500/30 animate-pulse'
                : 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 shadow-indigo-500/40 hover:scale-105'
            }`}
          >
            {orbState === 'speaking' ? (
              <Square className="w-8 h-8 text-white fill-white" />
            ) : isMicActive || orbState === 'listening' ? (
              <Mic className="w-8 h-8 text-white" />
            ) : (
              <MicOff className="w-8 h-8 text-white/90" />
            )}
          </button>

          {/* Stop / End Call Button */}
          <button
            onClick={() => {
              stopAllVoiceActivity();
              onClose();
            }}
            title="End Voice Conversation"
            className="clickable-option p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 hover:text-rose-200 transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Helper Text */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          {orbState === 'speaking' ? (
            <span className="text-amber-300 font-semibold flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 animate-bounce" /> Tap center to interrupt AI
            </span>
          ) : isMicActive ? (
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Listening continuously...
            </span>
          ) : (
            <span>Tap mic to talk</span>
          )}
        </div>
      </div>

    </div>
  );
};
