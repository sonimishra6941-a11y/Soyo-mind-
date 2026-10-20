import React, { useMemo } from 'react';
import { triggerVisualFx } from '../utils/visualFx';
import { getThemeById } from '../data/themes';

interface AiOrbProps {
  state?: 'idle' | 'listening' | 'thinking' | 'speaking';
  greetingTitle?: string;
  subtitle?: string;
  onClick?: () => void;
  size?: 'normal' | 'compact';
  themeId?: string;
}

export const AiOrb: React.FC<AiOrbProps> = ({
  state = 'idle',
  greetingTitle,
  subtitle,
  onClick,
  size = 'normal',
  themeId = 'royal-midnight-purple',
}) => {
  const currentTheme = useMemo(() => getThemeById(themeId), [themeId]);

  // Compute time-based greeting if not provided
  const greeting = useMemo(() => {
    if (greetingTitle) return greetingTitle;
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'hello !user';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  }, [greetingTitle]);

  const orbSizeClasses = size === 'normal' ? 'w-44 h-44 sm:w-52 sm:h-52' : 'w-28 h-28';

  const handleClick = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, currentTheme.primaryColor);
    onClick?.();
  };

  const isDarkTheme = currentTheme.mode === 'dark';

  return (
    <div className="flex flex-col items-center justify-center text-center select-none py-4 px-4 transition-all duration-300">
      {/* Orb Container with multi-layered liquid gradients */}
      <div
        onClick={handleClick}
        className={`relative ${orbSizeClasses} flex items-center justify-center cursor-pointer group active:scale-95 transition-transform duration-300`}
        role="button"
        tabIndex={0}
        aria-label={`SOYO Mind AI Core Orb - ${currentTheme.name}`}
      >
        {/* Ambient atmospheric pulse glow */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl opacity-75 transition-all duration-700 ${
            state === 'listening'
              ? 'bg-rose-500/50 scale-125 animate-pulse'
              : state === 'thinking'
              ? 'bg-amber-500/50 scale-125 animate-spin'
              : state === 'speaking'
              ? 'bg-cyan-500/60 scale-130 animate-pulse'
              : `${currentTheme.orb.outerGlow} group-hover:scale-115`
          }`}
        />

        {/* Outer fluid rotating liquid membrane */}
        <div
          className={`absolute inset-1 rounded-[42%_58%_70%_30%/45%_45%_55%_55%] opacity-85 transition-all duration-1000 animate-[spin_12s_linear_infinite] ${
            state === 'listening'
              ? 'bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-500'
              : currentTheme.orb.membrane1
          }`}
          style={{ filter: 'blur(2px)' }}
        />

        {/* Counter-rotating morphing liquid shape */}
        <div
          className={`absolute inset-2 rounded-[58%_42%_38%_62%/54%_61%_39%_46%] opacity-90 animate-[spin_8s_linear_infinite_reverse] ${
            currentTheme.orb.membrane2
          }`}
          style={{ mixBlendMode: isDarkTheme ? 'screen' : 'multiply' }}
        />

        {/* Inner brilliant glowing core */}
        <div
          className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr ${currentTheme.orb.coreGradient} flex items-center justify-center overflow-hidden transition-all duration-500`}
          style={{
            boxShadow: `inset 0 0 24px rgba(255,255,255,0.9), 0 0 35px ${currentTheme.orb.coreShadow}`,
          }}
        >
          {/* Surface light reflection highlight */}
          <div className="absolute top-2 left-3 w-10 h-6 bg-white/70 rounded-full blur-[2px] transform -rotate-45 pointer-events-none" />

          {/* Central AI Mind Core Emblem */}
          <div
            className="relative z-10 flex flex-col items-center justify-center"
            style={{ color: currentTheme.primaryColor }}
          >
            {state === 'listening' ? (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-6 bg-rose-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-9 bg-purple-700 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full animate-bounce" />
              </div>
            ) : state === 'thinking' ? (
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: currentTheme.primaryColor, borderTopColor: 'transparent' }}
              />
            ) : state === 'speaking' ? (
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-4 rounded-full animate-pulse"
                  style={{ backgroundColor: currentTheme.primaryColor }}
                />
                <span
                  className="w-1.5 h-8 rounded-full animate-pulse [animation-delay:0.2s]"
                  style={{ backgroundColor: currentTheme.secondaryColor }}
                />
                <span
                  className="w-1.5 h-5 rounded-full animate-pulse [animation-delay:0.4s]"
                  style={{ backgroundColor: currentTheme.primaryColor }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" opacity="0.15" />
                  <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.83-1.83C9.17 19.68 10.53 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
                </svg>
                <span
                  className="text-[10px] font-bold tracking-widest uppercase mt-0.5"
                  style={{ color: currentTheme.primaryColor }}
                >
                  SOYO
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Orbiting celestial energy specks in theme palette */}
        <span
          className="absolute top-1 right-5 w-2 h-2 rounded-full animate-ping [animation-duration:3s]"
          style={{
            backgroundColor: currentTheme.orb.particles[0],
            boxShadow: `0 0 8px ${currentTheme.orb.particles[0]}`,
          }}
        />
        <span
          className="absolute bottom-4 left-6 w-2.5 h-2.5 rounded-full animate-pulse"
          style={{
            backgroundColor: currentTheme.orb.particles[1],
            boxShadow: `0 0 10px ${currentTheme.orb.particles[1]}`,
          }}
        />
      </div>

      {/* Greeting and Inquiry Text */}
      <div className="mt-5 max-w-md px-2">
        <h1
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center justify-center gap-1.5 flex-wrap drop-shadow-xs ${
            isDarkTheme ? 'text-white' : 'text-slate-900'
          }`}
        >
          <span>{greeting}</span>
        </h1>
        <p
          className={`mt-1.5 text-base sm:text-lg font-medium drop-shadow-2xs ${
            isDarkTheme ? 'text-slate-200' : 'text-slate-700'
          }`}
        >
          {subtitle || 'How can I help you today?'}
        </p>
      </div>
    </div>
  );
};
