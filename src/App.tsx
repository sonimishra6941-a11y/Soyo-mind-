import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { AiOrb } from './components/AiOrb';
import { ChatInputBar } from './components/ChatInputBar';
import { ChatView } from './components/ChatView';
import { SidebarDrawer, DrawerAction } from './components/SidebarDrawer';
import { ClickFxManager } from './components/ClickFxManager';

// Modals
import { LanguagesModal } from './components/Modals/LanguagesModal';
import { ChatHistoryModal } from './components/Modals/ChatHistoryModal';
import { ShareChatModal } from './components/Modals/ShareChatModal';
import { ShareAppModal } from './components/Modals/ShareAppModal';
import { PhotoEditorModal } from './components/Modals/PhotoEditorModal';
import { VisionCameraModal } from './components/Modals/VisionCameraModal';
import { AppearanceModal } from './components/Modals/AppearanceModal';
import { VoiceSettingsModal } from './components/Modals/VoiceSettingsModal';
import { AccountModal } from './components/Modals/AccountModal';
import { PrivacyDataModal } from './components/Modals/PrivacyDataModal';
import { NotificationsModal } from './components/Modals/NotificationsModal';
import { AboutHelpModal } from './components/Modals/AboutHelpModal';
import { ConfirmDialog } from './components/Modals/ConfirmDialog';
import { VoiceModeModal } from './components/Modals/VoiceModeModal';
import { ApiKeyModal } from './components/Modals/ApiKeyModal';
import { LoginModal } from './components/Modals/LoginModal';

import { WORLD_LANGUAGES } from './data/languages';
import { getTranslation } from './data/translations';
import {
  ChatSession,
  ChatMessage,
  Attachment,
  LanguageItem,
  UserProfile,
  AppearanceSettings,
  VoiceSettings,
  ThemeId,
} from './types';
import { speechService } from './services/speech';
import { triggerVisualFx, playTechClickSound } from './utils/visualFx';
import { getThemeById, TEN_THEMES } from './data/themes';
import { Sparkles, Key } from 'lucide-react';

const STORAGE_KEY_SESSIONS = 'soyo_mind_sessions_v3';
const STORAGE_KEY_LANG = 'soyo_mind_lang_v3';
const STORAGE_KEY_APPEARANCE = 'soyo_mind_appearance_v4';
const STORAGE_KEY_VOICE = 'soyo_mind_voice_v4';
const STORAGE_KEY_PROFILE = 'soyo_mind_profile_v4';

