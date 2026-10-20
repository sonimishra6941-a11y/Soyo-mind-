// Speech-to-Text & Text-to-Speech service for SOYO Mind
// Calibrated for authentic Jarvis AI deep male persona & speech synthesis

export interface SpeechVoiceOption {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  gender: 'female' | 'male' | 'neutral';
  isJarvisCandidate?: boolean;
}

import { VoiceToneId, TEN_VOICE_PROFILES } from '../data/voiceTones';

export interface SpeakOptions {
  speed?: number;
  pitch?: number;
  voiceIndex?: number;
  voiceGender?: 'female' | 'male';
  voiceName?: string;
  preset?: string;
  voiceTone?: VoiceToneId;
  onEnd?: () => void;
  onBoundary?: (charIndex: number, charLength?: number) => void;
  onStart?: () => void;
}

// Known male voice indicators across Chromium, Safari, Edge, Windows, macOS, Android
const MALE_INDICATORS = [
  /\bmale\b/i,
  /\bman\b/i,
  /\bhomme\b/i,
  /\bhombre\b/i,
  /\bmasculin/i,
  /\bgeorge\b/i,
  /\bdaniel\b/i,
  /\bdavid\b/i,
  /\bguy\b/i,
  /\bmark\b/i,
  /\bryan\b/i,
  /\balex\b/i,
  /\bfred\b/i,
  /\btom\b/i,
  /\baaron\b/i,
  /\boliver\b/i,
  /\barthur\b/i,
  /\bgordon\b/i,
  /\brichard\b/i,
  /\bjames\b/i,
  /\bjarvis\b/i,
  /#male/i,
  /uk english male/i,
  /us english male/i,
];

// Known female voice indicators
const FEMALE_INDICATORS = [
  /\bfemale\b/i,
  /\bwoman\b/i,
  /\bfemme\b/i,
  /\bmujer\b/i,
  /\bfeminin/i,
  /\bzira\b/i,
  /\bhazel\b/i,
  /\bsamantha\b/i,
  /\bvictoria\b/i,
  /\bkaren\b/i,
  /\bsusan\b/i,
  /\bcatherine\b/i,
  /\bheera\b/i,
  /\bveena\b/i,
  /\bjenny\b/i,
  /\baria\b/i,
  /\beva\b/i,
  /\bfiona\b/i,
  /\btessa\b/i,
  /\bava\b/i,
  /\bserena\b/i,
  /\bsiri.*female\b/i,
  /#female/i,
];

// Specific Jarvis-style voices: British English male voices or authoritative deep US male voices
const JARVIS_PRIORITY_PATTERNS = [
  /microsoft george/i,
  /google uk english male/i,
  /daniel/i,
  /oliver/i,
  /arthur/i,
  /en-gb.*male/i,
  /british.*male/i,
  /guy online/i,
  /microsoft guy/i,
  /microsoft david/i,
  /microsoft mark/i,
  /alex/i,
  /google us english male/i,
];

class SpeechService {
  private recognition: any = null;
  private isRecognizing = false;

  // Active configuration: defaults to male Jarvis AI
  private activeSettings = {
    voiceGender: 'male' as 'female' | 'male',
    voiceIndex: -1,
    speed: 1.02,
    pitch: 0.88, // 0.88 gives the resonant, deep male tone of Jarvis
    voiceName: '',
    preset: 'jarvis',
    voiceTone: 'jarvis-deep' as VoiceToneId,
  };

