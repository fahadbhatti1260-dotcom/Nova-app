import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Volume2, Sparkles, Loader2 } from 'lucide-react';
import { VoiceState } from '../types';

interface VoiceOrbProps {
  state: VoiceState;
  volumeLevel: number;
  onClick: () => void;
  themeColor: string;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  state,
  volumeLevel,
  onClick,
  themeColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Theme color palettes
  const getThemeGlow = () => {
    switch (themeColor) {
      case 'purple':
        return {
          primary: 'rgba(168, 85, 247, 0.85)',
          secondary: 'rgba(217, 70, 239, 0.6)',
          ambient: 'rgba(147, 51, 234, 0.25)',
          border: '#c084fc',
        };
      case 'emerald':
        return {
          primary: 'rgba(16, 185, 129, 0.85)',
          secondary: 'rgba(52, 211, 153, 0.6)',
          ambient: 'rgba(5, 150, 105, 0.25)',
          border: '#34d399',
        };
      case 'amber':
        return {
          primary: 'rgba(245, 158, 11, 0.85)',
          secondary: 'rgba(251, 191, 36, 0.6)',
          ambient: 'rgba(217, 119, 6, 0.25)',
          border: '#fbbf24',
        };
      case 'rose':
        return {
          primary: 'rgba(244, 63, 94, 0.85)',
          secondary: 'rgba(251, 113, 133, 0.6)',
          ambient: 'rgba(225, 29, 72, 0.25)',
          border: '#fb7185',
        };
      case 'cyan':
      default:
        return {
          primary: 'rgba(6, 182, 212, 0.85)',
          secondary: 'rgba(56, 189, 248, 0.6)',
          ambient: 'rgba(14, 165, 233, 0.25)',
          border: '#38bdf8',
        };
    }
  };

  const colors = getThemeGlow();

  // Canvas Wave Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 38;

      // Calculate dynamic radius expansion based on state and microphone volume
      let dynamicBoost = 0;
      if (state === 'listening') {
        dynamicBoost = volumeLevel * 24 + Math.sin(phase * 4) * 4;
      } else if (state === 'speaking') {
        dynamicBoost = Math.sin(phase * 5) * 8 + Math.cos(phase * 3) * 6;
      } else if (state === 'processing') {
        dynamicBoost = Math.sin(phase * 8) * 5;
      }

      // Draw background ambient halo
      const radialGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.4,
        centerX,
        centerY,
        baseRadius + 30 + dynamicBoost
      );
      radialGradient.addColorStop(0, colors.primary);
      radialGradient.addColorStop(0.5, colors.secondary);
      radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = radialGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 30 + dynamicBoost, 0, Math.PI * 2);
      ctx.fill();

      // Draw multi-layered oscillating wave rings
      const ringCount = state === 'listening' || state === 'speaking' ? 3 : 2;
      for (let r = 0; r < ringCount; r++) {
        ctx.beginPath();
        const currentRadius = baseRadius + r * 6 + dynamicBoost * (0.5 + r * 0.2);
        const points = 32;

        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          let offset = 0;

          if (state === 'listening') {
            offset = Math.sin(angle * 6 + phase * 3 + r) * (3 + volumeLevel * 14);
          } else if (state === 'speaking') {
            offset = Math.cos(angle * 5 - phase * 4 + r) * 6;
          } else if (state === 'processing') {
            offset = Math.sin(angle * 8 + phase * 6) * 3;
          } else {
            offset = Math.sin(angle * 3 + phase) * 1.5;
          }

          const x = centerX + Math.cos(angle) * (currentRadius + offset);
          const y = centerY + Math.sin(angle) * (currentRadius + offset);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.closePath();
        ctx.strokeStyle = r === 0 ? colors.border : colors.secondary;
        ctx.lineWidth = r === 0 ? 2 : 1;
        ctx.stroke();
      }

      phase += state === 'processing' ? 0.08 : state === 'speaking' ? 0.05 : 0.03;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, volumeLevel, colors]);

  const getStateLabel = () => {
    switch (state) {
      case 'listening':
        return 'Listening... Speak now';
      case 'processing':
        return 'Nova is thinking...';
      case 'speaking':
        return 'Nova is speaking (tap to pause)';
      case 'error':
        return 'Tap to retry voice';
      case 'idle':
      default:
        return 'Tap to talk to Nova';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center select-none" id="nova-voice-orb-container">
      <div className="relative flex items-center justify-center cursor-pointer group" onClick={onClick}>
        {/* Animated outer pulsing ring for listening/speaking */}
        {(state === 'listening' || state === 'speaking') && (
          <motion.div
            className="absolute -inset-4 rounded-full pointer-events-none opacity-40 blur-md"
            style={{ backgroundColor: colors.border }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Dynamic Wave Canvas */}
        <canvas
          ref={canvasRef}
          width={160}
          height={160}
          className="w-28 h-28 sm:w-32 sm:h-32 transition-transform duration-300 group-hover:scale-105"
        />

        {/* Core Center Icon */}
        <div
          className="absolute flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-950/80 backdrop-blur-md border shadow-xl transition-all duration-300 group-hover:border-cyan-400"
          style={{ borderColor: colors.border }}
        >
          {state === 'listening' ? (
            <motion.div
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-cyan-400"
            >
              <Mic className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            </motion.div>
          ) : state === 'processing' ? (
            <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400 animate-spin" />
          ) : state === 'speaking' ? (
            <motion.div
              animate={{ scale: [0.95, 1.1, 0.95] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <Volume2 className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            </motion.div>
          ) : (
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400/90 group-hover:text-cyan-300 transition-colors" />
          )}
        </div>
      </div>

      {/* State Hint Label */}
      <p className="mt-2 text-xs sm:text-sm font-medium tracking-wide text-slate-300/90 drop-shadow text-center">
        {getStateLabel()}
      </p>
    </div>
  );
};