export default function App() {
  // 1. Language State (Default: English)
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageItem>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved) return JSON.parse(saved);
    } catch {}
    return WORLD_LANGUAGES[0];
  });

  const t = getTranslation(selectedLanguage.code);

  // 2. Appearance & 10 AI Front Themes State
  const [appearance, setAppearance] = useState<AppearanceSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APPEARANCE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) return parsed;
      }
    } catch {}
    return {
      mode: 'dark',
      themeColor: 'royal-midnight-purple',
      fontSize: 'medium',
    };
  });

  const activeTheme = useMemo(() => getThemeById(appearance.themeColor), [appearance.themeColor]);

  // Apply Appearance classes to document root
  useEffect(() => {
    const root = document.documentElement;
    const theme = getThemeById(appearance.themeColor);
    const effectiveMode =
      appearance.mode === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : appearance.mode || theme.mode;

    if (effectiveMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY_APPEARANCE, JSON.stringify(appearance));
  }, [appearance]);

  // Save Language
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANG, JSON.stringify(selectedLanguage));
  }, [selectedLanguage]);

  // 3. Voice Settings State (Default: Male Jarvis AI with deep resonant pitch)
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOICE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) return parsed;
      }
    } catch {}
    return {
      voiceGender: 'male',
      voiceIndex: -1,
      speed: 1.02,
      pitch: 0.88, // Deep resonant Jarvis pitch
      autoReadResponses: false,
      preset: 'jarvis',
      voiceName: '',
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VOICE, JSON.stringify(voiceSettings));
    speechService.updateSettings(voiceSettings);
  }, [voiceSettings]);

  // 4. User Profile State (Default: Guest so Log In button is prominently shown)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: 'Guest User',
      email: '',
      avatar: '',
      isLoggedIn: false,
      memberTier: 'Free',
      createdAt: '2026-10-15',
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  // 5. Chat Sessions State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    const initialSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return [initialSession];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'session-' + Date.now();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  // Streaming State
  const [isStreaming, setIsStreaming] = useState(false);
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);

  // Speech Recognition input
  const [isListeningInput, setIsListeningInput] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');

  // 6. Navigation Drawer & Modals state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<DrawerAction | null>(null);
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  const checkKeyStatus = async () => {
    try {
      const res = await fetch('/api/key/status');
      if (res.ok) {
        const data = await res.json();
        setHasApiKey(Boolean(data.hasKey));
      }
    } catch {}
  };

  useEffect(() => {
    checkKeyStatus();
  }, []);

  // Confirm Dialog State
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: '',
    onConfirm: () => {},
  });

  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isStreaming]);

  // New Chat Handler
  const handleStartNewChat = () => {
    const newSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  // Send Message & Stream Response from Gemini SSE API
  const handleSendMessage = async (text: string, attachments: Attachment[] = []) => {
    if ((!text.trim() && attachments.length === 0) || isStreaming) return;

    const userMsgId = 'msg-' + Date.now();
    const assistantMsgId = 'msg-ai-' + (Date.now() + 1);

    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const initialAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      streaming: true,
    };

    // Update session title on first message
    const isFirstMsg = messages.length === 0;
    const sessionTitle = isFirstMsg
      ? text.slice(0, 36) || (attachments[0] ? `Analyzed ${attachments[0].name}` : 'Conversation')
      : currentSession.title;

    // Update current session
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            title: sessionTitle,
            updatedAt: Date.now(),
            messages: [...s.messages, newUserMessage, initialAssistantMessage],
          };
        }
        return s;
      })
    );

    setIsStreaming(true);
    setOrbState('thinking');

    try {
      // Build conversation turns to pass memory to backend
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments,
      }));
      historyPayload.push({
        role: newUserMessage.role,
        content: newUserMessage.content,
        attachments: newUserMessage.attachments,
      });

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          language: selectedLanguage.name,
          attachments: attachments,
          voiceTone: voiceSettings.voiceTone || 'jarvis-deep',
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to connect to SOYO Mind AI server stream.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const rawChunk = decoder.decode(value, { stream: true });
        const lines = rawChunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.slice(5).trim();

          if (dataStr === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.text) {
              accumulatedText += parsed.text;
              // Progressively update assistant message in session
              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id === currentSessionId) {
                    const updatedMsgs = s.messages.map((m) => {
                      if (m.id === assistantMsgId) {
                        return { ...m, content: accumulatedText };
                      }
                      return m;
                    });
                    return { ...s, messages: updatedMsgs };
                  }
                  return s;
                })
              );
            } else if (parsed.error) {
              accumulatedText += `\n\n*Notice: ${parsed.error}*`;
            }
          } catch {}
        }
      }

      // Finish streaming
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            const updatedMsgs = s.messages.map((m) => {
              if (m.id === assistantMsgId) {
                return {
                  ...m,
                  content: accumulatedText || 'I am ready. How may I assist you next?',
                  streaming: false,
                };
              }
              return m;
            });
            return { ...s, messages: updatedMsgs };
          }
          return s;
        })
      );

      // Auto-read response if enabled in voice settings
      if (voiceSettings.autoReadResponses && accumulatedText) {
        setOrbState('speaking');
        setActiveSpeakingMsgId(assistantMsgId);
        speechService.speak(
          accumulatedText,
          {
            speed: voiceSettings.speed,
            pitch: voiceSettings.pitch,
            voiceIndex: voiceSettings.voiceIndex,
            voiceGender: voiceSettings.voiceGender,
            voiceName: voiceSettings.voiceName,
            onEnd: () => {
              setOrbState('idle');
              setActiveSpeakingMsgId(null);
            },
          }
        );
      } else {
        setOrbState('idle');
      }
    } catch (err: any) {
      console.error('Chat stream error:', err);
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            const updatedMsgs = s.messages.map((m) => {
              if (m.id === assistantMsgId) {
                return {
                  ...m,
                  content:
                    "I am currently ready to assist. Please verify that your Groq API key is configured or retry your inquiry.",
                  streaming: false,
                };
              }
              return m;
            });
            return { ...s, messages: updatedMsgs };
          }
          return s;
        })
      );
      setOrbState('idle');
    } finally {
      setIsStreaming(false);
    }
  };

  // Toggle Voice Recognition in the bottom input bar
  const handleToggleSpeechRecognition = () => {
    if (isListeningInput) {
      speechService.stopListening();
      setIsListeningInput(false);
      setOrbState('idle');
    } else {
      setIsListeningInput(true);
      setOrbState('listening');
      speechService.startListening(
        (transcript, isFinal) => {
          setSpeechTranscript(transcript);
          if (isFinal && transcript.trim()) {
            setIsListeningInput(false);
            setOrbState('idle');
            handleSendMessage(transcript.trim());
            setSpeechTranscript('');
          }
        },
        (err) => {
          console.warn('Speech error:', err);
          setIsListeningInput(false);
          setOrbState('idle');
        },
        () => {
          setIsListeningInput(false);
          setOrbState('idle');
        },
        selectedLanguage.code || 'en-US'
      );
    }
  };

  // Feedback on messages
  const handleLikeMessage = (messageId: string) => {
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === messageId ? { ...m, feedback: m.feedback === 'like' ? null : 'like' } : m
        ),
      }))
    );
  };

  const handleDislikeMessage = (messageId: string) => {
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === messageId ? { ...m, feedback: m.feedback === 'dislike' ? null : 'dislike' } : m
        ),
      }))
    );
  };

  // Actions from Sidebar Drawer
  const handleSelectDrawerAction = (action: DrawerAction) => {
    if (action === 'new-chat') {
      handleStartNewChat();
    } else if (action === 'delete-chat') {
      // Trigger confirmation dialog for deleting current chat
      setConfirmDialogConfig({
        isOpen: true,
        title: t.confirmDeleteTitle,
        description: t.confirmDeleteDesc,
        confirmLabel: t.delete,
        onConfirm: () => {
          setSessions((prev) => {
            const remaining = prev.filter((s) => s.id !== currentSessionId);
            if (remaining.length === 0) {
              const fresh: ChatSession = {
                id: 'session-' + Date.now(),
                title: 'New Conversation',
                messages: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };
              setCurrentSessionId(fresh.id);
              return [fresh];
            }
            setCurrentSessionId(remaining[0].id);
            return remaining;
          });
        },
      });
    } else if (action === 'logout') {
      setConfirmDialogConfig({
        isOpen: true,
        title: 'Sign out of SOYO Mind?',
        description: 'You can sign back in anytime with your profile.',
        confirmLabel: 'Sign Out',
        onConfirm: () => {
          setUserProfile((p) => ({ ...p, isLoggedIn: false }));
        },
      });
    } else if (action === 'login') {
      setIsLoginModalOpen(true);
    } else {
      setActiveModal(action);
    }
  };

  // Delete All Chats trigger
  const handleRequestDeleteAll = () => {
    setConfirmDialogConfig({
      isOpen: true,
      title: 'Delete All Chats?',
      description: t.confirmDeleteAllDesc,
      confirmLabel: 'Delete All',
      onConfirm: () => {
        const fresh: ChatSession = {
          id: 'session-' + Date.now(),
          title: 'New Conversation',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setSessions([fresh]);
        setCurrentSessionId(fresh.id);
        setActiveModal(null);
      },
    });
  };

  // Clear Cache
  const handleClearCache = () => {
    localStorage.removeItem(STORAGE_KEY_SESSIONS);
    setSessions([
      {
        id: 'session-' + Date.now(),
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);
  };

  const hasMessages = messages.length > 0;

  const isDarkCanvas =
    appearance.mode === 'dark' ||
    (appearance.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
    (appearance.mode !== 'light' && activeTheme.mode === 'dark');

  return (
    <div
      className={`relative flex flex-col h-screen w-screen overflow-hidden font-sans transition-all duration-700 ${
        isDarkCanvas ? 'dark text-slate-100' : 'text-slate-900'
      }`}
      style={{
        background: appearance.customWallpaper ? undefined : activeTheme.bgGradient,
      }}
    >
      {/* Dynamic Gallery Wallpaper Layer */}
      {appearance.customWallpaper && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 pointer-events-none"
          style={{
            backgroundImage: `url(${appearance.customWallpaper})`,
          }}
        >
          {/* Contrast scrim overlay to make text, orb & controls crystal clear */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              isDarkCanvas ? 'bg-slate-950/60 backdrop-blur-[2px]' : 'bg-white/50 backdrop-blur-[2px]'
            }`}
          />
        </div>
      )}
      
      {/* Unique Visual Click Effect Manager (Sparks, Radiant Halo & Audio Chime) */}
      <ClickFxManager />

      {/* Top Header */}
      <Header
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onNewChat={handleStartNewChat}
        onOpenApiKey={() => setIsApiKeyModalOpen(true)}
        onOpenVoiceChat={() => setIsVoiceModeOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        userProfile={userProfile}
        hasApiKey={hasApiKey}
        currentLanguageFlag={selectedLanguage.flag}
        isStreaming={isStreaming}
      />

      {/* Main App Container */}
      <main
        ref={chatScrollContainerRef}
        className="flex-1 overflow-y-auto flex flex-col scrollbar-thin relative z-10"
      >
        {!hasMessages ? (
          /* HOME SCREEN: Center Orb + Greeting + Central Search Bar */
          <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 animate-in fade-in duration-500">
            {/* Center Animated Liquid AI Orb with Theme Morphing */}
            <AiOrb
              state={orbState}
              greetingTitle={t.goodMorning}
              subtitle={t.howCanIHelp}
              themeId={appearance.themeColor}
              onClick={() => {
                playTechClickSound('magic');
                setIsVoiceModeOpen(true);
              }}
            />

            {/* Central Search Bar / Chat Input Bar */}
            <div className="w-full max-w-xl mt-4">
              <ChatInputBar
                onSendMessage={handleSendMessage}
                isStreaming={isStreaming}
                onOpenVoiceMode={() => setIsVoiceModeOpen(true)}
                onStartCameraVision={() => setActiveModal('vision-camera')}
                placeholder={t.askPlaceholder}
                isListening={isListeningInput}
                onToggleSpeechRecognition={handleToggleSpeechRecognition}
                speechTranscript={speechTranscript}
              />
            </div>

            {/* Secret API Key Setup Prompt */}
            {!hasApiKey && (
              <div className="w-full max-w-xl mt-3 px-1">
                <button
                  type="button"
                  onClick={(e) => {
                    triggerVisualFx(e.clientX, e.clientY, '#eab308');
                    setIsApiKeyModalOpen(true);
                  }}
                  className="clickable-option w-full flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs hover:bg-amber-100/90 dark:hover:bg-amber-900/40 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                      <Key className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-semibold text-left">Click here to add your secret Groq API key</span>
                  </div>
                  <span className="font-bold text-[11px] underline text-amber-700 dark:text-amber-300 shrink-0 ml-2">Open Secret Box &rarr;</span>
                </button>
              </div>
            )}

            {/* Suggested Prompts Quick Chips */}
            <div className="w-full max-w-xl mt-6 px-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Popular inspirations</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  t.suggestedPrompt1 || 'Explain Quantum Physics simply',
                  t.suggestedPrompt2 || 'Write a high-converting email draft',
                  t.suggestedPrompt3 || 'Generate a creative sci-fi story',
                  t.suggestedPrompt4 || 'Analyze code & optimize performance',
                ].map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={(e) => {
                      triggerVisualFx(e.clientX, e.clientY, '#6366f1');
                      handleSendMessage(prompt);
                    }}
                    className="clickable-option text-left text-xs font-medium px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all active:scale-95"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* CONVERSATION VIEW */
          <div className="flex-1 flex flex-col justify-between py-2">
            <ChatView
              messages={messages}
              isStreaming={isStreaming}
              onLikeMessage={handleLikeMessage}
              onDislikeMessage={handleDislikeMessage}
              onShareChat={() => setActiveModal('share-chat')}
              voiceSettings={voiceSettings}
              activeSpeakingMsgId={activeSpeakingMsgId}
              onSpeakingChange={(msgId) => {
                setActiveSpeakingMsgId(msgId);
                setOrbState(msgId ? 'speaking' : 'idle');
              }}
            />
          </div>
        )}
      </main>

      {/* Sticky Bottom Input Bar when in conversation mode */}
      {hasMessages && (
        <div className="relative z-20 pb-2 pt-1 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 dark:to-transparent backdrop-blur-xs">
          <ChatInputBar
            onSendMessage={handleSendMessage}
            isStreaming={isStreaming}
            onOpenVoiceMode={() => setIsVoiceModeOpen(true)}
            onStartCameraVision={() => setActiveModal('vision-camera')}
            placeholder={t.askPlaceholder}
            isListening={isListeningInput}
            onToggleSpeechRecognition={handleToggleSpeechRecognition}
            speechTranscript={speechTranscript}
          />
        </div>
      )}

      {/* Sidebar Drawer (15 features + 10 theme switches) */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectAction={handleSelectDrawerAction}
        onSetThemeMode={(mode) => setAppearance((prev) => ({ ...prev, mode }))}
        onSelectTheme={(themeId) => {
          const targetTheme = getThemeById(themeId);
          setAppearance((prev) => ({
            ...prev,
            themeColor: themeId,
            mode: targetTheme.mode,
            customWallpaper: undefined, // Reset custom wallpaper so selected 10-theme immediately shows
            customWallpaperName: undefined,
          }));
        }}
        onSetCustomWallpaper={(wallpaperDataUrl, fileName) => {
          setAppearance((prev) => ({
            ...prev,
            customWallpaper: wallpaperDataUrl,
            customWallpaperName: fileName || 'Gallery Theme Picture',
          }));
        }}
        onRemoveCustomWallpaper={() => {
          setAppearance((prev) => ({
            ...prev,
            customWallpaper: undefined,
            customWallpaperName: undefined,
          }));
        }}
        t={t}
        currentLanguageName={selectedLanguage.name}
        currentLanguageFlag={selectedLanguage.flag}
        userProfile={userProfile}
        appearance={appearance}
        chatCount={sessions.length}
      />

      {/* MODALS */}
      {/* 1. Languages Modal */}
      <LanguagesModal
        isOpen={activeModal === 'languages'}
        onClose={() => setActiveModal(null)}
        currentLanguage={selectedLanguage}
        onSelectLanguage={(lang) => {
          setSelectedLanguage(lang);
          playTechClickSound('magic');
        }}
        t={t}
      />

      {/* 2. Chat History Modal */}
      <ChatHistoryModal
        isOpen={activeModal === 'history'}
        onClose={() => setActiveModal(null)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => setCurrentSessionId(id)}
        onRenameSession={(id, newTitle) => {
          setSessions((prev) =>
            prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
          );
        }}
        onRequestDeleteSession={(sessionToDelete) => {
          setConfirmDialogConfig({
            isOpen: true,
            title: t.confirmDeleteTitle,
            description: `Delete "${sessionToDelete.title}"?`,
            confirmLabel: t.delete,
            onConfirm: () => {
              setSessions((prev) => {
                const remaining = prev.filter((s) => s.id !== sessionToDelete.id);
                if (remaining.length === 0) {
                  const fresh: ChatSession = {
                    id: 'session-' + Date.now(),
                    title: 'New Conversation',
                    messages: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                  };
                  setCurrentSessionId(fresh.id);
                  return [fresh];
                }
                if (currentSessionId === sessionToDelete.id) {
                  setCurrentSessionId(remaining[0].id);
                }
                return remaining;
              });
            },
          });
        }}
        onRequestDeleteAll={handleRequestDeleteAll}
        onTogglePinSession={(id) => {
          setSessions((prev) =>
            prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
          );
        }}
        t={t}
      />

      {/* 3. Share Chat Modal */}
      <ShareChatModal
        isOpen={activeModal === 'share-chat'}
        onClose={() => setActiveModal(null)}
        session={currentSession}
        t={t}
      />

      {/* 4. Share App Modal */}
      <ShareAppModal
        isOpen={activeModal === 'share-app'}
        onClose={() => setActiveModal(null)}
        t={t}
      />

      {/* 5. Photo Editor & Studio Modal */}
      <PhotoEditorModal
        isOpen={activeModal === 'photo-studio'}
        onClose={() => setActiveModal(null)}
        onSendToChat={(imageData, caption) => {
          const photoAtt: Attachment = {
            id: 'photo-' + Date.now(),
            name: 'Enhanced_Photo.jpg',
            mimeType: 'image/jpeg',
            data: imageData,
            type: 'image',
          };
          handleSendMessage(caption || 'Here is my enhanced photo from SOYO Studio!', [photoAtt]);
        }}
        t={t}
      />

      {/* 6. AI Camera (Vision Mode) Modal */}
      <VisionCameraModal
        isOpen={activeModal === 'vision-camera'}
        onClose={() => setActiveModal(null)}
        onSendToChat={(imageData, analysisSummary) => {
          const cameraAtt: Attachment = {
            id: 'vision-' + Date.now(),
            name: 'Camera_Vision.jpg',
            mimeType: 'image/jpeg',
            data: imageData,
            type: 'image',
          };
          handleSendMessage(analysisSummary, [cameraAtt]);
        }}
        t={t}
        languageName={selectedLanguage.name}
      />

      {/* 7. Appearance Modal */}
      <AppearanceModal
        isOpen={activeModal === 'appearance'}
        onClose={() => setActiveModal(null)}
        appearance={appearance}
        onChangeAppearance={(updates) => setAppearance((prev) => ({ ...prev, ...updates }))}
        t={t}
      />

      {/* 8. Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={activeModal === 'voice-settings'}
        onClose={() => setActiveModal(null)}
        voiceSettings={voiceSettings}
        onChangeVoiceSettings={(updates) => setVoiceSettings((prev) => ({ ...prev, ...updates }))}
        t={t}
      />

      {/* 9. Account / Profile Modal */}
      <AccountModal
        isOpen={activeModal === 'account'}
        onClose={() => setActiveModal(null)}
        userProfile={userProfile}
        onUpdateProfile={(updates) => setUserProfile((prev) => ({ ...prev, ...updates }))}
        t={t}
        totalChatsCount={sessions.length}
      />

      {/* 10. Privacy & Data Modal */}
      <PrivacyDataModal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        onClearCache={handleClearCache}
        sessions={sessions}
        t={t}
      />

      {/* 11. Notifications Modal */}
      <NotificationsModal
        isOpen={activeModal === 'notifications'}
        onClose={() => setActiveModal(null)}
        t={t}
      />

      {/* 12. About & Help Modal */}
      <AboutHelpModal
        isOpen={activeModal === 'about'}
        onClose={() => setActiveModal(null)}
        t={t}
      />

      {/* 13. Interactive Continuous Voice Mode Modal (ChatGPT style) */}
      <VoiceModeModal
        isOpen={isVoiceModeOpen}
        onClose={() => setIsVoiceModeOpen(false)}
        onVoiceSubmitted={(text) => handleSendMessage(text)}
        languageCode={selectedLanguage.code}
        languageName={selectedLanguage.name}
        voiceSettings={voiceSettings}
        onTurnCompleted={(userText, aiReply) => {
          const userMsgId = 'msg-' + Date.now();
          const aiMsgId = 'msg-' + (Date.now() + 1);
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === currentSessionId) {
                return {
                  ...s,
                  title: s.messages.length === 0 ? userText.slice(0, 36) : s.title,
                  updatedAt: Date.now(),
                  messages: [
                    ...s.messages,
                    { id: userMsgId, role: 'user', content: userText, timestamp: Date.now() },
                    { id: aiMsgId, role: 'assistant', content: aiReply, timestamp: Date.now() + 1 },
                  ],
                };
              }
              return s;
            })
          );
        }}
      />

      {/* 14. Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialogConfig.isOpen}
        onClose={() => setConfirmDialogConfig((c) => ({ ...c, isOpen: false }))}
        onConfirm={confirmDialogConfig.onConfirm}
        title={confirmDialogConfig.title}
        description={confirmDialogConfig.description}
        confirmLabel={confirmDialogConfig.confirmLabel}
        t={t}
      />

      {/* 15. Groq API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen || activeModal === 'api-key'}
        onClose={() => {
          setIsApiKeyModalOpen(false);
          if (activeModal === 'api-key') setActiveModal(null);
        }}
        onKeyUpdated={checkKeyStatus}
      />

      {/* 16. Log In Modal for Users */}
      <LoginModal
        isOpen={isLoginModalOpen || activeModal === 'login'}
        onClose={() => {
          setIsLoginModalOpen(false);
          if (activeModal === 'login') setActiveModal(null);
        }}
        onLoginSuccess={(updates) => {
          setUserProfile((prev) => ({ ...prev, ...updates, isLoggedIn: true }));
        }}
        currentUserProfile={userProfile}
        t={t}
      />
    </div>
  );
}
