import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PhoneOff, Mic, MicOff, Volume2, Grid, User, ShieldCheck } from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';

export const ActiveCallOverlay: React.FC = () => {
  const { activeCallContact, endCall } = useAssistant();
  const [durationSec, setDurationSec] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  useEffect(() => {
    if (!activeCallContact) {
      setDurationSec(0);
      return;
    }

    const interval = setInterval(() => {
      setDurationSec((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCallContact]);

  if (!activeCallContact) return null;

  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-lg">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-900/50 rounded-3xl shadow-2xl p-6 text-center text-slate-100 flex flex-col items-center justify-between min-h-[460px]"
      >
        {/* Contact Info Header */}
        <div className="space-y-3 mt-4">
          <div className="relative mx-auto w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-3xl font-bold text-emerald-400 shadow-xl shadow-emerald-950">
            <span className="animate-pulse">
              {activeCallContact[0]?.toUpperCase() || 'C'}
            </span>
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-600 text-white shadow-md">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-100">{activeCallContact}</h3>
            <p className="text-xs text-emerald-400 font-mono mt-1 tracking-wider">
              {durationSec === 0 ? 'Connecting via Android Carrier...' : formattedTime}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">HD Voice Call • Encrypted</p>
          </div>
        </div>

        {/* In-Call Controls */}
        <div className="grid grid-cols-3 gap-4 w-full px-4 my-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
              isMuted
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="text-[10px] font-medium">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`p-3.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
              isSpeaker
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Volume2 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Speaker</span>
          </button>

          <button
            className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex flex-col items-center gap-1.5 transition-all"
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px] font-medium">Keypad</span>
          </button>
        </div>

        {/* End Call Button */}
        <button
          onClick={endCall}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-600/30 transition-transform active:scale-95 mb-2"
          title="End Call"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </motion.div>
    </div>
  );
};
