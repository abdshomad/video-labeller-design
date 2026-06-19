/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MousePointer, Box as BoxIcon, Scissors, Plus, ShieldCheck, Square, Triangle, Target } from 'lucide-react';
import { ToolType } from '../types';

interface DrawingToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  selectedLabelClass: string;
  onLabelClassChange: (label: string) => void;
  availableClasses: string[];
  onAddNewClass: (cls: string) => void;
  
  // New SAM3 properties
  sam3ObjectSize?: number;
  onSam3ObjectSizeChange?: (size: number) => void;
  sam3PointPolarity?: 'positive' | 'negative';
  onSam3PointPolarityChange?: (polarity: 'positive' | 'negative') => void;
  sam3PointsCount?: number;
  onClearSam3Points?: () => void;
}

export default function DrawingToolbar({
  activeTool,
  onToolChange,
  selectedLabelClass,
  onLabelClassChange,
  availableClasses,
  onAddNewClass,
  sam3ObjectSize = 40,
  onSam3ObjectSizeChange,
  sam3PointPolarity = 'positive',
  onSam3PointPolarityChange,
  sam3PointsCount = 0,
  onClearSam3Points
}: DrawingToolbarProps) {
  const [newClassInput, setNewClassInput] = useState('');

  const tools: { id: ToolType; title: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'select',
      title: 'Select',
      icon: <MousePointer size={14} />,
      desc: 'Highlight shapes or inspect metadata coordinates'
    },
    {
      id: 'draw_box',
      title: 'Draw Box',
      icon: <BoxIcon size={14} />,
      desc: 'Click and drag on the frame to create standard 2D bounding boxes'
    },
    {
      id: 'draw_polygon',
      title: 'Draw Segment',
      icon: <Triangle size={14} />,
      desc: 'Draw closed multi-point polygon vectors manually'
    },
    {
      id: 'sam3',
      title: 'SAM 3 AI',
      icon: <Target size={14} className="text-indigo-500 animate-pulse" />,
      desc: 'Double-click to auto-segment or click to specify + (positive) and - (negative) points'
    },
    {
      id: 'eraser',
      title: 'Eraser',
      icon: <Scissors size={14} className="text-rose-400" />,
      desc: 'Click on any annotation outline to permanently delete it'
    }
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newClassInput.trim();
    if (clean) {
      onAddNewClass(clean);
      onLabelClassChange(clean);
      setNewClassInput('');
    }
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-5 gap-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <SlidersIcon size={17} className="text-indigo-600" />
        <h2 className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">Manual Toolbar</h2>
      </div>

      {/* Tool selects buttons */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Canvas Tool</label>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((t) => {
            const isActive = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onToolChange(t.id)}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm border-transparent font-semibold shadow-indigo-650/10'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
                title={t.desc}
              >
                {t.icon}
                <span className="text-xs font-bold leading-none">{t.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SAM3 Options Panel */}
      {activeTool === 'sam3' && (
        <div className="flex flex-col gap-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl animate-fade-in text-slate-700">
          <div className="flex items-center gap-1.5 border-b border-indigo-100/50 pb-2">
            <Target size={13} className="text-indigo-600 animate-pulse animate-duration-1000" />
            <span className="text-[11px] font-extrabold text-indigo-950 uppercase tracking-wider">SAM3 Interactive Mode</span>
          </div>

          {/* Size slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wide">Object Size (Radius)</label>
              <span className="text-[10px] font-bold text-indigo-650 bg-white px-1.5 py-0.5 rounded border border-indigo-100">{sam3ObjectSize}px</span>
            </div>
            <input
              type="range"
              min="15"
              max="150"
              value={sam3ObjectSize}
              onChange={(e) => onSam3ObjectSizeChange?.(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-205 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase tracking-wider">
              <span>narrow</span>
              <span>halfway</span>
              <span>broad</span>
            </div>
          </div>

          {/* Point Polarity Controls */}
          <div className="flex flex-col gap-1 pt-1">
            <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wide">Interactive Point Polarity</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSam3PointPolarityChange?.('positive')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                  sam3PointPolarity === 'positive'
                    ? 'bg-emerald-600 text-white border-transparent shadow-xs'
                    : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center justify-center w-3 h-3 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black">+</span>
                <span>Positive</span>
              </button>
              <button
                type="button"
                onClick={() => onSam3PointPolarityChange?.('negative')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                  sam3PointPolarity === 'negative'
                    ? 'bg-rose-600 text-white border-transparent shadow-xs'
                    : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center justify-center w-3 h-3 rounded-full bg-rose-100 text-rose-700 text-[9px] font-black">-</span>
                <span>Negative</span>
              </button>
            </div>
          </div>

          {/* Active points counter & resets */}
          {sam3PointsCount > 0 && (
            <div className="flex items-center justify-between border-t border-indigo-100/30 pt-2 bg-indigo-50/20 px-2 py-1.5 rounded-lg">
              <span className="text-[10px] font-bold text-indigo-900">{sam3PointsCount} constraint point(s) active</span>
              <button
                type="button"
                onClick={onClearSam3Points}
                className="text-[9px] font-extrabold text-rose-600 hover:text-rose-800 underline transition-all bg-transparent border-0 cursor-pointer"
              >
                Reset points
              </button>
            </div>
          )}

          <p className="text-[9px] text-slate-450 leading-relaxed bg-slate-50 border border-slate-100 p-2 rounded-lg">
            💡 <strong>Interactive usage:</strong> Click on the canvas to define key object indicators. Mark inclusion with <span className="text-emerald-600 font-bold">+</span> or exclude background coordinates with <span className="text-rose-500 font-bold">-</span>. Correct object boundaries, then <strong className="text-indigo-600">Double-Click</strong> to render your segment instantly!
          </p>
        </div>
      )}

      {/* Select class and adding custom tag */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target Manual Class</label>
        
        {/* Dropdown classes select */}
        <select
          value={selectedLabelClass}
          onChange={(e) => onLabelClassChange(e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none cursor-pointer focus:border-indigo-500 font-semibold"
        >
          {availableClasses.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>

        {/* Input adding custom class */}
        <form onSubmit={handleFormSubmit} className="flex gap-1.5 mt-1">
          <input
            type="text"
            placeholder="Add Custom Tag..."
            value={newClassInput}
            onChange={(e) => setNewClassInput(e.target.value)}
            className="flex-1 text-xs bg-slate-50 text-slate-900 px-2.5 py-1.5 rounded-lg outline-none border border-slate-250 font-semibold focus:border-indigo-500 placeholder-slate-400"
          />
          <button
            type="submit"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 hover:bg-slate-800 transition-all text-white cursor-pointer shadow-sm shrink-0 font-bold"
            title="Register new class label"
          >
            <Plus size={15} />
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="flex flex-col gap-1.5 mt-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Preset Suggestions</span>
          <div className="flex flex-wrap gap-1">
            {['Worker', 'Cargo Sack', 'Flatbed Truck', 'Pallet', 'Car', 'Pedestrian', 'Athlete', 'Coral Reef', 'Sea Turtle'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  onAddNewClass(preset);
                  onLabelClassChange(preset);
                }}
                className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-all cursor-pointer ${
                  availableClasses.includes(preset)
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500'
                }`}
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon helper to bypass dynamic imports
function SlidersIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}