  constructor() {
    this.initRecognition();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.getVoices();
      };
    }
  }

  public updateSettings(settings: {
    voiceGender?: 'female' | 'male';
    voiceIndex?: number;
    speed?: number;
    pitch?: number;
    voiceName?: string;
    preset?: string;
    voiceTone?: VoiceToneId;
  }) {
    this.activeSettings = {
      ...this.activeSettings,
      ...settings,
    };
  }

  public getActiveSettings() {
    return { ...this.activeSettings };
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: any) => void,
    onEnd: () => void,
    language: string = 'en-US'
  ) {
    if (!this.recognition) {
      onError(new Error('Speech recognition is not supported in this browser environment.'));
      return;
    }

    if (this.isRecognizing) {
      try {
        this.recognition.stop();
      } catch {}
    }

    this.recognition.lang = language;

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      onResult(final || interim, !!final);
    };

    this.recognition.onerror = (event: any) => {
      this.isRecognizing = false;
      onError(event.error);
    };

    this.recognition.onend = () => {
      this.isRecognizing = false;
      onEnd();
    };

    try {
      this.recognition.start();
      this.isRecognizing = true;
    } catch (e) {
      this.isRecognizing = false;
      onError(e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isRecognizing) {
      try {
        this.recognition.stop();
      } catch {}
      this.isRecognizing = false;
    }
  }

  // Text-To-Speech voice detection & management
  public getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices();
  }

  public isMaleVoice(voice: SpeechSynthesisVoice): boolean {
    const fullName = `${voice.name} ${voice.lang}`.toLowerCase();

    // Check if definitely female first
    for (const pat of FEMALE_INDICATORS) {
      if (pat.test(fullName)) return false;
    }

    // Check male patterns
    for (const pat of MALE_INDICATORS) {
      if (pat.test(fullName)) return true;
    }

    return false;
  }

  public isFemaleVoice(voice: SpeechSynthesisVoice): boolean {
    const fullName = `${voice.name} ${voice.lang}`.toLowerCase();
    for (const pat of FEMALE_INDICATORS) {
      if (pat.test(fullName)) return true;
    }
    return false;
  }

  public isJarvisCandidate(voice: SpeechSynthesisVoice): boolean {
    const fullName = `${voice.name} ${voice.lang}`.toLowerCase();
    for (const pat of JARVIS_PRIORITY_PATTERNS) {
      if (pat.test(fullName)) return true;
    }
    return false;
  }

  public scoreVoiceForJarvis(voice: SpeechSynthesisVoice): number {
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();
    let score = 0;

    // Highest preference: British English male voices (Jarvis AI archetype)
    if (name.includes('george') || name.includes('daniel') || name.includes('uk english male')) {
      score += 150;
    } else if (name.includes('oliver') || name.includes('arthur')) {
      score += 130;
    } else if (name.includes('guy') || name.includes('david') || name.includes('mark')) {
      score += 100;
    } else if (name.includes('alex') || name.includes('ryan') || name.includes('fred')) {
      score += 80;
    }

    if (lang.startsWith('en-gb')) {
      score += 60;
    } else if (lang.startsWith('en')) {
      score += 40;
    }

    if (this.isMaleVoice(voice)) {
      score += 50;
    }

    if (this.isFemaleVoice(voice)) {
      score -= 500;
    }

    return score;
  }

  // Returns all identified male voices sorted with top Jarvis candidates first
  public getMaleVoices(): SpeechSynthesisVoice[] {
    const voices = this.getVoices();
    const maleVoices = voices.filter((v) => this.isMaleVoice(v));
    return maleVoices.sort((a, b) => this.scoreVoiceForJarvis(b) - this.scoreVoiceForJarvis(a));
  }

  // Finds the single best Jarvis-like male voice in this browser
  public findJarvisVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices.length) return null;

    let bestVoice: SpeechSynthesisVoice | null = null;
    let highestScore = -999;

    for (const voice of voices) {
      const score = this.scoreVoiceForJarvis(voice);
      if (score > highestScore) {
        highestScore = score;
        bestVoice = voice;
      }
    }

    // If the best voice scored above 0, return it
    if (bestVoice && highestScore > 0) {
      return bestVoice;
    }

    // Fallback: any voice that isn't female
    const nonFemale = voices.find((v) => !this.isFemaleVoice(v) && v.lang.startsWith('en'));
    return nonFemale || voices[0] || null;
  }

  // Finds the best male voice for a given target language
  public findBestMaleVoice(preferredLang?: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices.length) return null;

    if (preferredLang) {
      const prefix = preferredLang.slice(0, 2).toLowerCase();
      const match = voices.find(
        (v) => v.lang.toLowerCase().startsWith(prefix) && this.isMaleVoice(v)
      );
      if (match) return match;
    }

    return this.findJarvisVoice();
  }

  public findFemaleVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    const female = voices.find((v) => this.isFemaleVoice(v) && v.lang.startsWith('en'));
    return female || voices.find((v) => this.isFemaleVoice(v)) || null;
  }

  // Speak method supporting both signature overloads (flexible options or legacy arguments)
  public speak(
    text: string,
    speedOrOptions?: number | SpeakOptions,
    pitch?: number,
    voiceIndex?: number,
    onEnd?: () => void,
    onBoundary?: (charIndex: number, charLength?: number) => void,
    onStart?: () => void,
    voiceGender?: 'female' | 'male',
    voiceName?: string
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    let speedVal = this.activeSettings.speed;
    let pitchVal = this.activeSettings.pitch;
    let voiceIndexVal = this.activeSettings.voiceIndex;
    let voiceGenderVal = this.activeSettings.voiceGender;
    let voiceNameVal = this.activeSettings.voiceName;
    let onEndCb = onEnd;
    let onBoundaryCb = onBoundary;
    let onStartCb = onStart;

    if (typeof speedOrOptions === 'object' && speedOrOptions !== null) {
      if (speedOrOptions.voiceTone) {
        const tone = TEN_VOICE_PROFILES.find((p) => p.id === speedOrOptions.voiceTone);
        if (tone) {
          pitchVal = tone.pitch;
          speedVal = tone.speed;
          voiceGenderVal = tone.gender;
        }
      }
      if (speedOrOptions.speed !== undefined) speedVal = speedOrOptions.speed;
      if (speedOrOptions.pitch !== undefined) pitchVal = speedOrOptions.pitch;
      if (speedOrOptions.voiceIndex !== undefined) voiceIndexVal = speedOrOptions.voiceIndex;
      if (speedOrOptions.voiceGender !== undefined) voiceGenderVal = speedOrOptions.voiceGender;
      if (speedOrOptions.voiceName !== undefined) voiceNameVal = speedOrOptions.voiceName;
      if (speedOrOptions.onEnd) onEndCb = speedOrOptions.onEnd;
      if (speedOrOptions.onBoundary) onBoundaryCb = speedOrOptions.onBoundary;
      if (speedOrOptions.onStart) onStartCb = speedOrOptions.onStart;
    } else if (typeof speedOrOptions === 'number') {
      speedVal = speedOrOptions;
      if (pitch !== undefined) pitchVal = pitch;
      if (voiceIndex !== undefined) voiceIndexVal = voiceIndex;
      if (voiceGender !== undefined) voiceGenderVal = voiceGender;
      if (voiceName !== undefined) voiceNameVal = voiceName;
    }

    // Clean markdown symbols for natural speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_#~>[\]]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .slice(0, 3500);

    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = this.getVoices();

    let targetVoice: SpeechSynthesisVoice | null = null;

    // 1. If an exact voice name was selected
    if (voiceNameVal) {
      targetVoice = voices.find((v) => v.name.toLowerCase() === voiceNameVal.toLowerCase()) || null;
    }

    // 2. If a specific voice index was selected
    if (!targetVoice && voiceIndexVal >= 0 && voiceIndexVal < voices.length) {
      targetVoice = voices[voiceIndexVal];
    }

    // 3. CRITICAL: If male voice is requested (default for Jarvis AI)
    // Make sure we select an authentic male voice and avoid female browser defaults
    if (voiceGenderVal === 'male') {
      // If no targetVoice selected yet or the selected voice happens to be female:
      if (!targetVoice || this.isFemaleVoice(targetVoice)) {
        targetVoice = this.findJarvisVoice();
      }

      // If user kept pitch at neutral 1.0, adjust to 0.88 for signature deep resonant Jarvis timbre
      if (pitchVal >= 0.98) {
        pitchVal = 0.88;
      }
    } else if (voiceGenderVal === 'female') {
      if (!targetVoice || this.isMaleVoice(targetVoice)) {
        targetVoice = this.findFemaleVoice();
      }
    }

    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    // Set voice properties
    utterance.rate = Math.max(0.7, Math.min(speedVal, 1.6));
    utterance.pitch = Math.max(0.5, Math.min(pitchVal, 1.4));

    if (onStartCb) {
      utterance.onstart = onStartCb;
    }

    if (onBoundaryCb) {
      utterance.onboundary = (event: SpeechSynthesisEvent) => {
        onBoundaryCb(event.charIndex, (event as any).charLength || 0);
      };
    }

    if (onEndCb) {
      utterance.onend = () => {
        onEndCb();
      };
      utterance.onerror = () => {
        onEndCb();
      };
    }

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public isSpeaking(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    return window.speechSynthesis.speaking;
  }
}

export const speechService = new SpeechService();
