/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Square, CheckSquare, Copy, Check } from 'lucide-react';

export interface Task {
  id: string; // e.g., "1.1"
  status: 'TODO' | 'DONE';
  description: string;
  lineIndex: number;
}

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void | Promise<void>;
  key?: string | number;
}

export default function TaskItem({ task, onToggle }: TaskItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `[${task.status}] **${task.id}**: ${task.description}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div 
      onClick={() => onToggle(task)}
      className={`group/task flex items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
        task.status === 'DONE'
          ? 'bg-indigo-50/20 border-indigo-100/30 text-slate-400'
          : 'bg-slate-50/50 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
      }`}
    >
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task);
          }}
          className="text-indigo-650 mt-0.5 shrink-0 transition-transform hover:scale-105"
        >
          {task.status === 'DONE' ? (
            <CheckSquare size={14} className="text-indigo-600 fill-indigo-100" />
          ) : (
            <Square size={14} className="text-slate-450 hover:text-indigo-600" />
          )}
        </button>
        <div className="text-xs leading-normal break-words">
          <span className="font-extrabold text-indigo-750 mr-1">{task.id}</span>
          <span className={task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-650 font-medium'}>
            {task.description}
          </span>
        </div>
      </div>

      <button
        onClick={handleCopy}
        className="shrink-0 p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors md:opacity-0 md:group-hover/task:opacity-100 focus:opacity-100"
        title="Copy task details to clipboards"
      >
        {copied ? (
          <Check size={13} className="text-emerald-500 animate-bounce" />
        ) : (
          <Copy size={13} />
        )}
      </button>
    </div>
  );
}
