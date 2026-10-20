import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Sparkles,
  FileText,
  User,
  Share2,
  Headphones,
} from 'lucide-react';
import { ChatMessage, VoiceSettings } from '../types';
import { triggerVisualFx } from '../utils/visualFx';
import { speechService } from '../services/speech';
import { CodeBlock } from './CodeBlock';

interface ChatViewProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
  onSelectPrompt?: (prompt: string) => void;
  onLikeMessage?: (messageId: string) => void;
  onDislikeMessage?: (messageId: string) => void;
  onShareChat?: () => void;
  voiceSettings?: VoiceSettings;
  activeSpeakingMsgId?: string | null;
  onSpeakingChange?: (msgId: string | null) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isStreaming = false,
  onLikeMessage,
  onDislikeMessage,
  onShareChat,
  voiceSettings,
  activeSpeakingMsgId,
  onSpeakingChange,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [internalPlayingMsgId, setInternalPlayingMsgId] = useState<string | null>(null);
  const [speakingCharIndex, setSpeakingCharIndex] = useState<number>(0);
  const speechTimerRef = useRef<any>(null);
  const boundaryFiredRef = useRef<boolean>(false);

  const playingMsgId = activeSpeakingMsgId !== undefined ? activeSpeakingMsgId : internalPlayingMsgId;

  const setPlaying = (msgId: string | null) => {
    setInternalPlayingMsgId(msgId);
    onSpeakingChange?.(msgId);
    if (!msgId) {
      if (speechTimerRef.current) {
        clearInterval(speechTimerRef.current);
        speechTimerRef.current = null;
      }
      setSpeakingCharIndex(0);
    }
  };

  // Cleanup on unmount or tab close
  useEffect(() => {
    const handleBeforeUnload = () => speechService.stopSpeaking();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (speechTimerRef.current) {
        clearInterval(speechTimerRef.current);
      }
    };
  }, []);

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#10b981');
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSpeak = (msg: ChatMessage, e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#8b5cf6');
    if (speechTimerRef.current) {
      clearInterval(speechTimerRef.current);
      speechTimerRef.current = null;
    }

    if (playingMsgId === msg.id) {
      speechService.stopSpeaking();
      setPlaying(null);
      setSpeakingCharIndex(0);
    } else {
      setPlaying(msg.id);
      setSpeakingCharIndex(0);
      boundaryFiredRef.current = false;

      // Estimated fallback progress tracker for browsers that don't report high-frequency boundary events
      const words = msg.content.trim().split(/\s+/).length;
      const speed = voiceSettings?.speed || 1.0;
      const wordsPerSecond = (150 * speed) / 60; // ~2.5 words per sec at 1.0x
      const estimatedTotalSeconds = Math.max(1, words / wordsPerSecond);
      const stepIncrement = msg.content.length / (estimatedTotalSeconds * 10); // every 100ms

      speechTimerRef.current = setInterval(() => {
        if (!boundaryFiredRef.current) {
          setSpeakingCharIndex((prev) => {
            const next = prev + stepIncrement;
            return next < msg.content.length ? next : prev;
          });
        }
      }, 100);

      speechService.speak(
        msg.content,
        {
          speed: voiceSettings?.speed || 1.02,
          pitch: voiceSettings?.pitch !== undefined ? voiceSettings.pitch : 0.88,
          voiceIndex: voiceSettings?.voiceIndex !== undefined ? voiceSettings.voiceIndex : -1,
          voiceGender: voiceSettings?.voiceGender || 'male',
          voiceName: voiceSettings?.voiceName,
          voiceTone: voiceSettings?.voiceTone || 'jarvis-deep',
          onEnd: () => {
            setPlaying(null);
            setSpeakingCharIndex(0);
          },
          onBoundary: (charIndex) => {
            boundaryFiredRef.current = true;
            setSpeakingCharIndex(charIndex);
          },
          onStart: () => {
            setPlaying(msg.id);
          },
        }
      );
    }
  };

  // Helper to render markdown styling (bold, inline code with click-to-copy)
  const renderInlineStyles = (text: string) => {
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**')) {
        return (
          <strong key={bIdx} className="font-bold text-slate-900 dark:text-white">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      const inlineCodeParts = bPart.split(/(`[^`]+`)/g);
      return inlineCodeParts.map((cPart, cIdx) => {
        if (cPart.startsWith('`') && cPart.endsWith('`') && cPart.length > 2) {
          const rawCode = cPart.slice(1, -1);
          const inlineId = `inline-${bIdx}-${cIdx}-${rawCode.slice(0, 10)}`;
          return (
            <span
              key={cIdx}
              onClick={(e) => handleCopy(inlineId, rawCode, e)}
              title="Click to copy snippet"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-semibold cursor-pointer border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all group/inline"
            >
              <span>{rawCode}</span>
              {copiedId === inlineId ? (
                <Check className="w-3 h-3 text-emerald-500 shrink-0" />
              ) : (
                <Copy className="w-2.5 h-2.5 opacity-40 group-hover/inline:opacity-100 text-indigo-500 shrink-0 transition-opacity" />
              )}
            </span>
          );
        }
        return cPart;
      });
    });
  };

  // Word-level highlight for active spoken line
  const renderSpokenLineWords = (
    text: string,
    isLineBeingSpoken: boolean,
    lineStart: number,
    currentCharIndex: number
  ) => {
    if (!isLineBeingSpoken) {
      return renderInlineStyles(text);
    }

    // Split into words while tracking char boundaries
    const wordsWithSpaces = text.split(/(\s+)/);
    let offset = lineStart;

    return wordsWithSpaces.map((chunk, idx) => {
      const chunkStart = offset;
      const chunkEnd = offset + chunk.length;
      offset = chunkEnd;

      if (/^\s+$/.test(chunk)) {
        return <span key={idx}>{chunk}</span>;
      }

      // Check if this word is currently being spoken
      const isWordActive = currentCharIndex >= chunkStart - 1 && currentCharIndex <= chunkEnd + 4;

      if (isWordActive) {
        return (
          <span
            key={idx}
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black px-1.5 py-0.5 rounded-md shadow-[0_0_12px_rgba(99,102,241,0.65)] scale-105 transition-all duration-150 mx-0.5"
          >
            {chunk.replace(/[*_`]/g, '')}
          </span>
        );
      }

      const isWordPast = currentCharIndex > chunkEnd;

      return (
        <span
          key={idx}
          className={
            isWordPast
              ? 'text-indigo-950 dark:text-indigo-100 font-medium'
              : 'text-slate-800 dark:text-slate-200'
          }
        >
          {renderInlineStyles(chunk)}
        </span>
      );
    });
  };

  // Markdown renderer with real-time speech highlight tracking & full code block detection
  const renderFormattedContent = (
    content: string,
    msgId: string,
    isSpeakingThisMsg: boolean,
    msgIsStreaming?: boolean
  ) => {
    // 1. Detect closed code blocks with language specifiers
    const codeBlockRegex = /(?:```|~~~)([a-zA-Z0-9_#+.-]*)[ \t]*\r?\n([\s\S]*?)(?:```|~~~)/g;
    const parts: Array<{
      type: 'text' | 'code';
      content?: string;
      code?: string;
      language?: string;
      startIndex: number;
      endIndex: number;
      isStreamingCode?: boolean;
    }> = [];

    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, matchIndex),
          startIndex: lastIndex,
          endIndex: matchIndex,
        });
      }

      parts.push({
        type: 'code',
        language: match[1]?.trim() || 'code',
        code: match[2].trim(),
        startIndex: matchIndex,
        endIndex: matchIndex + match[0].length,
      });

      lastIndex = matchIndex + match[0].length;
    }

    // Check if trailing content has an unclosed code block (e.g. actively streaming AI response)
    if (lastIndex < content.length) {
      const remaining = content.slice(lastIndex);
      const unclosedMatch = remaining.match(/^(?:```|~~~)([a-zA-Z0-9_#+.-]*)[ \t]*\r?\n?([\s\S]*)$/);
      if (unclosedMatch && (msgIsStreaming || isStreaming || unclosedMatch[2]?.length > 0)) {
        parts.push({
          type: 'code',
          language: unclosedMatch[1]?.trim() || 'code',
          code: unclosedMatch[2].trim(),
          startIndex: lastIndex,
          endIndex: content.length,
          isStreamingCode: true,
        });
      } else {
        parts.push({
          type: 'text',
          content: remaining,
          startIndex: lastIndex,
          endIndex: content.length,
        });
      }
    }

    return (
      <div className="space-y-3 leading-relaxed text-sm sm:text-base">
        {parts.map((part, index) => {
          if (part.type === 'code') {
            const blockId = `${msgId}-code-${index}`;
            return (
              <CodeBlock
                key={blockId}
                id={blockId}
                code={part.code || ''}
                language={part.language || 'code'}
                isStreaming={part.isStreamingCode}
              />
            );
          }

          // Parse markdown lines & highlight active spoken paragraph/sentence
          const lines = (part.content || '').split('\n');
          let runningOffset = part.startIndex || 0;

          return (
            <div key={index} className="space-y-2">
              {lines.map((line, lIdx) => {
                const lineStart = runningOffset;
                const lineEnd = lineStart + line.length;
                runningOffset = lineEnd + 1; // +1 for the newline

                const isLineBeingSpoken =
                  isSpeakingThisMsg &&
                  speakingCharIndex >= lineStart - 5 &&
                  speakingCharIndex <= lineEnd + 25;

                const trimmed = line.trim();
                if (!trimmed) return <div key={lIdx} className="h-2" />;

                // Headings
                if (trimmed.startsWith('### ')) {
                  return (
                    <h3
                      key={lIdx}
                      className={`text-base sm:text-lg font-bold mt-3 transition-all duration-200 ${
                        isLineBeingSpoken
                          ? 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-3 py-1 rounded-xl border-l-4 border-indigo-500 shadow-xs ring-2 ring-indigo-300/40'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {trimmed.replace('### ', '')}
                    </h3>
                  );
                }
                if (trimmed.startsWith('## ')) {
                  return (
                    <h2
                      key={lIdx}
                      className={`text-lg sm:text-xl font-extrabold mt-4 transition-all duration-200 ${
                        isLineBeingSpoken
                          ? 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-3 py-1 rounded-xl border-l-4 border-indigo-500 shadow-xs ring-2 ring-indigo-300/40'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {trimmed.replace('## ', '')}
                    </h2>
                  );
                }
                if (trimmed.startsWith('# ')) {
                  return (
                    <h1
                      key={lIdx}
                      className={`text-xl sm:text-2xl font-black mt-4 transition-all duration-200 ${
                        isLineBeingSpoken
                          ? 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-3 py-1 rounded-xl border-l-4 border-indigo-500 shadow-xs ring-2 ring-indigo-300/40'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {trimmed.replace('# ', '')}
                    </h1>
                  );
                }

                // Bullet lists
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                  return (
                    <div
                      key={lIdx}
                      className={`flex items-start gap-2 pl-2 rounded-xl transition-all duration-200 ${
                        isLineBeingSpoken
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/70 py-1.5 pr-2.5 border-l-4 border-indigo-500 text-indigo-950 dark:text-indigo-100 font-medium shadow-xs ring-1 ring-indigo-300/40'
                          : ''
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0 animate-pulse" />
                      <div>
                        {renderSpokenLineWords(
                          trimmed.slice(2),
                          isLineBeingSpoken,
                          lineStart + 2,
                          speakingCharIndex
                        )}
                      </div>
                    </div>
                  );
                }

                // Numbered lists
                if (/^\d+\.\s/.test(trimmed)) {
                  const matchNum = trimmed.match(/^(\d+\.)\s(.*)/);
                  const prefix = matchNum ? matchNum[1] : '•';
                  const restText = matchNum ? matchNum[2] : trimmed;
                  return (
                    <div
                      key={lIdx}
                      className={`flex items-start gap-2 pl-2 rounded-xl transition-all duration-200 ${
                        isLineBeingSpoken
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/70 py-1.5 pr-2.5 border-l-4 border-indigo-500 text-indigo-950 dark:text-indigo-100 font-medium shadow-xs ring-1 ring-indigo-300/40'
                          : ''
                      }`}
                    >
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                        {prefix}
                      </span>
                      <div>
                        {renderSpokenLineWords(
                          restText,
                          isLineBeingSpoken,
                          lineStart + prefix.length + 1,
                          speakingCharIndex
                        )}
                      </div>
                    </div>
                  );
                }

                // Regular paragraph with live speaking highlight
                return (
                  <p
                    key={lIdx}
                    className={`transition-all duration-200 ${
                      isLineBeingSpoken
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/70 px-3 py-2 rounded-2xl border-l-4 border-indigo-500 text-indigo-950 dark:text-indigo-100 font-medium shadow-xs ring-2 ring-indigo-200/60 dark:ring-indigo-800/60'
                        : ''
                    }`}
                  >
                    {renderSpokenLineWords(line, isLineBeingSpoken, lineStart, speakingCharIndex)}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4 space-y-6">
      {messages.map((msg) => {
        const isUser = msg.role === 'user';
        const isSpeakingThisMsg = !isUser && playingMsgId === msg.id;
        const progressPercent = Math.min(
          100,
          Math.max(5, Math.round((speakingCharIndex / (msg.content.length || 1)) * 100))
        );

        return (
          <div
            key={msg.id}
            className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 animate-in fade-in duration-300`}
          >
            {/* Author Badge & Quick Header Read Aloud Button */}
            <div
              className={`flex items-center justify-between w-full ${
                isUser ? 'justify-end' : 'max-w-[92%] sm:max-w-[85%]'
              } px-1`}
            >
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
                {isUser ? (
                  <>
                    <span>You</span>
                    <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <User className="w-3 h-3" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      SOYO Mind VAI
                    </span>
                  </>
                )}
              </div>

              {!isUser && (
                <button
                  type="button"
                  onClick={(e) => handleToggleSpeak(msg, e)}
                  aria-label={isSpeakingThisMsg ? 'Stop audio playback' : 'Listen to response'}
                  title={isSpeakingThisMsg ? 'Stop speech playback' : 'Listen to this response using speechService'}
                  className={`clickable-option flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all shadow-2xs active:scale-95 ${
                    isSpeakingThisMsg
                      ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 animate-pulse'
                      : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 border border-indigo-200/70 dark:border-indigo-800/70'
                  }`}
                >
                  {isSpeakingThisMsg ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Headphones className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      <span>Listen</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Attachments (if user sent images/files) */}
            {msg.attachments && msg.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 max-w-md">
                {msg.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
                  >
                    {att.type === 'image' ? (
                      <img
                        src={att.data}
                        alt={att.name}
                        className="max-h-60 max-w-xs object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        <span className="truncate max-w-[160px]">{att.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Message Bubble with Visual Pulsing Indicator and Dedicated Listen Button */}
            <div
              className={`relative max-w-[92%] sm:max-w-[85%] rounded-3xl p-4 sm:p-5 transition-all duration-300 ${
                isUser
                  ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-sm shadow-indigo-500/10'
                  : isSpeakingThisMsg
                  ? 'bg-white dark:bg-slate-900 border-2 border-indigo-500 ring-4 ring-indigo-500/25 shadow-[0_0_35px_rgba(99,102,241,0.3)] text-slate-800 dark:text-slate-200 rounded-tl-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-xs'
              }`}
            >
              {/* Dedicated In-Bubble Audio & 'Listen' Header for Assistant Responses */}
              {!isUser && (
                <div
                  className={`flex flex-col gap-2.5 mb-3.5 pb-2.5 border-b transition-colors ${
                    isSpeakingThisMsg
                      ? 'border-indigo-100 dark:border-indigo-900/60'
                      : 'border-slate-100 dark:border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                        <span className="hidden sm:inline">SOYO Mind</span>
                      </div>

                      {/* Speaking Equalizer Badge */}
                      {isSpeakingThisMsg && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 dark:from-indigo-950/80 dark:to-purple-950/80 border border-indigo-300/60 dark:border-indigo-700/60 text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs">
                          {/* Animated sound wave equalizer bars */}
                          <div className="flex items-end gap-1 h-3.5">
                            <span
                              className="w-1 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-[pulse_0.4s_infinite_ease-in-out]"
                              style={{ height: '65%' }}
                            />
                            <span
                              className="w-1 bg-purple-600 dark:bg-purple-400 rounded-full animate-[pulse_0.6s_infinite_ease-in-out_0.1s]"
                              style={{ height: '100%' }}
                            />
                            <span
                              className="w-1 bg-cyan-600 dark:bg-cyan-400 rounded-full animate-[pulse_0.45s_infinite_ease-in-out_0.2s]"
                              style={{ height: '80%' }}
                            />
                            <span
                              className="w-1 bg-pink-600 dark:bg-pink-400 rounded-full animate-[pulse_0.5s_infinite_ease-in-out_0.15s]"
                              style={{ height: '90%' }}
                            />
                            <span
                              className="w-1 bg-amber-500 dark:bg-amber-400 rounded-full animate-[pulse_0.55s_infinite_ease-in-out_0.25s]"
                              style={{ height: '60%' }}
                            />
                          </div>
                          <span>Speaking ({progressPercent}%)</span>
                        </div>
                      )}
                    </div>

                    {/* Dedicated 'Listen' Button inside the assistant chat bubble */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSpeak(msg, e)}
                      aria-label={isSpeakingThisMsg ? 'Stop speech playback' : 'Listen to this response'}
                      title={
                        isSpeakingThisMsg
                          ? 'Stop audio playback'
                          : 'Listen to this response using speechService'
                      }
                      className={`clickable-option flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 shadow-xs ${
                        isSpeakingThisMsg
                          ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25 animate-pulse'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-indigo-500/20 hover:shadow-indigo-500/30'
                      }`}
                    >
                      {isSpeakingThisMsg ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Stop Listening</span>
                        </>
                      ) : (
                        <>
                          <Headphones className="w-3.5 h-3.5" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Visual Reading Progress Bar */}
                  {isSpeakingThisMsg && (
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden animate-in fade-in">
                      <div
                        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 shadow-xs"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {isUser ? (
                <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base font-normal">
                  {msg.content}
                </div>
              ) : (
                <div>
                  {renderFormattedContent(msg.content, msg.id, isSpeakingThisMsg, msg.streaming)}
                  {msg.streaming && (
                    <span className="inline-block w-2 h-4 ml-1 bg-indigo-500 animate-pulse rounded-sm" />
                  )}
                </div>
              )}
            </div>

            {/* Assistant Action Buttons: Dedicated Listen, Copy, Like, Dislike, Share */}
            {!isUser && (
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 pt-1 px-1 flex-wrap">
                {/* Dedicated Text-to-Speech Engine Button */}
                <button
                  type="button"
                  onClick={(e) => handleToggleSpeak(msg, e)}
                  aria-label={
                    isSpeakingThisMsg
                      ? 'Stop speech playback'
                      : 'Listen to this response'
                  }
                  title={
                    isSpeakingThisMsg
                      ? 'Stop audio playback'
                      : 'Listen to this response using speechService'
                  }
                  className={`clickable-option flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 ${
                    isSpeakingThisMsg
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/25 animate-pulse'
                      : 'bg-indigo-50/90 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80'
                  }`}
                >
                  {isSpeakingThisMsg ? (
                    <>
                      <VolumeX className="w-4 h-4 text-white" />
                      <span>Stop Listening</span>
                    </>
                  ) : (
                    <>
                      <Headphones className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Listen</span>
                    </>
                  )}
                </button>

                {/* Copy Message */}
                <button
                  type="button"
                  onClick={(e) => handleCopy(msg.id, msg.content, e)}
                  title="Copy response"
                  className="clickable-option p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                {/* Like Feedback */}
                <button
                  type="button"
                  onClick={(e) => {
                    triggerVisualFx(e.clientX, e.clientY, '#10b981');
                    onLikeMessage?.(msg.id);
                  }}
                  title="Helpful response"
                  className={`clickable-option p-1.5 rounded-lg transition-colors ${
                    msg.feedback === 'like'
                      ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>

                {/* Dislike Feedback */}
                <button
                  type="button"
                  onClick={(e) => {
                    triggerVisualFx(e.clientX, e.clientY, '#ef4444');
                    onDislikeMessage?.(msg.id);
                  }}
                  title="Needs improvement"
                  className={`clickable-option p-1.5 rounded-lg transition-colors ${
                    msg.feedback === 'dislike'
                      ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/60'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>

                {/* Share Single Response / Chat */}
                {onShareChat && (
                  <button
                    type="button"
                    onClick={(e) => {
                      triggerVisualFx(e.clientX, e.clientY, '#3b82f6');
                      onShareChat();
                    }}
                    title="Share chat"
                    className="clickable-option p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Floating Streaming Indicator */}
      {isStreaming && (
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 animate-pulse pl-2">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>SOYO Mind is formulating an answer...</span>
        </div>
      )}
    </div>
  );
};
