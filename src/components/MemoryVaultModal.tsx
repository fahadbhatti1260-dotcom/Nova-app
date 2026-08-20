import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  X,
  Plus,
  Trash2,
  Search,
  User,
  Heart,
  Briefcase,
  Activity,
  Sparkles,
  Calendar,
  Coffee,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';
import { UserMemory } from '../types';

export const MemoryVaultModal: React.FC = () => {
  const { memories, addMemory, removeMemory, setActiveModal } = useAssistant();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<UserMemory['category']>('personal');

  const categories: { id: string; label: string; icon: any }[] = [
    { id: 'all', label: 'All Memories', icon: Brain },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'preference', label: 'Preferences', icon: Coffee },
    { id: 'work', label: 'Work & Projects', icon: Briefcase },
    { id: 'habit', label: 'Habits & Routine', icon: Calendar },
    { id: 'relationship', label: 'Relationships', icon: Heart },
    { id: 'health', label: 'Health & Dietary', icon: Activity },
  ];

  const filteredMemories = memories.filter((mem) => {
    const matchesCat = selectedCategory === 'all' || mem.category === selectedCategory;
    const matchesSearch =
      mem.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.value.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    addMemory(newCategory, newKey.trim(), newValue.trim());
    setNewKey('');
    setNewValue('');
    setIsAdding(false);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'personal':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'preference':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'work':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'habit':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'relationship':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'health':
        return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Nova Memory Core</h2>
              <p className="text-xs text-slate-400">
                {memories.length} facts remembered about you
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {isAdding ? 'Cancel' : 'Teach Fact'}
            </button>
            <button
              onClick={() => setActiveModal('none')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Memory Drawer */}
        <AnimatePresence>
          {isAdding && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCreateMemory}
              className="p-4 bg-slate-950/70 border-b border-slate-800 space-y-3 overflow-hidden"
            >
              <p className="text-xs font-semibold text-cyan-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Add a new fact for Nova to remember
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Subject / Key</label>
                  <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="e.g. Favorite Coffee, Pet, Birthday"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="personal">Personal Info</option>
                    <option value="preference">Preference / Likes</option>
                    <option value="work">Work & Projects</option>
                    <option value="habit">Habit & Routine</option>
                    <option value="relationship">Relationships / People</option>
                    <option value="health">Health & Dietary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Details to Remember</label>
                <textarea
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g. I drink oat milk lattes with no sugar every morning at 8:30 AM."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 resize-none h-16"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Save to Memory
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Search & Category Filter */}
        <div className="p-3.5 border-b border-slate-800 space-y-2.5 bg-slate-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search what Nova knows about you..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Categories Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                      : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Memory Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredMemories.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-slate-300">No memories found</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Tell Nova things about yourself during conversations, and they'll automatically appear here!
              </p>
            </div>
          ) : (
            filteredMemories.map((mem) => (
              <motion.div
                key={mem.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start justify-between gap-3 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border uppercase tracking-wider ${getCategoryColor(
                        mem.category
                      )}`}
                    >
                      {mem.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200">{mem.key}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{mem.value}</p>
                  <p className="text-[10px] text-slate-500 mt-1.5">{mem.timestamp}</p>
                </div>

                <button
                  onClick={() => removeMemory(mem.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/30 opacity-60 group-hover:opacity-100 transition-all"
                  title="Forget this memory"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
