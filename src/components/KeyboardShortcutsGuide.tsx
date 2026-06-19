/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Keyboard, X, Play, Pause, ChevronLeft, ChevronRight, CornerDownLeft, Eye, Layout } from 'lucide-react';

interface KeyboardShortcutsGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsGuide({ isOpen, onClose }: KeyboardShortcutsGuideProps) {
  const [activeKeyPressed, setActiveKeyPressed] = useState<string | null>(null);

  // Monitor keys globally when modal is open to highlight key bindings live!
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let keyMarker = e.key.toUpperCase();
      if (e.key === ' ') keyMarker = 'SPACE';
      if (e.key === 'Escape') keyMarker = 'ESC';
      if (e.key === 'ArrowLeft') keyMarker = 'A';
      if (e.key === 'ArrowRight') keyMarker = 'D';
      
      setActiveKeyPressed(keyMarker);
      const timer = setTimeout(() => setActiveKeyPressed(null), 180);
      return () => clearTimeout(timer);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Video Playback',
      items: [
        { key: 'SPACE', desc: 'Toggle Play/Pause video stream standard playback', icon: <Play size={11} className="text-indigo-400" /> },
      ]
    },
    {
      title: 'Frame Timeline Navigation',
      items: [
        { key: 'A', alternative: '←', desc: 'Navigate to previous video frame index', icon: <ChevronLeft size={11} className="text-indigo-400" /> },
        { key: 'D', alternative: '→', desc: 'Navigate to next video frame index', icon: <ChevronRight size={11} className="text-indigo-400" /> },
        { key: 'W', alternative: '↑', desc: 'Step backwards 1 index / frame', icon: <ChevronLeft size={11} className="text-indigo-400" /> },
        { key: 'S', alternative: '↓', desc: 'Step forwards 1 index / frame', icon: <ChevronRight size={11} className="text-indigo-400" /> },
      ]
    },
    {
      title: 'Manual Annotator Toolbar Select',
      items: [
        { key: '1', desc: 'Equip selection cursor inspect tool' },
        { key: '2', desc: 'Equip bounding box manual drawing tool' },
        { key: '3', desc: 'Equip multi-point polygon manual vector tool' },
        { key: '4', desc: 'Equip SAM3 interactive AI segmenter points tool' },
        { key: '5', desc: 'Equip eraser correction tool' },
      ]
    },
    {
      title: 'Editor Reset Actions',
      items: [
        { key: 'ESC', desc: 'Abort current shape or clear active points list' },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header Title Bar */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600/25 flex items-center justify-center border border-indigo-500/30">
              <Keyboard size={16} className="text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white select-none">Active Keyboard Controls</h3>
              <p className="text-[10px] text-slate-400">Boost manual annotator throughput via hotkey triggers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Live physical feedback testing layout */}
        <div className="bg-indigo-950/20 border-b border-slate-900 p-4 shrink-0">
          <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-2 select-none">
            Live Keyboard Input Tester — Press any hotkey to preview match
          </div>
          <div className="flex flex-wrap gap-2">
            {['SPACE', 'ESC', 'W', 'A', 'S', 'D', '1', '2', '3', '4', '5'].map((k) => {
              const matches = activeKeyPressed === k;
              return (
                <div
                  key={k}
                  className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-black transition-all ${
                    matches
                      ? 'bg-indigo-650 border-indigo-400 text-white shadow-lg scale-105 ring-2 ring-indigo-500/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {k}
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Listings Section */}
        <div className="p-5 overflow-y-auto space-y-6 scrollbar-thin">
          {shortcutGroups.map((grp) => (
            <div key={grp.title} className="space-y-2.5">
              <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider select-none">{grp.title}</span>
              <div className="grid grid-cols-1 gap-1.5">
                {grp.items.map((item) => {
                  const isActive = activeKeyPressed === item.key || (item.alternative && activeKeyPressed === item.alternative);
                  return (
                    <div
                      key={item.key}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-indigo-900/20 border-indigo-500/40 text-indigo-100'
                          : 'bg-slate-900/30 border-slate-900 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {item.icon && <span className="opacity-80 shrink-0">{item.icon}</span>}
                        <span className="text-[11px] leading-relaxed break-words">{item.desc}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <kbd className={`px-2 py-1 font-mono text-[10px] font-black rounded border transition-all ${
                          isActive
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}>
                          {item.key}
                        </kbd>
                        {item.alternative && (
                          <>
                            <span className="text-[10px] text-slate-600">or</span>
                            <kbd className={`px-2 py-1 font-mono text-[10px] font-black rounded border transition-all ${
                              isActive
                                ? 'bg-indigo-600 border-indigo-400 text-white'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}>
                              {item.alternative}
                            </kbd>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 text-center select-none shrink-0">
          <span className="text-[10px] text-slate-500">
            💡 Tap <kbd className="bg-slate-900 border border-slate-800 px-1 rounded font-mono text-[9px]">ESC</kbd> anytime outside of text inputs to dismiss modals or reset state indicators
          </span>
        </div>

      </div>
    </div>
  );
}
