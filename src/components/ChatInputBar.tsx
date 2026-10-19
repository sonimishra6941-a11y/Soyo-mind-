import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  ArrowUp,
  Mic,
  MicOff,
  Image as ImageIcon,
  Camera,
  FileText,
  Paperclip,
  X,
} from 'lucide-react';
import { Attachment } from '../types';
import { triggerVisualFx, playTechClickSound } from '../utils/visualFx';

interface ChatInputBarProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isStreaming?: boolean;
  onOpenVoiceMode?: () => void;
  onStartCameraVision?: () => void;
  placeholder?: string;
  isListening?: boolean;
  onToggleSpeechRecognition?: () => void;
  speechTranscript?: string;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSendMessage,
  isStreaming = false,
  onOpenVoiceMode,
  onStartCameraVision,
  placeholder = 'Ask SOYO Mind anything...',
  isListening = false,
  onToggleSpeechRecognition,
  speechTranscript = '',
}) => {
  const [inputText, setInputText] = useState('');
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  // Sync speech recognition transcript if available
  useEffect(() => {
    if (speechTranscript) {
      setInputText((prev) => (prev ? `${prev} ${speechTranscript}` : speechTranscript));
    }
  }, [speechTranscript]);

  // Close plus menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setShowPlusMenu(false);
      }
    };
    if (showPlusMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPlusMenu]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 140)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed && attachments.length === 0) return;
    if (isStreaming) return;

    playTechClickSound('send');
    onSendMessage(trimmed, attachments);
    setInputText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Convert File to base64 Attachment
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file' | 'document') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const newAttachment: Attachment = {
            id: Date.now() + Math.random().toString(),
            name: file.name,
            mimeType: file.type || (type === 'image' ? 'image/jpeg' : 'application/octet-stream'),
            data: result,
            size: file.size,
            type,
          };
          setAttachments((prev) => [...prev, newAttachment]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
    setShowPlusMenu(false);
  };

  const removeAttachment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerVisualFx(e.clientX, e.clientY, '#ef4444');
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const canSend = (inputText.trim().length > 0 || attachments.length > 0) && !isStreaming;

  return (
    <div className="relative w-full max-w-2xl mx-auto px-4 py-2 select-none">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'file')}
      />
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'image')}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'image')}
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.txt,.doc,.docx,.csv,.json,.md"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'document')}
      />

      {/* Floating Plus Options Popup / Sheet */}
      {showPlusMenu && (
        <div
          ref={plusMenuRef}
          className="absolute bottom-20 left-4 z-50 w-72 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-2.5 space-y-1 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Add to conversation
          </div>

          {/* Option 1: Upload File */}
          <button
            type="button"
            onClick={(e) => {
              triggerVisualFx(e.clientX, e.clientY, '#3b82f6');
              fileInputRef.current?.click();
            }}
            className="clickable-option w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Paperclip className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Upload File</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Any file or data attachment</div>
            </div>
          </button>

          {/* Option 2: Upload Photo from Gallery */}
          <button
            type="button"
            onClick={(e) => {
              triggerVisualFx(e.clientX, e.clientY, '#8b5cf6');
              photoInputRef.current?.click();
            }}
            className="clickable-option w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Upload Photo from Gallery</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Photos, illustrations & artworks</div>
            </div>
          </button>

          {/* Option 3: Take Photo with Camera */}
          <button
            type="button"
            onClick={(e) => {
              triggerVisualFx(e.clientX, e.clientY, '#ec4899');
              if (onStartCameraVision) {
                setShowPlusMenu(false);
                onStartCameraVision();
              } else {
                cameraInputRef.current?.click();
              }
            }}
            className="clickable-option w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Take Photo with Camera</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Live snap & AI vision OCR</div>
            </div>
          </button>

          {/* Option 4: Upload Document */}
          <button
            type="button"
            onClick={(e) => {
              triggerVisualFx(e.clientX, e.clientY, '#10b981');
              docInputRef.current?.click();
            }}
            className="clickable-option w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Upload Document</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">PDF, Word, TXT, CSV, Code</div>
            </div>
          </button>
        </div>
      )}

      {/* Main Rounded Rectangle Input Bar Container */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-indigo-500/5 hover:border-indigo-400/50 dark:hover:border-indigo-600/50 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-200 p-2 sm:p-2.5">
        
        {/* Attached Files Carousel Preview */}
        {attachments.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 px-1 scrollbar-none">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 max-w-[200px] shrink-0"
              >
                {att.type === 'image' ? (
                  <img src={att.data} alt={att.name} className="w-6 h-6 rounded-md object-cover" />
                ) : (
                  <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                )}
                <span className="truncate max-w-[120px] font-medium">{att.name}</span>
                <button
                  type="button"
                  onClick={(e) => removeAttachment(att.id, e)}
                  className="clickable-option p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Left: Plus (+) Icon Button */}
          <button
            type="button"
            onClick={(e) => {
              triggerVisualFx(e.clientX, e.clientY, '#6366f1');
              setShowPlusMenu((prev) => !prev);
            }}
            aria-label="Add options"
            title="Upload Files, Photos & Documents"
            className={`clickable-option shrink-0 p-2 sm:p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all duration-200 ${
              showPlusMenu ? 'rotate-45 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' : ''
            }`}
          >
            <Plus className="w-5 h-5 stroke-[2.4]" />
          </button>

          {/* Center Text Area */}
          <div className="flex-1 min-w-0 py-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full bg-transparent resize-none border-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base leading-relaxed focus:outline-hidden max-h-36 py-1 px-1"
            />
          </div>

          {/* Right: Two Icons (1. Up Arrow Send, 2. Microphone Speak & Send) */}
          <div className="flex items-center gap-1 shrink-0 pb-0.5">
            {/* 1. Up Arrow (Send) button */}
            <button
              type="button"
              disabled={!canSend}
              onClick={(e) => {
                triggerVisualFx(e.clientX, e.clientY, canSend ? '#6366f1' : '#94a3b8');
                handleSend();
              }}
              aria-label="Send message"
              title="Send message"
              className={`clickable-option p-2 sm:p-2.5 rounded-full transition-all duration-200 ${
                canSend
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 hover:scale-105 active:scale-95 cursor-pointer'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
              }`}
            >
              <ArrowUp className="w-5 h-5 stroke-[2.4]" />
            </button>

            {/* 2. Microphone Icon (Speak and Send / Voice Mode) */}
            <button
              type="button"
              onClick={(e) => {
                triggerVisualFx(e.clientX, e.clientY, isListening ? '#ef4444' : '#8b5cf6');
                if (onToggleSpeechRecognition) {
                  onToggleSpeechRecognition();
                } else if (onOpenVoiceMode) {
                  onOpenVoiceMode();
                }
              }}
              aria-label={isListening ? 'Stop listening' : 'Speak and Send'}
              title={isListening ? 'Stop recording voice' : 'Speak and Send with Voice'}
              className={`clickable-option p-2 sm:p-2.5 rounded-full transition-all duration-200 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95'
              }`}
            >
              {isListening ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 stroke-[2.2] text-indigo-600 dark:text-indigo-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
