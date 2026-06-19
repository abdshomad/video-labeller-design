/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VideoMetadata } from '../types';

interface SampleVideosSelectorProps {
  videos: VideoMetadata[];
  activeVideoId: string;
  onSelectVideo: (video: VideoMetadata) => void;
}

export default function SampleVideosSelector({
  videos,
  activeVideoId,
  onSelectVideo
}: SampleVideosSelectorProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-400 mb-3.5">Sample Video Templates</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {videos.map((vid) => (
          <button
            key={vid.id}
            onClick={() => onSelectVideo(vid)}
            className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
              activeVideoId === vid.id
                ? 'bg-indigo-50/50 border-indigo-400 shadow-sm'
                : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 select-none">
              <span className="text-lg">{vid.thumbnailUrl}</span>
              <span className="text-xs font-bold text-slate-700 line-clamp-1">{vid.title}</span>
            </div>
            <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{vid.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
