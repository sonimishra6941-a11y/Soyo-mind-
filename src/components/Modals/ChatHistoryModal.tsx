import React, { useState } from 'react';
import {
  X,
  Search,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  Pin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ChatSession, TranslationKeys } from '../../types';
import { triggerVisualFx } from '../../utils/visualFx';

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onRequestDeleteSession: (session: ChatSession) => void;
  onRequestDeleteAll: () => void;
  onTogglePinSession: (id: string) => void;
  t: TranslationKeys;
}

export const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onRenameSession,
  onRequestDeleteSession,
  onRequestDeleteAll,
  onTogglePinSession,
  t,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  });

  const handleStartRename = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerVisualFx(e.clientX, e.clientY, '#6366f1');
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerVisualFx(e.clientX, e.clientY, '#10b981');
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.chatHistory}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {sessions.length} recorded session{sessions.length === 1 ? '' : 's'}
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

        {/* Search Bar & Clear All Action */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat history..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-purple-500"
            />
          </div>
          {sessions.length > 0 && (
            <button
              onClick={(e) => {
                triggerVisualFx(e.clientX, e.clientY, '#ef4444');
                onRequestDeleteAll();
              }}
              title="Delete All Chats"
              className="clickable-option px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.deleteAllChats}</span>
            </button>
          )}
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
          {filteredSessions.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-500" />
              <p className="text-sm font-medium">{t.noChatsYet}</p>
              <p className="text-xs mt-1 text-slate-400">{t.startNewChatPrompt}</p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const isEditing = editingId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={(e) => {
                    triggerVisualFx(e.clientX, e.clientY, '#8b5cf6');
                    onSelectSession(session.id);
                    onClose();
                  }}
                  className={`clickable-option group relative flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-50/90 dark:bg-purple-950/50 border-purple-300 dark:border-purple-800 shadow-xs'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-900 border border-purple-500 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(session.id, e as any);
                          }}
                        />
                        <button
                          onClick={(e) => handleSaveRename(session.id, e)}
                          className="clickable-option p-1.5 rounded-lg bg-emerald-500 text-white"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          {session.pinned && (
                            <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                          )}
                          <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                            {session.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{session.messages.length} messages</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions: Pin, Rename, Delete */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerVisualFx(e.clientX, e.clientY, '#f59e0b');
                          onTogglePinSession(session.id);
                        }}
                        title={session.pinned ? 'Unpin' : 'Pin to top'}
                        className="clickable-option p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Pin className={`w-3.5 h-3.5 ${session.pinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => handleStartRename(session, e)}
                        title="Rename chat"
                        className="clickable-option p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerVisualFx(e.clientX, e.clientY, '#ef4444');
                          onRequestDeleteSession(session);
                        }}
                        title="Delete chat"
                        className="clickable-option p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
