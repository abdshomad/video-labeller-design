/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import ModelManagement from './ModelManagement';
import BatchProcess from './BatchProcess';
import CustomRules from './CustomRules';
import { CustomModelWeight, AutoLabelRule } from '../types';
import { Cpu, Layers, ShieldCheck, HardDrive } from 'lucide-react';

interface AdvancedPipelineTabsProps {
  onWeightsActivated: (weight: CustomModelWeight) => void;
  activeWeightId: string | null;
  onBatchCompleted: (results: { [videoId: string]: number }) => void;
  onRulesChanged: (rules: AutoLabelRule[]) => void;
  availableClasses: string[];
  availableSampleClips: { id: string; title: string; frameCount: number }[];
}

export default function AdvancedPipelineTabs({
  onWeightsActivated,
  activeWeightId,
  onBatchCompleted,
  onRulesChanged,
  availableClasses,
  availableSampleClips
}: AdvancedPipelineTabsProps) {
  const [activeTab, setActiveTab] = useState<'weights' | 'batch' | 'rules'>('weights');

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Tabs list strip header */}
      <div className="flex border-b border-slate-100 bg-slate-50/50">
        <button
          onClick={() => setActiveTab('weights')}
          className={`flex items-center gap-1.5 flex-1 py-3 px-2 text-xs font-bold border-b-2 transition-all cursor-pointer justify-center ${
            activeTab === 'weights'
              ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
          }`}
        >
          <HardDrive size={13} />
          <span>Weights Node</span>
        </button>

        <button
          onClick={() => setActiveTab('batch')}
          className={`flex items-center gap-1.5 flex-1 py-3 px-2 text-xs font-bold border-b-2 transition-all cursor-pointer justify-center ${
            activeTab === 'batch'
              ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
          }`}
        >
          <Layers size={13} />
          <span>Batch Queue</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-1.5 flex-1 py-3 px-2 text-xs font-bold border-b-2 transition-all cursor-pointer justify-center ${
            activeTab === 'rules'
              ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
          }`}
        >
          <ShieldCheck size={13} />
          <span>Filter Rules</span>
        </button>
      </div>

      {/* Tabs active panels container (without nested cards borders for full seamlessness) */}
      <div className="p-0 select-none bg-white">
        {activeTab === 'weights' && (
          <div className="border-0 shadow-none">
            <ModelManagement
              onWeightsActivated={onWeightsActivated}
              activeWeightId={activeWeightId}
            />
          </div>
        )}
        {activeTab === 'batch' && (
          <div className="border-0 shadow-none">
            <BatchProcess
              onBatchCompleted={onBatchCompleted}
              availableSampleClips={availableSampleClips}
            />
          </div>
        )}
        {activeTab === 'rules' && (
          <div className="border-0 shadow-none">
            <CustomRules
              onRulesChanged={onRulesChanged}
              availableClasses={availableClasses}
            />
          </div>
        )}
      </div>
    </div>
  );
}
