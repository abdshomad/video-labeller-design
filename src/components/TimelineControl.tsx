/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronLeft, ChevronRight, SkipBack, SkipForward, Play, Pause } from 'lucide-react';
import { FrameAnnotations } from '../types';

interface TimelineControlProps {
  currentFrame: number;
  totalFrames: number;
  onFrameChange: (frame: number) => void;
  fullDatabase: FrameAnnotations;
}

export default function TimelineControl({
  currentFrame,
  totalFrames,
  onFrameChange,
  fullDatabase
}: TimelineControlProps) {
  
  const stepPrev = () => {
    if (currentFrame > 0) onFrameChange(currentFrame - 1);
  };

  const stepNext = () => {
    if (currentFrame < totalFrames - 1) onFrameChange(currentFrame + 1);
  };

  const jumpToStart = () => onFrameChange(0);
  const jumpToEnd = () => onFrameChange(totalFrames - 1);

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-5 gap-4 shadow-sm">
      {/* Upper Navigation Row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-bold leading-none">Frame Navigation</span>
        
        {/* Buttons Controls */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
          <button
            onClick={jumpToStart}
            disabled={currentFrame === 0}
            className="p-1 px-1.5 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
            title="Start Frame"
          >
            <SkipBack size={13} />
          </button>
          
          <button
            onClick={stepPrev}
            disabled={currentFrame === 0}
            className="p-1 px-1.5 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 flex items-center gap-0.5 cursor-pointer"
            title="Previous Frame"
          >
            <ChevronLeft size={14} />
            <span className="text-[10px] font-medium uppercase font-mono">Prev</span>
          </button>

          <span className="text-[11px] h-4 w-px bg-slate-200 mx-1" />

          <button
            onClick={stepNext}
            disabled={currentFrame === totalFrames - 1}
            className="p-1 px-1.5 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 flex items-center gap-0.5 cursor-pointer"
            title="Next Frame"
          >
            <span className="text-[10px] font-medium uppercase font-mono">Next</span>
            <ChevronRight size={14} />
          </button>

          <button
            onClick={jumpToEnd}
            disabled={currentFrame === totalFrames - 1}
            className="p-1 px-1.5 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
            title="End Frame"
          >
            <SkipForward size={13} />
          </button>
        </div>
      </div>

      {/* Frame Timeline ticks scrub */}
      <div className="flex flex-col gap-2">
        {/* The timeline tracking ticks */}
        <div className="relative w-full px-1">
          <input
            type="range"
            min="0"
            max={totalFrames - 1}
            value={currentFrame}
            onChange={(e) => onFrameChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-650"
          />

          {/* Markers representing frames which already have annotations! */}
          <div className="absolute left-1 right-1 -top-1.5 flex justify-between pointer-events-none select-none">
            {Array.from({ length: totalFrames }).map((_, fIdx) => {
              const hasLabels = fullDatabase[fIdx] && fullDatabase[fIdx].length > 0;
              const isActive = currentFrame === fIdx;
              
              return (
                <div key={fIdx} className="flex flex-col items-center flex-1 relative">
                  {/* Glowing keyframe microdot */}
                  {hasLabels && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full absolute -top-1.5 transition-all ${
                        isActive ? 'bg-amber-500 ring-2 ring-amber-500/30' : 'bg-indigo-600'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Labels tick indexes */}
        <div className="flex justify-between px-1 select-none text-[10px] text-slate-400 font-mono">
          {Array.from({ length: totalFrames }).map((_, fIdx) => {
            const isActive = currentFrame === fIdx;
            return (
              <span
                key={fIdx}
                onClick={() => onFrameChange(fIdx)}
                className={`cursor-pointer hover:text-slate-700 transition-colors py-1 ${
                  isActive ? 'text-indigo-600 font-bold' : ''
                }`}
              >
                F{fIdx + 1}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
