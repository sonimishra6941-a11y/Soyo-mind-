// Unique visual click effect system for SOYO Mind AI app
// Spawns energetic quantum ripple rings and floating starlight sparks

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  color: string;
  maxRadius: number;
}

// Subtle high-tech audio chime using Web Audio API
let audioCtx: AudioContext | null = null;

export function playTechClickSound(type: 'tap' | 'open' | 'send' | 'magic' = 'tap') {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    if (type === 'tap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.04);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'send') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'magic') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659, now);
      osc.frequency.exponentialRampToValueAtTime(987, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(1318, now + 0.18);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export function triggerHaptic(duration = 15) {
  try {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  } catch {
    // Not supported or not allowed
  }
}

// Global dispatcher to broadcast click effect coordinates
export function triggerVisualFx(x: number, y: number, color?: string) {
  triggerHaptic(12);
  playTechClickSound('tap');
  window.dispatchEvent(
    new CustomEvent('soyo-click-fx', {
      detail: { x, y, color: color || 'rgba(99, 102, 241, 0.75)' },
    })
  );
}
