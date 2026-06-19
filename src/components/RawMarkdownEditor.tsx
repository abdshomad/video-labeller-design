/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Save } from 'lucide-react';

interface RawMarkdownEditorProps {
  editedRawText: string;
  setEditedRawText: (text: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function RawMarkdownEditor({
  editedRawText,
  setEditedRawText,
  onSave,
  isSaving,
}: RawMarkdownEditorProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-600">Raw markdown file editor</span>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-slate-850 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save size={13} />
          <span>{isSaving ? 'Saving...' : 'Save File'}</span>
        </button>
      </div>
      <textarea
        value={editedRawText}
        onChange={(e) => setEditedRawText(e.target.value)}
        className="w-full h-112 p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none leading-relaxed border border-slate-950"
        placeholder="# Future Enhancement Plan..."
      />
    </div>
  );
}
