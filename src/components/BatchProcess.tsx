/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BatchProcessItem, BatchConfig } from '../types';
import { INITIAL_BATCH_ITEMS } from '../../data/mockup/batchData';
import { Play, PlayCircle, Loader2, CheckCircle, RefreshCw, Layers, LayoutGrid, CheckSquare, PlusCircle } from 'lucide-react';

interface BatchProcessProps {
  onBatchCompleted: (results: { [videoId: string]: number }) => void;
  availableSampleClips: { id: string; title: string; frameCount: number }[];
}

export default function BatchProcess({ onBatchCompleted, availableSampleClips }: BatchProcessProps) {
  const [items, setItems] = useState<BatchProcessItem[]>(INITIAL_BATCH_ITEMS);
  const [config, setConfig] = useState<BatchConfig>({
    mode: 'sequential',
    autoSave: true,
    clearExisting: false
  });
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>(['Batch pipeline initialized. Ready to process.']);
  const [currentRunningIndex, setCurrentRunningIndex] = useState<number | null>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 30)]);
  };

  const handleAddCustomToBatch = () => {
    const randomClip = availableSampleClips[Math.floor(Math.random() * availableSampleClips.length)];
    const id = `batch-clip-${Date.now()}`;
    const newItem: BatchProcessItem = {
      videoId: id,
      title: `${randomClip.title} (Clone #${Math.floor(Math.random() * 100)})`,
      status: 'idle',
      progress: 0,
      frameCount: randomClip.frameCount,
      labelsCreated: 0
    };
    setItems([...items, newItem]);
    addLog(`Appended custom clip "${newItem.title}" to queue.`);
  };

  const startBatchProcess = () => {
    if (isRunning) return;
    setIsRunning(true);
    addLog(`Initiating batch inference pool. Config: ${config.mode.toUpperCase()} mode.`);

    // Reset items status
    setItems(prev => prev.map(item => ({ ...item, status: 'processing', progress: 0, labelsCreated: 0 })));

    let activeItems = items.map(item => ({ ...item, status: 'processing' as const, progress: 0, labelsCreated: 0 }));

    if (config.mode === 'sequential') {
      let index = 0;
      const processNext = () => {
        if (index >= activeItems.length) {
          setIsRunning(false);
          setCurrentRunningIndex(null);
          addLog("Batch sequential queue finished successfully!");
          
          // Trigger parent save callback
          const results: { [videoId: string]: number } = {};
          items.forEach((item, idx) => {
            results[item.videoId] = activeItems[idx].labelsCreated;
          });
          onBatchCompleted(results);
          return;
        }

        setCurrentRunningIndex(index);
        addLog(`Loading segment: ${activeItems[index].title}`);
        
        let framesCounter = 0;
        const total = activeItems[index].frameCount;
        const interval = setInterval(() => {
          framesCounter += Math.ceil(total / 10);
          if (framesCounter >= total) {
            framesCounter = total;
            clearInterval(interval);
            
            const labelsCount = Math.floor(15 + Math.random() * 45);
            activeItems[index] = {
              ...activeItems[index],
              status: 'completed',
              progress: 100,
              labelsCreated: labelsCount
            };
            setItems([...activeItems]);
            addLog(`Saved auto-pipeline results: ${labelsCount} objects synthesized in ${activeItems[index].title}.`);
            index++;
            processNext();
          } else {
            const percent = Math.floor((framesCounter / total) * 100);
            activeItems[index] = {
              ...activeItems[index],
              progress: percent
            };
            setItems([...activeItems]);
            if (framesCounter % 30 === 0) {
              addLog(`Processing [F${framesCounter}/${total}] for ${activeItems[index].title}...`);
            }
          }
        }, 120);
      };
      processNext();

    } else {
      // Parallel simulation
      addLog("Spawning multi-worker background models simultaneously...");
      let completedCount = 0;
      
      activeItems.forEach((item, idx) => {
        let framesCounter = 0;
        const total = item.frameCount;
        const delay = 80 + Math.random() * 60; // Vary speeds slightly
        
        const interval = setInterval(() => {
          framesCounter += Math.round(total / 15);
          if (framesCounter >= total) {
            framesCounter = total;
            clearInterval(interval);
            
            const labelsCount = Math.floor(12 + Math.random() * 32);
            activeItems[idx] = {
              ...activeItems[idx],
              status: 'completed',
              progress: 100,
              labelsCreated: labelsCount
            };
            setItems([...activeItems]);
            addLog(`Worker #${idx + 1} completed: "${item.title}" saved.`);
            
            completedCount++;
            if (completedCount === activeItems.length) {
              setIsRunning(false);
              addLog("Parallel batch workers pooled back safely. All tasks completed.");
              const results: { [videoId: string]: number } = {};
              items.forEach((it, i) => {
                results[it.videoId] = activeItems[i].labelsCreated;
              });
              onBatchCompleted(results);
            }
          } else {
            const percent = Math.floor((framesCounter / total) * 100);
            activeItems[idx] = {
              ...activeItems[idx],
              progress: percent
            };
            setItems([...activeItems]);
          }
        }, delay);
      });
    }
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-5 gap-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-indigo-600" />
          <h2 className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">Multiplex Batch Processor</h2>
        </div>
        <button
          onClick={handleAddCustomToBatch}
          disabled={isRunning}
          className="flex items-center gap-1 text-[11px] font-bold text-indigo-650 bg-indigo-50 hover:bg-indigo-100 px-2 rounded-md transition-all cursor-pointer disabled:opacity-40"
        >
          <PlusCircle size={12} />
          <span>Add Video</span>
        </button>
      </div>

      {/* Speed / execution mode config */}
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between text-xs gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-650">Execution:</span>
          <button
            onClick={() => setConfig({ ...config, mode: 'sequential' })}
            disabled={isRunning}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
              config.mode === 'sequential'
                ? 'bg-indigo-600 text-white border-transparent shadow'
                : 'bg-white text-slate-600 border-slate-200 hover:text-slate-800'
            }`}
          >
            Sequential
          </button>
          <button
            onClick={() => setConfig({ ...config, mode: 'parallel' })}
            disabled={isRunning}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
              config.mode === 'parallel'
                ? 'bg-indigo-600 text-white border-transparent'
                : 'bg-white text-slate-600 border-slate-200 hover:text-slate-850'
            }`}
          >
            Parallel Worker
          </button>
        </div>

        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-500 font-medium">
          <input
            type="checkbox"
            checked={config.autoSave}
            onChange={(e) => setConfig({ ...config, autoSave: e.target.checked })}
            className="rounded text-indigo-600 border-slate-300 accent-indigo-600 h-3.5 w-3.5"
            disabled={isRunning}
          />
          <span>Auto Save</span>
        </label>
      </div>

      {/* Batch streams list */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {items.map((item, idx) => {
          const isActive = isRunning && (config.mode === 'sequential' ? idx === currentRunningIndex : item.status === 'processing');
          return (
            <div
              key={item.videoId}
              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                isActive
                  ? 'bg-indigo-50 border-indigo-250'
                  : item.status === 'completed'
                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-750'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-700 truncate block text-[11px]">{item.title}</span>
                  <span className="text-[9px] font-semibold text-slate-400 bg-slate-200/50 px-1 py-0.5 rounded shrink-0">{item.frameCount} F</span>
                </div>
                
                {/* Loader bar */}
                {item.status === 'processing' && (
                  <div className="w-full h-1 bg-slate-200 rounded overflow-hidden mt-1.5">
                    <div className="h-full bg-indigo-600 transition-all duration-100" style={{ width: `${item.progress}%` }} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.status === 'completed' && (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5"><CheckCircle size={10} /> Saved</span>
                    <span className="text-[9px] text-slate-400 font-semibold">{item.labelsCreated} objects</span>
                  </div>
                )}
                {item.status === 'processing' && (
                  <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1 animate-pulse">
                    <Loader2 size={11} className="animate-spin text-indigo-500" /> {item.progress}%
                  </span>
                )}
                {item.status === 'idle' && (
                  <span className="text-[10px] text-slate-400 font-medium">Queued</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isRunning ? (
        <button
          disabled
          className="w-full bg-indigo-50 border border-indigo-200 text-indigo-650 font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5"
        >
          <RefreshCw size={14} className="animate-spin text-indigo-500" />
          <span>Processing Tensor Batch Pool...</span>
        </button>
      ) : (
        <button
          onClick={startBatchProcess}
          className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
        >
          <PlayCircle size={14} />
          <span>Execute Sequential & Parallel Pipeline</span>
        </button>
      )}

      {/* Action Logs */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Job Logs</span>
        <div className="bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-350 p-2.5 rounded-lg select-text h-20 overflow-y-auto flex flex-col gap-0.5 leading-relaxed">
          {logs.map((log, idx) => (
            <div key={idx} className="truncate">{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
