/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { fetchPlatformPlan, savePlatformPlan } from '../services/api';
import { ClipboardList, PenTool, CheckCircle2, RotateCw, AlertCircle } from 'lucide-react';
import TaskItem, { Task } from './TaskItem';
import RawMarkdownEditor from './RawMarkdownEditor';
import EnhancementViewerHeader from './EnhancementViewerHeader';

interface Group {
  title: string;
  tasks: Task[];
}

export default function EnhancementPlanViewer() {
  const [rawContent, setRawContent] = useState<string>('');
  const [lines, setLines] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isEditingRaw, setIsEditingRaw] = useState<boolean>(false);
  const [editedRawText, setEditedRawText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadPlan = async () => {
    try {
      setError(null);
      const data = await fetchPlatformPlan();
      setRawContent(data);
      setEditedRawText(data);
      parseContent(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to read enhancements roadmap');
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  const parseContent = (content: string) => {
    const fileLines = content.split('\n');
    setLines(fileLines);

    const parsedGroups: Group[] = [];
    let currentGroup: Group | null = null;

    fileLines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Look for section headers (e.g., ## 1. AI Inference Pipeline Modules)
      if (trimmed.startsWith('##')) {
        const title = trimmed.replace(/^##\s*/, '');
        currentGroup = { title, tasks: [] };
        parsedGroups.push(currentGroup);
      }

      // Look for custom enhancement task items (e.g., - **1.1**: [TODO] description)
      if (trimmed.startsWith('-') && currentGroup) {
        // Parse task details using RegExp
        const taskRegex = /-\s*\*\*([\d\.]+)\*\*:\s*\[(TODO|DONE)\]\s*(.*)/i;
        const match = trimmed.match(taskRegex);
        if (match) {
          const id = match[1];
          const status = match[2].toUpperCase() as 'TODO' | 'DONE';
          const description = match[3];
          currentGroup.tasks.push({
            id,
            status,
            description,
            lineIndex: index
          });
        }
      }
    });

    setGroups(parsedGroups);
  };

  const handleToggleTask = async (task: Task) => {
    const nextStatus = task.status === 'TODO' ? 'DONE' : 'TODO';
    const updatedLines = [...lines];
    
    // Structure the markdown line precisely to preserve formatting
    updatedLines[task.lineIndex] = `- **${task.id}**: [${nextStatus}] ${task.description}`;
    
    const newContent = updatedLines.join('\n');
    await saveAndRefresh(newContent);
  };

  const saveAndRefresh = async (newContent: string) => {
    setIsSaving(true);
    setMessage(null);
    try {
      const success = await savePlatformPlan(newContent);
      if (success) {
        setRawContent(newContent);
        setEditedRawText(newContent);
        parseContent(newContent);
        setMessage('Roadmap successfully persisted to next-enhancements.md');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError('Server failed to write updates to files.');
      }
    } catch (err: any) {
      setError(err.message || 'Write error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRawSave = async () => {
    await saveAndRefresh(editedRawText);
    setIsEditingRaw(false);
  };

  // Stats calculate
  const totalTasks = groups.reduce((acc, g) => acc + g.tasks.length, 0);
  const completedTasks = groups.reduce((acc, g) => acc + g.tasks.filter(t => t.status === 'DONE').length, 0);
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-slate-50 min-h-screen p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Block with stats overview */}
        <EnhancementViewerHeader
          completedTasks={completedTasks}
          totalTasks={totalTasks}
          completionPercentage={completionPercentage}
        />

        {/* Messaging Feedback and Operation Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditingRaw(!isEditingRaw)}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.8 bg-white border border-slate-250 text-slate-600 hover:text-slate-800 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              {isEditingRaw ? <ClipboardList size={13} /> : <PenTool size={13} />}
              <span>{isEditingRaw ? 'Interactive Mode' : 'Raw Markdown Editor'}</span>
            </button>
            <button
              onClick={loadPlan}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.8 bg-white border border-slate-250 text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Reload roadmap file"
            >
              <RotateCw size={12} className={isSaving ? 'animate-spin' : ''} />
              <span>Sync file</span>
            </button>
          </div>

          {message && (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3.5 py-1.5 rounded-xl">
              <CheckCircle2 size={13} />
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-3.5 py-1.5 rounded-xl">
              <AlertCircle size={13} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Main Content Pane */}
        {isEditingRaw ? (
          <RawMarkdownEditor
            editedRawText={editedRawText}
            setEditedRawText={setEditedRawText}
            onSave={handleRawSave}
            isSaving={isSaving}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {groups.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white border border-slate-200 rounded-2xl">
                <span className="text-3xl">🫙</span>
                <p className="text-sm font-bold text-slate-700 mt-2">No parsed modules found</p>
                <p className="text-xs text-slate-400 mt-1">Please ensure your roadmap markdown file format has task items structured as `- **Id**: [TODO] Description`</p>
              </div>
            ) : (
              groups.map((group, gIdx) => {
                const completedCount = group.tasks.filter(t => t.status === 'DONE').length;
                const totalCount = group.tasks.length;
                const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                return (
                  <div key={gIdx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-[420px] transition-all hover:shadow-xs hover:border-slate-300">
                    <div className="space-y-4 flex-1 overflow-hidden">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Module {gIdx + 1}</span>
                        <h2 className="text-sm font-bold text-slate-800 tracking-tight truncate" title={group.title}>{group.title}</h2>
                      </div>
                      
                      {/* Inner Task Items List */}
                      <div className="space-y-3 overflow-y-auto max-h-[260px] pr-1.5 scrollbar-thin">
                        {group.tasks.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={handleToggleTask}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Bottom Progress details */}
                    <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-slate-755">{completedCount} <span className="text-slate-400 font-medium">/ {totalCount}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{progress}%</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
