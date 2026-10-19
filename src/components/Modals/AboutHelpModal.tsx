import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Star,
  Send,
  Sparkles,
  ChevronDown,
  Check,
  Mail,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TranslationKeys } from '../../types';
import { triggerVisualFx } from '../../utils/visualFx';

interface AboutHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationKeys;
}

type TabType = 'about' | 'how-to-use' | 'faq' | 'support' | 'rate';

export const AboutHelpModal: React.FC<AboutHelpModalProps> = ({ isOpen, onClose, t }) => {
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [supportMessage, setSupportMessage] = useState<string>('');
  const [supportSent, setSupportSent] = useState<boolean>(false);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'What is SOYO Mind VAI?',
      a: 'SOYO Mind - A Virtual Artificial Intelligence (VAI) is a state-of-the-art multimodal AI assistant capable of reasoning, answering questions, live camera vision OCR, photo editing, and multilingual conversations across 100+ languages.',
    },
    {
      q: 'How does live camera Vision Mode work?',
      a: 'Vision Mode captures high-definition frames from your camera and uses Gemini 3.8 Flash multimodal intelligence to detect objects, transcribe text via OCR, describe scenes, and identify plants, animals, and items in real time.',
    },
    {
      q: 'How can I change the language?',
      a: 'Open the hamburger menu (≡) on the top-left, select "Languages", and pick from over 100+ world languages. The entire app UI and AI conversational tone will switch seamlessly.',
    },
    {
      q: 'Can I export my conversations as PDF or Image?',
      a: 'Yes! Tap the Share icon on any response or select "Share Chat" from the menu to download your chat as formatted Plain Text, PDF document, or a branded PNG image card.',
    },
  ];

  const handleStarRating = (stars: number, e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#f59e0b');
    setRating(stars);
    setRatingSubmitted(true);
    // Fire celebratory confetti!
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportSent(true);
    setTimeout(() => {
      setSupportSent(false);
      setSupportMessage('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[88vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.aboutHelp}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                SOYO Mind VAI Pro • v3.2.0
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

        {/* Tab Navigation */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-slate-50/50 dark:bg-slate-900/50">
          {[
            { id: 'about', label: 'About App' },
            { id: 'how-to-use', label: t.howToUse },
            { id: 'faq', label: 'FAQ' },
            { id: 'support', label: 'Support' },
            { id: 'rate', label: t.rateApp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={(e) => {
                triggerVisualFx(e.clientX, e.clientY, '#6366f1');
                setActiveTab(tab.id as TabType);
              }}
              className={`clickable-option px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          {activeTab === 'about' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  SOYO Mind VAI
                </h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  A Virtual Artificial Intelligence
                </p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800">
                  Version 3.2.0 • Pro Edition
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
                Built with next-generation deep reasoning, multimodal vision, real-time audio synthesis, and native translation across all global languages.
              </p>
              <div className="pt-2 grid grid-cols-2 gap-2 text-left text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">Engine</div>
                  <div className="text-slate-500 text-[11px]">Groq Llama 3.1 High-Speed</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">Languages</div>
                  <div className="text-slate-500 text-[11px]">100+ World Languages</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'how-to-use' && (
            <div className="space-y-3">
              {[
                {
                  step: '1',
                  title: 'Start Chatting',
                  desc: 'Ask questions, request code, compose stories, or brainstorm ideas directly from the main search bar.',
                },
                {
                  step: '2',
                  title: 'Attach Media & Photos',
                  desc: 'Tap the "+" icon in the search bar to upload files, gallery photos, live camera snaps, or documents.',
                },
                {
                  step: '3',
                  title: 'Photo Studio & Vision',
                  desc: 'Use "Edit & Enhance Photo" for filters, background removal, and upscale, or "AI Camera" for live OCR.',
                },
                {
                  step: '4',
                  title: 'Voice Conversations',
                  desc: 'Tap the Microphone icon to speak your questions and enable auto-read to hear answers aloud.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-2">
              {faqs.map((faq, i) => {
                const isExpanded = expandedFaq === i;
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : i)}
                      className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="p-3.5 pt-0 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'support' && (
            <form onSubmit={handleSendSupport} className="space-y-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Need help or have a feature request? Our engineering team is here for you.
              </div>
              <textarea
                rows={4}
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Describe your question or feedback in detail..."
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
              {supportSent ? (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Support inquiry received! We'll reply to your account email.</span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="clickable-option w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </button>
              )}
            </form>
          )}

          {activeTab === 'rate' && (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-500 flex items-center justify-center mx-auto">
                <Star className="w-6 h-6 fill-amber-500" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {t.rateUsTitle || 'Enjoying SOYO Mind VAI?'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your feedback fuels our artificial intelligence evolution.
                </p>
              </div>

              {/* 5-Star interactive selector */}
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={(e) => handleStarRating(star, e)}
                    className="clickable-option p-1 transition-transform hover:scale-125 active:scale-95"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {ratingSubmitted && (
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 font-bold animate-in fade-in">
                  🎉 {t.thankYouRating || 'Thank you for your rating! You make SOYO Mind better.'}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
