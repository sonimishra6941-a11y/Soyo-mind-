// Speech-to-Text & Text-to-Speech service for SOYO Mind

export interface SpeechVoiceOption {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  gender: 'female' | 'male' | 'neutral';
}

class SpeechService {
  private recognition: any = null;
  private isRecognizing = false;

  constructor() {
    this.initRecognition();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.getVoices();
      };
    }
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

  // Text-To-Speech
  public getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices();
  }

  public speak(
    text: string,
    speed: number = 1.0,
    pitch: number = 1.0,
    voiceIndex: number = -1,
    onEnd?: () => void,
    onBoundary?: (charIndex: number, charLength?: number) => void,
    onStart?: () => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Clean markdown symbols for cleaner speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_#~>[\]]/g, '')
      .slice(0, 3000); // Cap for responsiveness

    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = Math.max(0.7, Math.min(speed, 1.8));
    utterance.pitch = Math.max(0.6, Math.min(pitch, 1.4));

    const voices = this.getVoices();
    if (voices.length > 0) {
      if (voiceIndex >= 0 && voiceIndex < voices.length) {
        utterance.voice = voices[voiceIndex];
      }
    }

    if (onStart) {
      utterance.onstart = onStart;
    }

    if (onBoundary) {
      utterance.onboundary = (event: SpeechSynthesisEvent) => {
        onBoundary(event.charIndex, (event as any).charLength || 0);
      };
    }

    if (onEnd) {
      utterance.onend = () => {
        onEnd();
      };
      utterance.onerror = () => {
        onEnd();
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
