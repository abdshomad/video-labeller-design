/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AutoLabelRule, RuleConditionType } from '../types';
import { DEFAULT_AUTOLABEL_RULES } from '../../data/mockup/autoLabelRules';
import { ToggleLeft, ToggleRight, Plus, Trash2, Eye, ShieldAlert, CheckCircle2, EyeOff } from 'lucide-react';

interface CustomRulesProps {
  onRulesChanged: (rules: AutoLabelRule[]) => void;
  availableClasses: string[];
}

export default function CustomRules({ onRulesChanged, availableClasses }: CustomRulesProps) {
  const [rules, setRules] = useState<AutoLabelRule[]>(DEFAULT_AUTOLABEL_RULES);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Rule Form State
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState<RuleConditionType>('confidence_threshold');
  const [targetClass, setTargetClass] = useState('Car');
  const [thresholdValue, setThresholdValue] = useState('0.80');
  const [relabelTarget, setRelabelTarget] = useState('Vehicle');
  const [minY, setMinY] = useState('0.25');

  const updateParent = (updatedRules: AutoLabelRule[]) => {
    setRules(updatedRules);
    onRulesChanged(updatedRules);
  };

  const handleToggleRule = (id: string) => {
    const updated = rules.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r);
    updateParent(updated);
  };

  const handleDeleteRule = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = rules.filter(r => r.id !== id);
    updateParent(updated);
  };

  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName) return;

    const newRule: AutoLabelRule = {
      id: `rule-${Date.now()}`,
      name: ruleName,
      isEnabled: true,
      type: ruleType,
      classMatch: targetClass,
      value: ruleType === 'confidence_threshold' ? parseFloat(thresholdValue) : undefined,
      relabelTarget: ruleType === 'auto_relabel' ? relabelTarget : undefined,
      spatialArea: ruleType === 'spatial_filtering' ? {
        minY: parseFloat(minY) || 0.0,
        maxY: 1.0,
        minX: 0.0,
        maxX: 1.0
      } : undefined
    };

    const updated = [...rules, newRule];
    updateParent(updated);
    
    // Reset Form
    setRuleName('');
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-5 gap-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert size={17} className="text-indigo-600" />
          <h2 className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">AI Label Filtering Rules</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 text-[11px] font-bold text-indigo-650 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-all cursor-pointer"
        >
          <Plus size={12} />
          <span>New Rule</span>
        </button>
      </div>

      {showAddForm ? (
        <form onSubmit={handleAddRuleSubmit} className="space-y-3 bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1 text-slate-700">
            <span className="font-bold">Construct Auto-Filter Constrain</span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-405 hover:text-slate-600 font-medium"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Filter Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Require high confidence car bounds"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none focus:border-indigo-500 font-medium text-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Rule Type</label>
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value as RuleConditionType)}
                className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none text-slate-700 font-medium focus:border-indigo-500"
              >
                <option value="confidence_threshold">Min Confidence</option>
                <option value="spatial_filtering">Exclude Sky Region</option>
                <option value="auto_relabel">Auto-Relabel Tag</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Target Class</label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none text-slate-700 font-medium focus:border-indigo-500"
              >
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>

          {ruleType === 'confidence_threshold' && (
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Confidence cutoff limit (0.0 - 1.0)</label>
              <input
                type="text"
                placeholder="e.g. 0.82"
                value={thresholdValue}
                onChange={(e) => setThresholdValue(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none font-mono focus:border-indigo-500"
              />
            </div>
          )}

          {ruleType === 'spatial_filtering' && (
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Ignore objects above Y ratio (0.0 to 1.0)</label>
              <input
                type="text"
                placeholder="e.g. 0.35 ignores top sky third"
                value={minY}
                onChange={(e) => setMinY(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none font-mono focus:border-indigo-500"
              />
            </div>
          )}

          {ruleType === 'auto_relabel' && (
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Standardize classification to</label>
              <input
                type="text"
                placeholder="e.g. Vehicle"
                value={relabelTarget}
                onChange={(e) => setRelabelTarget(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none font-semibold focus:border-indigo-500 text-slate-700"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-650 hover:bg-indigo-750 text-white font-bold py-2 px-3 rounded text-[11px] cursor-pointer shadow-sm transition-all"
          >
            Create Constraint Rule
          </button>
        </form>
      ) : (
        <div className="space-y-2">
          {rules.length === 0 ? (
            <div className="text-center py-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 font-medium">
              No filter conditions active.
            </div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                onClick={() => handleToggleRule(rule.id)}
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                  rule.isEnabled
                    ? 'bg-indigo-50/55 border-indigo-200 text-indigo-900'
                    : 'bg-slate-50/50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold truncate text-[11px] ${rule.isEnabled ? 'text-slate-800' : 'text-slate-400'}`}>
                      {rule.name}
                    </span>
                    <span className="text-[9px] font-semibold bg-slate-200/50 text-slate-500 px-1 rounded-sm shrink-0 uppercase tracking-wide">
                      {rule.type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {rule.type === 'confidence_threshold' && `Require confidence ≥ ${rule.value}`}
                    {rule.type === 'spatial_filtering' && `Ignore items where viewport-Y < ${rule.spatialArea?.minY}`}
                    {rule.type === 'auto_relabel' && `Autoremap predicted "${rule.classMatch}" to "${rule.relabelTarget}"`}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                    {rule.isEnabled ? <ToggleRight size={22} className="text-indigo-600" /> : <ToggleLeft size={22} />}
                  </button>
                  <button
                    onClick={(e) => handleDeleteRule(rule.id, e)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg flex items-start gap-2.5 text-[10px] text-slate-500">
        <CheckCircle2 size={13} className="text-indigo-600 shrink-0 mt-0.5" />
        <div>
          Any running manual segmentations or inference auto-label pipelines automatically pass through the above active rules to sanitize coordinate sets.
        </div>
      </div>
    </div>
  );
}
