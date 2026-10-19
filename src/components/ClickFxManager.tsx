import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  color: string;
}

export const ClickFxManager: React.FC = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Listen for custom event or pointerdown on any button/interactive element
    const handleGlobalPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if clicked element or its parent is interactive (button, a, role=button, option, chip, input icon)
      const interactiveEl = target.closest('button, [role="button"], a, input[type="file"], select, .clickable-option');
      if (interactiveEl) {
        spawnFx(e.clientX, e.clientY);
      }
    };

    const handleCustomFx = (e: CustomEvent) => {
      const { x, y, color } = e.detail;
      spawnFx(x, y, color);
    };

    window.addEventListener('pointerdown', handleGlobalPointerDown, { passive: true });
    window.addEventListener('soyo-click-fx' as any, handleCustomFx as any);

    return () => {
      window.removeEventListener('pointerdown', handleGlobalPointerDown);
      window.removeEventListener('soyo-click-fx' as any, handleCustomFx as any);
    };
  }, []);

  const spawnFx = (x: number, y: number, customColor?: string) => {
    const rippleId = Date.now() + Math.random();
    const colors = [
      '#6366f1', // Indigo
      '#a855f7', // Purple
      '#3b82f6', // Blue
      '#06b6d4', // Cyan
      '#ec4899', // Pink
    ];
    const pickedColor = customColor || colors[Math.floor(Math.random() * colors.length)];

    setRipples((prev) => [...prev.slice(-6), { id: rippleId, x, y, color: pickedColor }]);

    // Spawn 8 starlight sparks
    const newSparks: Particle[] = Array.from({ length: 8 }, (_, i) => {
      const angle = (i * Math.PI * 2) / 8 + (Math.random() - 0.5) * 0.4;
      const speed = 25 + Math.random() * 40;
      return {
        id: rippleId + i,
        x,
        y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color: colors[i % colors.length],
      };
    });

    setParticles((prev) => [...prev.slice(-24), ...newSparks]);

    // Clean up
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      setParticles((prev) => prev.filter((p) => !newSparks.some((s) => s.id === p.id)));
    }, 700);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Expanding Ripple Rings */}
      {ripples.map((r) => (
        <div
          key={r.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: r.x, top: r.y }}
        >
          {/* Main glowing pulse */}
          <span
            className="block rounded-full animate-ping opacity-75 blur-[1px]"
            style={{
              width: 48,
              height: 48,
              backgroundColor: r.color,
              boxShadow: `0 0 20px 6px ${r.color}`,
              animationDuration: '600ms',
            }}
          />
          {/* Outer sharp expanding ring */}
          <span
            className="absolute inset-0 rounded-full border-2 opacity-90 transition-transform duration-500 ease-out"
            style={{
              borderColor: r.color,
              transform: 'scale(2.4)',
              opacity: 0,
            }}
          />
        </div>
      ))}

      {/* Floating Starlight Spark Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full transition-all duration-500 ease-out pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}`,
            transform: `translate(${p.dx}px, ${p.dy}px) scale(0)`,
            opacity: 0,
            transitionProperty: 'transform, opacity',
            transitionDuration: '650ms',
          }}
        />
      ))}
    </div>
  );
};
