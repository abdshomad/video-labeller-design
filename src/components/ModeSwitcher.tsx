/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Play, ShieldAlert, Cpu, ToggleLeft, ToggleRight, Database, Film, ClipboardList, Keyboard } from 'lucide-react';
import { AppMode } from '../types';
import { checkServerHealth } from '../services/api';

interface ModeSwitcherProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  activeScreen: 'labeling' | 'models' | 'plan';
  onScreenChange: (screen: 'labeling' | 'models' | 'plan') => void;
  onOpenShortcuts?: () => void;
  onReturnToLanding?: () => void;
}

export default function ModeSwitcher({
  mode,
  onModeChange,
  activeScreen,
  onScreenChange,
  onOpenShortcuts,
  onReturnToLanding
}: ModeSwitcherProps) {
  const [serverState, setServerState] = useState<{ checked: boolean; isOnline: boolean; hasKey: boolean }>({
    checked: false,
    isOnline: false,
    hasKey: false,
  });

  useEffect(() => {
    async function verifyBackend() {
      const status = await checkServerHealth();
      setServerState({
        checked: true,
        isOnline: status.status === 'ok',
        hasKey: status.hasApiKey,
      });
    }
    verifyBackend();
  }, []);

  return (
    <header className="flex flex-col md:flex-row items-center justify-between border-b border-slate-200 bg-white px-6 py-3 gap-4 shadow-2xs">
      {/* Title block */}
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md shadow-indigo-600/10">
          <Cpu size={18} />
        </div>
        <div>
          <h1 className="font-sans text-base font-bold tracking-tight text-slate-800 flex items-center gap-2 leading-none">
            Video Labeller<span className="text-indigo-600 font-extrabold">.io</span>
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-full">v1.3</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-1">Immersive Video Annotation & Fine-Tuned Local Inference</p>
        </div>

        {onReturnToLanding && (
          <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1" />
        )}

        {onReturnToLanding && (
          <button
            onClick={onReturnToLanding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-[10px] text-slate-600 font-extrabold tracking-wide uppercase transition-all cursor-pointer shadow-3xs"
            title="Return to initial landing data uploader screen"
          >
            <span>← Uploader Screen</span>
          </button>
        )}
      </div>

      {/* Screen Toggle Route Tabs */}
      <div id="workspace-tabs" className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 shadow-inner">
        <button
          onClick={() => onScreenChange('labeling')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeScreen === 'labeling'
              ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/40'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Film size={13} />
          <span>Annotation Workspace</span>
        </button>
        <button
          onClick={() => onScreenChange('models')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeScreen === 'models'
              ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/40'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Cpu size={13} />
          <span>AI Model Hub</span>
        </button>
        <button
          onClick={() => onScreenChange('plan')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeScreen === 'plan'
              ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/40'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <ClipboardList size={13} />
          <span>Enhancement Roadmap</span>
        </button>
      </div>

      {/* Mode Switches */}
      <div className="flex items-center gap-3">
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="flex h-8 px-3.5 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-55 text-slate-600 hover:text-indigo-650 transition-all text-xs font-bold cursor-pointer shadow-3xs hover:border-indigo-200"
            title="Show interactive keyboard shortcuts cheat sheet"
          >
            <Keyboard size={13} className="text-indigo-500 animate-pulse" />
            <span>Shortcuts</span>
          </button>
        )}

        {/* Connection health banner */}
        {mode === 'live' && (
          <div className="hidden md:flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-205 px-3 py-1.5 text-xs text-amber-700 font-medium">
            <ShieldAlert size={14} className="animate-pulse text-amber-500" />
            <span>
              {serverState.isOnline
                ? serverState.hasKey
                  ? 'Server Active (Gemini API Loaded)'
                  : 'API Key missing'
                : 'Offline simulation active'}
            </span>
          </div>
        )}

        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 shadow-inner">
          <button
            onClick={() => onModeChange('demo')}
            className={`flex items-center gap-1.5 px-3 py-1.2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              mode === 'demo'
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200/55'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database size={12} />
            <span>Demo</span>
          </button>

          <button
            onClick={() => onModeChange('live')}
            className={`flex items-center gap-1.5 px-3 py-1.2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              mode === 'live'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-750'
            }`}
          >
            <Cpu size={12} />
            <span>Live</span>
          </button>
        </div>
      </div>
    </header>
  );
}
