import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  X,
  Search,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Tv,
  ListPlus,
  Volume2,
  Loader2,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';
import { searchYouTubeVideos } from '../services/api';
import { YouTubeVideoItem } from '../types';

export const YouTubeModal: React.FC = () => {
  const { activeYouTubeQuery, setActiveModal, replayAudio } = useAssistant();
  const [query, setQuery] = useState(activeYouTubeQuery || 'Future of Android AI');
  const [videos, setVideos] = useState<YouTubeVideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeVideo, setActiveVideo] = useState<YouTubeVideoItem | null>(null);

  const fetchVideos = async (searchTopic: string) => {
    if (!searchTopic.trim()) return;
    setIsLoading(true);
    try {
      const data = await searchYouTubeVideos(searchTopic);
      setVideos(data.videos || []);
      if (data.videos && data.videos.length > 0) {
        setActiveVideo(data.videos[0]);
      }
    } catch (err) {
      console.error('YouTube search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeYouTubeQuery) {
      setQuery(activeYouTubeQuery);
      fetchVideos(activeYouTubeQuery);
    } else {
      fetchVideos('Android AI Assistant innovations');
    }
  }, [activeYouTubeQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVideos(query);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-500/15 text-red-400 border border-red-500/30">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">YouTube Explorer</h2>
              <p className="text-xs text-slate-400">Search, watch, & generate AI video digests</p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('none')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search topics, tutorials, music, podcasts on YouTube..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              Search
            </button>
          </div>
        </form>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Active Featured Video Preview */}
          {activeVideo && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-red-950/60 shadow-lg space-y-3">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 group">
                <img
                  src={activeVideo.thumbnailUrl}
                  alt={activeVideo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-all flex items-center justify-center">
                  <a
                    href={activeVideo.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-600/40 transition-transform group-hover:scale-110"
                  >
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </a>
                </div>
                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/90 text-white text-[11px] font-mono font-bold">
                  {activeVideo.duration}
                </span>
              </div>

              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-100">{activeVideo.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeVideo.channel} • {activeVideo.views}
                    </p>
                  </div>
                  <a
                    href={activeVideo.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open
                  </a>
                </div>

                {/* AI Summary Breakdown */}
                {activeVideo.summary && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-red-400" />
                        Nova AI Video Digest
                      </span>
                      <button
                        onClick={() => replayAudio(activeVideo.summary || '')}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
                        title="Read summary"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{activeVideo.summary}</p>

                    {activeVideo.keyTakeaways && activeVideo.keyTakeaways.length > 0 && (
                      <div className="pt-1.5 space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Key Insights
                        </p>
                        {activeVideo.keyTakeaways.map((t, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                            <CheckCircle2 className="w-3 h-3 text-red-400 shrink-0" />
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Videos Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Related Search Results
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => setActiveVideo(vid)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    activeVideo?.id === vid.id
                      ? 'bg-red-950/30 border-red-500/50 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                    <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/80 text-[10px] text-white font-mono">
                      {vid.duration}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-200 line-clamp-2">{vid.title}</h5>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">{vid.channel}</p>
                    <p className="text-[10px] text-slate-500">{vid.views}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
