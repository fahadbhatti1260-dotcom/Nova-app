import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Sparkles, User, Copy, Check, CornerDownRight } from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';
import { ActionCard } from './ActionCards';

export const ChatFeed: React.FC = () => {
  const {
    messages,
    replayAudio,
    interimTranscript,
    isListening,
    sendMessage,
    settings,
  } = useAssistant();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, interimTranscript]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isUrduMode = settings.language === 'ur-PK';

  const suggestionChips = isUrduMode
    ? [
        { label: '⏰ 7 بجے کا الارم سیٹ کریں', prompt: 'صبح 7:00 بجے کا الارم لگائیں' },
        { label: '🔦 ٹارچ آن کریں', prompt: 'ٹارچ آن کریں' },
        { label: '🧠 میرے بارے میں آپ کیا جانتے ہیں؟', prompt: 'آپ کو میرے بارے میں کیا معلومات یاد ہے؟' },
        { label: '⏱️ 5 منٹ کا ٹائمر لگائیں', prompt: '5 منٹ کا ٹائمر شروع کریں' },
        { label: '📷 کیمرہ کھول کر اسکین کریں', prompt: 'کیمرہ ویژن کھولیں' },
        { label: '▶️ یوٹیوب پر گانے یا نعت سنیں', prompt: 'یوٹیوب پر نعت اور تلاوت سرچ کریں' },
        { label: '📞 فہد کو کال ملائیں', prompt: 'فہد کو کال لگائیں' },
      ]
    : [
        { label: '⏰ Set alarm for 7:00 AM', prompt: 'Set an alarm for 7:00 AM for Morning Wakeup' },
        { label: '🔦 Turn on Flashlight', prompt: 'Turn on the flashlight' },
        { label: '🧠 What do you know about me?', prompt: 'What do you remember about me from our conversations?' },
        { label: '⏱️ 5 min Timer', prompt: 'Start a 5 minute timer for focus' },
        { label: '🎬 Video Script: Mars Colony', prompt: 'Create a video project about establishing the first city on Mars' },
        { label: '📷 Scan with Camera', prompt: 'Open the camera to analyze what is in front of me' },
        { label: '▶️ YouTube: Relaxing Music', prompt: 'Search YouTube for relaxing study music' },
      ];

  return (
    <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4 scroll-smooth" id="chat-feed-scroll">
      <AnimatePresence initial={false}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center my-2"
              >
                <div className="px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300 shadow-sm flex items-center gap-1.5" dir="auto">
                  <span>{msg.text}</span>
                  <span className="text-[10px] text-slate-400">• {msg.timestamp}</span>
                </div>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[88%] sm:max-w-[82%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar Icon */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                    isUser
                      ? 'bg-slate-700 text-slate-200 border border-slate-600'
                      : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/20 shadow-md'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`group relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md transition-all ${
                    isUser
                      ? 'bg-cyan-600/90 text-white rounded-tr-xs border border-cyan-400/30'
                      : 'bg-slate-900/90 text-slate-100 rounded-tl-xs border border-slate-800 backdrop-blur-md'
                  }`}
                  dir="auto"
                >
                  {/* Attached image if any */}
                  {msg.visionImage && (
                    <div className="mb-2.5 rounded-xl overflow-hidden border border-slate-700/60 max-h-48">
                      <img
                        src={msg.visionImage}
                        alt="Camera Capture"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}

                  {/* Message Text */}
                  <p className="whitespace-pre-wrap select-text leading-relaxed font-sans">{msg.text}</p>

                  {/* Action Card Attached */}
                  {msg.action && <ActionCard action={msg.action} />}

                  {/* Message Meta & Action Buttons */}
                  <div
                    className={`mt-1.5 flex items-center gap-2 text-[10px] ${
                      isUser ? 'text-cyan-100/75 justify-end' : 'text-slate-400 justify-between'
                    }`}
                  >
                    <span>{msg.timestamp}</span>

                    {!isUser && (
                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => replayAudio(msg.text)}
                          className="p-1 rounded-md hover:bg-slate-800 text-slate-300 transition-colors"
                          title="Speak response aloud"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="p-1 rounded-md hover:bg-slate-800 text-slate-300 transition-colors"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Live Interim Transcript Bubble */}
      {isListening && interimTranscript && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tr-xs bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-sm flex items-center gap-2 shadow-lg" dir="auto">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block shrink-0" />
            <span className="italic">{interimTranscript}</span>
          </div>
        </motion.div>
      )}

      {/* Quick Suggestion Chips */}
      {messages.length <= 3 && (
        <div className="pt-3">
          <p className="text-[11px] font-medium tracking-wide uppercase text-slate-400 mb-2 flex items-center gap-1">
            <CornerDownRight className="w-3 h-3 text-cyan-400" />
            {isUrduMode ? 'بولیں یا کلک کریں:' : 'Try saying or tapping:'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(chip.prompt)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-xs text-left"
                dir="auto"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
