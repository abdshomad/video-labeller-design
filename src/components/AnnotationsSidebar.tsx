/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Download, Upload, Trash2, Tag, ShieldCheck, Copy, ChevronRight } from 'lucide-react';
import { Annotation, FrameAnnotations } from '../types';

interface AnnotationsSidebarProps {
  activeVideoId: string;
  annotations: Annotation[];
  activeAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onAnnotationDelete: (id: string) => void;
  fullDatabase: FrameAnnotations;
  onImportDatabase: (imported: FrameAnnotations) => void;
  onCopyPrevious: (count: number) => void;
  onClearAnnotations: () => void;
  currentFrame: number;
}

export default function AnnotationsSidebar({
  activeVideoId,
  annotations,
  activeAnnotationId,
  onSelectAnnotation,
  onAnnotationDelete,
  fullDatabase,
  onImportDatabase,
  onCopyPrevious,
  onClearAnnotations,
  currentFrame
}: AnnotationsSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Download annotations to localized JSON format
  const handleExportJSON = () => {
    const formatted = {
      videoId: activeVideoId,
      exportedAt: new Date().toISOString(),
      schema: 'video-frame-labeler-v1.0',
      frames: fullDatabase,
    };
    const blob = new Blob([JSON.stringify(formatted, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotations-${activeVideoId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import existing JSON annotations
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.frames) {
          onImportDatabase(parsed.frames);
          alert('Database loaded successful! All video frame labels have been synchronized.');
        } else if (parsed && typeof parsed === 'object') {
          // Fallback to direct frame binding
          onImportDatabase(parsed);
          alert('Annotations synchronized directly.');
        } else {
          alert('Invalid file format. Please check the JSON schema.');
        }
      } catch (err: any) {
        alert('Failed parsing file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-5 gap-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Tag size={17} className="text-indigo-600" />
          <h2 className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">Object Registry</h2>
        </div>
        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-200">
          {annotations.length} items
        </span>
      </div>

      {/* Export / Import Panel */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleExportJSON}
          className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all shadow-sm cursor-pointer"
        >
          <Download size={13} />
          <span>Export JSON</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold py-2 px-3 rounded-lg transition-all cursor-pointer"
        >
          <Upload size={13} />
          <span>Import JSON</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportJSON}
          className="hidden"
        />
      </div>

      {/* Frame Operations & Propagation Dashboard */}
      <div className="border-t border-b border-slate-100 py-3.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Multi-Frame Propagation</span>
          <span className="text-[10px] text-indigo-650 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">Frame {currentFrame + 1}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onCopyPrevious(1)}
            className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 text-[11px] font-bold py-1.5 rounded-lg transition-all cursor-pointer"
            title="Duplicates all annotations from current frame - 1 directly onto the current active timestamp"
          >
            <Copy size={12} className="text-indigo-650" />
            <span>Copy Prev (1f)</span>
          </button>
          
          <button
            onClick={onClearAnnotations}
            className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-205 text-rose-600 hover:bg-rose-50 hover:border-rose-200 text-[11px] font-bold py-1.5 rounded-lg transition-all cursor-pointer"
            title="Clear all annotations on this frame"
          >
            <Trash2 size={12} />
            <span>Clear Frame</span>
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200/70 p-2.5 rounded-lg flex flex-col gap-1.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Propagate labels forward onto next:</span>
          <div className="grid grid-cols-4 gap-1.5">
            {[10, 20, 50, 100].map((val) => (
              <button
                key={val}
                onClick={() => onCopyPrevious(val)}
                className="bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-250 hover:text-indigo-700 text-slate-650 text-[10px] font-extrabold py-1 rounded-md transition-all cursor-pointer text-center"
                title={`Propagate labels of previous frame onto the next ${val} frames`}
              >
                +{val}f
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Label entries list */}
      <div className="flex flex-col gap-2 overflow-y-auto max-h-72 bg-slate-50 p-2 rounded-xl border border-slate-200">
        {annotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-405 gap-1 select-none">
            <span className="text-xl">✏️</span>
            <p className="text-xs font-bold text-slate-700">No active frame labels</p>
            <p className="text-[10px] opacity-75 max-w-[200px] text-slate-500 leading-relaxed">Select a drawing tool from manual toolbar or draw boundaries on the canvas window</p>
          </div>
        ) : (
          annotations.map((anno) => {
            const isSelected = activeAnnotationId === anno.id;
            return (
              <div
                key={anno.id}
                onClick={() => onSelectAnnotation(isSelected ? null : anno.id)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 shadow-sm font-medium'
                    : 'bg-white border-slate-100 text-slate-650 hover:border-slate-250 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Label Color dot */}
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: anno.color }} />
                  
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700">{anno.label}</span>
                    <span className={`text-[9px] flex items-center gap-1 font-mono uppercase ${
                      isSelected ? 'text-indigo-600/80' : 'text-slate-400'
                    }`}>
                      {anno.type} • {anno.modelName} ({(anno.confidence * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnnotationDelete(anno.id);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="text-[11px] leading-relaxed text-slate-500 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1.5 text-slate-600 font-bold mb-1">
          <ShieldCheck size={13} className="text-indigo-600" />
          <span>Active JSON Format</span>
        </div>
        Normalized coordinates 0.0-1.0 ensure frame-to-frame annotation consistency independently of scale variations or video container resizes.
      </div>
    </div>
  );
}
