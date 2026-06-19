/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Sparkles, 
  Loader2, 
  Plus, 
  Eye, 
  UploadCloud, 
  ShieldAlert,
  Search
} from 'lucide-react';

interface DetectedItem {
  id: string;
  name: string;
  count: number;
  confidence: number;
  icon: string;
}

interface DetectionOnboardingModalProps {
  isOpen: boolean;
  fileName: string;
  onConfirm: (selectedClasses: string[]) => void;
  onCancel: () => void;
}

export default function DetectionOnboardingModal({
  isOpen,
  fileName,
  onConfirm,
  onCancel
}: DetectionOnboardingModalProps) {
  // Simulating three states: 'uploading' -> 'scanning' -> 'selecting'
  const [phase, setPhase] = useState<'uploading' | 'scanning' | 'selecting'>('uploading');
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [scanPercent, setScanPercent] = useState<number>(0);
  const [scanStatusText, setScanStatusText] = useState<string>('Preparing model weights...');
  
  const [detectedObjects, setDetectedObjects] = useState<DetectedItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState<string>('');

  // Define dynamic contexts based on uploaded file naming patterns
  useEffect(() => {
    if (!isOpen) {
      setPhase('uploading');
      setUploadPercent(0);
      setScanPercent(0);
      setNewLabel('');
      return;
    }

    const nameLower = fileName.toLowerCase();
    let initialList: DetectedItem[] = [];

    if (nameLower.includes('warehouse') || nameLower.includes('logistics') || nameLower.includes('shelf') || nameLower.includes('box')) {
      initialList = [
        { id: 'box', name: 'Box', count: 52, confidence: 96, icon: '📦' },
        { id: 'pallet', name: 'Pallet', count: 24, confidence: 91, icon: '🪵' },
        { id: 'forklift', name: 'Forklift', count: 12, confidence: 95, icon: '🚜' },
        { id: 'worker', name: 'Worker', count: 8, confidence: 88, icon: '👷' },
        { id: 'rack', name: 'Rack', count: 35, confidence: 89, icon: '🏗️' }
      ];
    } else if (nameLower.includes('sport') || nameLower.includes('game') || nameLower.includes('court') || nameLower.includes('basket') || nameLower.includes('soccer')) {
      initialList = [
        { id: 'player', name: 'Player', count: 42, confidence: 97, icon: '🏃' },
        { id: 'ball', name: 'Ball', count: 15, confidence: 93, icon: '⚽' },
        { id: 'jersey', name: 'Jersey', count: 38, confidence: 91, icon: '👕' },
        { id: 'referee', name: 'Referee', count: 3, confidence: 85, icon: '🏁' },
        { id: 'hoop', name: 'Goal Net', count: 5, confidence: 94, icon: '🥅' }
      ];
    } else if (nameLower.includes('classroom') || nameLower.includes('office') || nameLower.includes('room') || nameLower.includes('desk')) {
      initialList = [
        { id: 'person', name: 'Person', count: 18, confidence: 94, icon: '👤' },
        { id: 'chair', name: 'Chair', count: 24, confidence: 91, icon: '🪑' },
        { id: 'computer', name: 'Laptop', count: 15, confidence: 95, icon: '💻' },
        { id: 'desk', name: 'Desk', count: 12, confidence: 87, icon: '📥' },
        { id: 'notebook', name: 'Book', count: 9, confidence: 82, icon: '📘' }
      ];
    } else {
      // Default Traffic & Street Smart Detection (arranged from highest count to lowest)
      initialList = [
        { id: 'car', name: 'Car', count: 48, confidence: 98, icon: '🚗' },
        { id: 'pedestrian', name: 'Person', count: 29, confidence: 94, icon: '🚶' },
        { id: 'signal', name: 'Traffic Light', count: 16, confidence: 92, icon: '🚦' },
        { id: 'bicycle', name: 'Bicycle', count: 11, confidence: 89, icon: '🚲' },
        { id: 'truck', name: 'Truck', count: 7, confidence: 91, icon: '🚚' },
        { id: 'obstacle', name: 'Barrier', count: 5, confidence: 86, icon: '🚧' }
      ];
    }

    // Sort detected items by total occurrences descending
    const sorted = [...initialList].sort((a, b) => b.count - a.count);
    setDetectedObjects(sorted);

    // Auto-select all detected items in list by default
    const autoActive = sorted.map(item => item.id);
    setSelectedIds(autoActive);

    // 1. Simulate fast uploading steps
    let uploadTimer: NodeJS.Timeout;
    let upVal = 0;
    const runUpload = () => {
      upVal += 10;
      if (upVal >= 100) {
        setUploadPercent(100);
        // Switch to Scanning video frames phase
        setPhase('scanning');
      } else {
        setUploadPercent(upVal);
        uploadTimer = setTimeout(runUpload, 60);
      }
    };
    runUpload();

    return () => {
      clearTimeout(uploadTimer);
    };
  }, [isOpen, fileName]);

  // Handle Scanning Phase ticks
  useEffect(() => {
    if (phase !== 'scanning') return;

    let scanTimer: NodeJS.Timeout;
    let scanVal = 0;

    const runScan = () => {
      scanVal += 4;
      if (scanVal >= 100) {
        setScanPercent(100);
        setPhase('selecting');
      } else {
        setScanPercent(scanVal);
        
        // Dynamic feedback text corresponding to scan intervals
        if (scanVal < 25) {
          setScanStatusText(`Scanning frame ${Math.round(scanVal * 1.0)}... Initializing Local Core model`);
        } else if (scanVal < 50) {
          const firstObjName = detectedObjects[0]?.name || 'objects';
          setScanStatusText(`Scanning frame ${Math.round(scanVal * 1.0)}... Found potential ${firstObjName} instances`);
        } else if (scanVal < 75) {
          const secondObjName = detectedObjects[1]?.name || 'shapes';
          setScanStatusText(`Scanning frame ${Math.round(scanVal * 1.0)}... Matching ${secondObjName} bounding patterns`);
        } else {
          setScanStatusText(`Finalizing annotation prediction maps...`);
        }

        scanTimer = setTimeout(runScan, 50);
      }
    };
    runScan();

    return () => {
      clearTimeout(scanTimer);
    };
  }, [phase, detectedObjects]);

  if (!isOpen) return null;

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleAddCustomClass = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newLabel.trim();
    if (!clean) return;

    const alreadyExists = detectedObjects.some(
      o => o.name.toLowerCase() === clean.toLowerCase() || o.id.toLowerCase() === clean.toLowerCase()
    );

    if (alreadyExists) {
      setNewLabel('');
      return;
    }

    const customId = `custom-${Date.now()}`;
    const newItem: DetectedItem = {
      id: customId,
      name: clean,
      count: 1,
      confidence: 100,
      icon: '🏷️'
    };

    setDetectedObjects(prev => [...prev, newItem]);
    setSelectedIds(prev => [...prev, customId]);
    setNewLabel('');
  };

  const handleFinishOnboarding = () => {
    const chosenClassNames = detectedObjects
      .filter(item => selectedIds.includes(item.id))
      .map(item => item.name);

    if (chosenClassNames.length === 0) {
      alert('Please select at least one object to label.');
      return;
    }

    onConfirm(chosenClassNames);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Darkened visual backdrop mask */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" 
        onClick={onCancel}
      />

      <div className="relative w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-xl border border-slate-200 animate-slide-up z-10">
        
        {/* Phase 1: Uploading Video Phase */}
        {phase === 'uploading' && (
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
            <div className="p-3.5 mb-4 rounded-full bg-blue-50 border border-blue-100 text-blue-600 animate-bounce">
              <UploadCloud size={28} />
            </div>
            
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Uploading "{fileName}"...
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-xs">
              Sending media sequence frames to the applet editor safely.
            </p>

            <div className="mt-6 w-full max-w-[240px]">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-1.5">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-100" 
                  style={{ width: `${uploadPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-bold font-mono text-slate-500">
                {uploadPercent}% uploaded
              </span>
            </div>
          </div>
        )}

        {/* Phase 2: Detecting & Scanning in Progress */}
        {phase === 'scanning' && (
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center bg-white">
            <div className="p-3.5 mb-4 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Loader2 size={28} className="animate-spin" />
            </div>
            
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Analyzing video patterns...
            </h3>
            <p className="mt-1 text-xs text-indigo-600 font-semibold bg-indigo-50 border border-indigo-100/50 rounded-lg px-2.5 py-1 text-[11px]">
              {scanStatusText}
            </p>

            <div className="mt-6 w-full max-w-[240px]">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-1.5">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-100" 
                  style={{ width: `${scanPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-bold font-mono text-slate-500">
                AI Match Rate: {scanPercent}%
              </span>
            </div>
          </div>
        )}

        {/* Phase 3: Choose Objects Selection Screen */}
        {phase === 'selecting' && (
          <div className="flex flex-col max-h-[85vh]">
            
            {/* Simple Heading */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                  <Sparkles size={11} className="shrink-0" />
                  <span>Objects Detected Successfully!</span>
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                  Choose which objects to label
                </h3>
              </div>
              <button 
                onClick={onCancel}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Sub-explanation */}
            <div className="px-5 py-3.5 bg-indigo-50/60 border-b border-indigo-100/30 flex items-start gap-2 text-indigo-950">
              <Eye size={14} className="text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold leading-normal">
                We scanned your video and found these. Check the objects you want to trace. Unchecked items will be ignored.
              </div>
            </div>

            {/* Scanned Objects Check List (Highest count/most available goes first) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              
              <div className="space-y-1.5">
                {detectedObjects.map((item, index) => {
                  const isChecked = selectedIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleSelect(item.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none group ${
                        isChecked 
                          ? 'bg-indigo-50/30 border-indigo-200' 
                          : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'border-slate-300 bg-white group-hover:border-slate-400'
                        }`}>
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </div>
                        <span className="text-base shrink-0 filter drop-shadow-3xs">{item.icon}</span>
                        
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${
                            isChecked ? 'text-indigo-950 font-black' : 'text-slate-800'
                          }`}>
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {index === 0 ? '🏆 Most common object' : `Found ${item.count} items`}
                          </span>
                        </div>
                      </div>

                      {/* Right count representation */}
                      <div className="text-right">
                        <span className={`text-[10px] font-bold rounded px-1.5 py-0.5 whitespace-nowrap ${
                          isChecked 
                            ? 'bg-indigo-100 text-indigo-700' 
                            : 'bg-slate-150 text-slate-500'
                        }`}>
                          {item.count} items
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add custom brand labels */}
              <form onSubmit={handleAddCustomClass} className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Enter other objects to label (e.g. Tree, Sign)..."
                    className="w-full text-xs font-medium pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50/50"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-2.5 rounded-xl block transition-all shrink-0"
                >
                  Add Label
                </button>
              </form>

            </div>

            {/* Footer Buttons */}
            <div className="px-5 py-4.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">
                {selectedIds.length} classes active
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Start Labeling</span>
                  <Check size={12} />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
