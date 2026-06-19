/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface EnhancementViewerHeaderProps {
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
}

export default function EnhancementViewerHeader({
  completedTasks,
  totalTasks,
  completionPercentage,
}: EnhancementViewerHeaderProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚀</span>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">System Enhancements Roadmap</h1>
        </div>
        <p className="text-xs text-slate-500 max-w-xl">
          This interactive dashboard loads the live <code className="bg-slate-100 font-mono px-1 rounded">/plan/next-enhancements.md</code> markdown file. Toggling items updates development logs.
        </p>
      </div>

      <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-xl">
        <div className="text-center">
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">COMPLETED</span>
          <span className="text-xl font-black text-indigo-700">
            {completedTasks} <span className="text-xs text-slate-400 font-medium">/ {totalTasks}</span>
          </span>
        </div>
        <div className="h-8 border-l border-slate-200" />
        <div>
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">PROGRESS</span>
          <div className="flex items-center gap-2">
            <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }} 
              />
            </div>
            <span className="text-xs font-bold text-slate-700">{completionPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
