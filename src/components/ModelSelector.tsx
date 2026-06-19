/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cpu, Copy, Trash2, Sliders, Layers, RefreshCw } from 'lucide-react';
import { DetectionModel, ModelConfig } from '../types';

interface ModelSelectorProps {
  config: ModelConfig;
  onConfigChange: (config: ModelConfig) => void;
  onAutoLabel: () => void;
  onBatchAutoLabel?: () => void;
  batchProgress?: { [frame: number]: 'idle' | 'processing' | 'completed' | 'failed' } | null;
  onCopyPrevious?: (count: number) => void;
  onClearAnnotations?: () => void;
  isProcessing: boolean;
  availableClasses: string[];
  showWorkspaceActions?: boolean;
}

export default function ModelSelector({
  config,
  onConfigChange,
  onAutoLabel,
  onBatchAutoLabel,
  batchProgress = null,
  onCopyPrevious,
  onClearAnnotations,
  isProcessing,
  availableClasses,
  showWorkspaceActions = false
}: ModelSelectorProps) {
  const [newClassInput, setNewClassInput] = useState('');

  const handleModelChange = (model: DetectionModel) => {
    onConfigChange({ ...config, model });
  };

  const toggleClassFilter = (cls: string) => {
    const freshClasses = config.selectedClasses.includes(cls)
      ? config.selectedClasses.filter((c) => c !== cls)
      : [...config.selectedClasses, cls];
    onConfigChange({ ...config, selectedClasses: freshClasses });
  };

  const handleAddNewClass = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newClassInput.trim();
    if (clean && !availableClasses.includes(clean)) {
      toggleClassFilter(clean);
      setNewClassInput('');
    }
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-5 gap-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Cpu size={18} className="text-indigo-600" />
        <h2 className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">AI Model Pipeline</h2>
      </div>

      {/* Model Cards Selector */}
      <div className="grid grid-cols-3 gap-2">
        {([ 'YOLO26', 'RF-DETR', 'SAM3' ] as DetectionModel[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModelChange(m)}
            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-lg border text-center transition-all cursor-pointer ${
              config.model === m
                ? 'bg-indigo-50 border-indigo-250 text-indigo-700 font-semibold shadow-sm'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="text-xs font-bold font-mono tracking-wide">{m}</span>
            <span className="text-[10px] mt-0.5 opacity-80 font-normal">
              {m === 'SAM3' ? 'Segmentation' : 'Object Box'}
            </span>
          </button>
        ))}
      </div>

      <div className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        {config.model === 'YOLO26' && 'YOLO 2026 Core Object Detector: High-speed architecture optimization specialized in robust real-time grid cells bounding boxes.'}
        {config.model === 'RF-DETR' && 'Real-Time DEtection TRansformer: Attention query mechanism ideal for fine-grained sports tracking coordinates.'}
        {config.model === 'SAM3' && 'Segment Anything Model v3: Predicts high-fidelity closed polygon contours on click coordinates or whole frame structures.'}
      </div>

      {/* Threshold controls */}
      <div className="flex flex-col gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
          <Sliders size={13} className="text-indigo-600" />
          <span>Model Parameters</span>
        </div>
        
        <div>
          <div className="flex justify-between text-[11px] text-slate-500 mb-1">
            <span>Confidence Threshold</span>
            <span className="font-mono text-indigo-600 font-bold">{config.confidenceThreshold}</span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.95"
            step="0.05"
            value={config.confidenceThreshold}
            onChange={(e) => onConfigChange({ ...config, confidenceThreshold: parseFloat(e.target.value) })}
            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-650"
          />
        </div>
      </div>

      {/* Class filtering */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers size={12} className="text-indigo-600" />
          Class Filters
        </label>
        
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto bg-slate-50 p-2 rounded-lg border border-slate-250">
          {availableClasses.map((cls) => {
            const isSelected = config.selectedClasses.includes(cls);
            return (
              <button
                key={cls}
                onClick={() => toggleClassFilter(cls)}
                className={`text-[10px] px-2 py-1 rounded-md border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-250 font-semibold'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-350'
                }`}
              >
                {cls}
              </button>
            );
          })}
        </div>
      </div>

      {/* Execution controls */}
      <div className="flex flex-col gap-2.5 mt-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onAutoLabel}
            disabled={isProcessing}
            className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-3 rounded-lg shadow-2xs disabled:opacity-50 transition-all font-sans cursor-pointer"
            title="Processes only the active viewer frame with Chosen AI Model"
          >
            {isProcessing && !batchProgress ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Cpu size={13} />
            )}
            <span>Single Frame</span>
          </button>

          <button
            onClick={onBatchAutoLabel}
            disabled={isProcessing}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs py-2 px-3 rounded-lg shadow-2xs disabled:opacity-50 transition-all font-sans cursor-pointer"
            title="Triggers concurrent background pipeline for ALL video frames at once"
          >
            {isProcessing && batchProgress ? (
              <RefreshCw size={13} className="animate-spin text-emerald-400" />
            ) : (
              <Layers size={13} className="text-indigo-400" />
            )}
            <span>Batch All ({config.model})</span>
          </button>
        </div>

        {/* Simultaneous Batch Pipeline Worker Grid Status */}
        {batchProgress && (
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
                Concurrent Tensor Workers
              </span>
              <span className="text-[8px] font-mono font-bold text-slate-500">
                {Object.values(batchProgress).filter(s => s === 'completed').length} / {Object.keys(batchProgress).length}
              </span>
            </div>
            
            <div className="grid grid-cols-5 gap-1.5">
              {Object.entries(batchProgress).map(([fIdx, status]) => {
                const num = parseInt(fIdx) + 1;
                return (
                  <div
                    key={fIdx}
                    className={`flex flex-col items-center justify-center py-1.5 rounded text-[10px] font-mono font-bold transition-all border ${
                      status === 'completed'
                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                        : status === 'failed'
                        ? 'bg-rose-950/40 border-rose-800 text-rose-400'
                        : status === 'processing'
                        ? 'bg-indigo-950/40 border-indigo-700 text-indigo-300 animate-pulse'
                        : 'bg-slate-950 border-slate-800 text-slate-600'
                    }`}
                    title={`Frame ${num} worker is ${status}`}
                  >
                    <span>F{num}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showWorkspaceActions && (
          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Multi-Frame Copy</span>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">Propagation</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onCopyPrevious && onCopyPrevious(1)}
                className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 text-[11px] font-medium py-1.5 rounded-lg transition-all cursor-pointer"
                title="Copies annotations from previous frame to this active frame"
              >
                <Copy size={12} className="text-indigo-650" />
                <span>Copy Prev (1f)</span>
              </button>
              
              <button
                onClick={onClearAnnotations}
                className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-205 text-rose-600 hover:bg-rose-50 hover:border-rose-200 text-[11px] font-medium py-1.5 rounded-lg transition-all cursor-pointer"
              >
                <Trash2 size={12} />
                <span>Clear Frame</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex flex-col gap-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Propagate labels forward onto:</span>
              <div className="grid grid-cols-4 gap-1">
                {[10, 20, 50, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => onCopyPrevious && onCopyPrevious(val)}
                    className="bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-250 hover:text-indigo-700 text-slate-600 text-[10px] font-bold py-1 px-1.5 rounded-md transition-all cursor-pointer text-center"
                    title={`Propagate labels of previous frame onto the next ${val} frames`}
                  >
                    +{val}f
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
