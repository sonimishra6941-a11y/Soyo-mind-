export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  data: string; // base64
  size?: number;
  type: 'image' | 'file' | 'document';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  feedback?: 'like' | 'dislike' | null;
  streaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
}

export interface LanguageItem {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  isLoggedIn: boolean;
  memberTier: 'Free' | 'Pro' | 'Ultra';
  createdAt: string;
}

export interface AppearanceSettings {
  mode: 'light' | 'dark' | 'system';
  themeColor: 'blue-purple' | 'electric-cyan' | 'royal-violet' | 'emerald-glow';
  fontSize: 'small' | 'medium' | 'large';
}

export interface VoiceSettings {
  voiceGender: 'female' | 'male';
  voiceIndex: number;
  speed: number; // 0.75 to 1.5
  pitch: number; // 0.8 to 1.2
  autoReadResponses: boolean;
}

export interface VisionAnalysisResult {
  description: string;
  objects: string[];
  detectedText: string;
  labels: string[];
  suggestedQuestions: string[];
}

export type { TranslationKeys } from '../data/translations';
