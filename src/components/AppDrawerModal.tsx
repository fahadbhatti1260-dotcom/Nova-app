import React from 'react';
import { motion } from 'motion/react';
import {
  Camera,
  Play,
  Brain,
  Sliders,
  Calendar,
  MessageSquare,
  Clock,
  MapPin,
  Music,
  Film,
  X,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';

export const AppDrawerModal: React.FC = () => {
  const { setActiveModal, sendMessage } = useAssistant();
  const [search, setSearch] = React.useState('');

  const apps = [
    {
      id: 'camera',
      name: 'Camera Vision',
      category: 'AI Multimodal',
      icon: Camera,
      bg: 'bg-cyan-500 text-slate-950',
      action: () => setActiveModal('camera'),
    },
    {
      id: 'youtube',
      name: 'YouTube',
      category: 'Media & Videos',
      icon: Play,
      bg: 'bg-red-500 text-white',
      action: () => setActiveModal('youtube'),
    },
    {
      id: 'studio',
      name: 'Video Studio',
      category: 'Creative Production',
      icon: Film,
      bg: 'bg-purple-500 text-white',
      action: () => setActiveModal('video_studio'),
    },
    {
      id: 'memory',
      name: 'Memory Vault',
      category: 'Personal AI Core',
      icon: Brain,
      bg: 'bg-emerald-500 text-slate-950',
      action: () => setActiveModal('memory'),
    },
    {
      id: 'clock',
      name: 'Clock & Alarms',
      category: 'System Tools',
      icon: Clock,
      bg: 'bg-amber-500 text-slate-950',
      action: () => {
        sendMessage('Show my active alarms and timers');
        setActiveModal('none');
      },
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      category: 'Productivity',
      icon: Calendar,
      bg: 'bg-blue-500 text-white',
      action: () => {
        sendMessage("What's on my calendar for today and tomorrow?");
        setActiveModal('none');
      },
    },
    {
      id: 'messages',
      name: 'Messages',
      category: 'Communication',
      icon: MessageSquare,
      bg: 'bg-indigo-500 text-white',
      action: () => {
        sendMessage('Show my recent messages');
        setActiveModal('none');
      },
    },
    {
      id: 'settings',
      name: 'Device Settings',
      category: 'Android OS',
      icon: Sliders,
      bg: 'bg-slate-700 text-slate-100',
      action: () => setActiveModal('quick_settings'),
    },
  ];

  const filteredApps = apps.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-4 sm:p-5 text-slate-100 space-y-4 max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-100">Android App Drawer</h3>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search installed apps..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-4 gap-3 py-2 overflow-y-auto flex-1">
          {filteredApps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={app.action}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-800/60 transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${app.bg} flex items-center justify-center shadow-lg transition-transform group-hover:scale-105`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-medium text-slate-300 text-center line-clamp-1 group-hover:text-cyan-300">
                  {app.name}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
