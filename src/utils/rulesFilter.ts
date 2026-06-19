/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Annotation, AutoLabelRule } from '../types';

/**
 * Runs annotations list through user active custom auto-labeling rules
 * and returns the filtered & modified result set.
 */
export function applyLabelRules(annotations: Annotation[], rules: AutoLabelRule[]): Annotation[] {
  const activeRules = rules.filter(r => r.isEnabled);
  if (activeRules.length === 0) return annotations;

  return annotations
    .map(anno => {
      let current = { ...anno };

      for (const rule of activeRules) {
        // Class Auto-Relabeling (Taxon standardization)
        if (rule.type === 'auto_relabel') {
          const matchAll = !rule.classMatch || rule.classMatch === 'all';
          if (matchAll || current.label.toLowerCase() === rule.classMatch?.toLowerCase()) {
            current.label = rule.relabelTarget || current.label;
          }
        }
      }
      return current;
    })
    .filter(anno => {
      for (const rule of activeRules) {
        // Confidence cutoff limit rules
        if (rule.type === 'confidence_threshold') {
          const limit = rule.value ?? 0.0;
          const currentConfidence = anno.confidence ?? 1.0;
          if (currentConfidence < limit) {
            return false; // reject annotation
          }
        }

        // Spatial Region filtering
        if (rule.type === 'spatial_filtering') {
          const bounds = rule.spatialArea;
          if (bounds) {
            // Check bounding box centerY or coordinates
            if (anno.box) {
              const boxY = anno.box.y;
              if (bounds.minY !== undefined && boxY < bounds.minY) return false;
              if (bounds.maxY !== undefined && boxY > bounds.maxY) return false;
            } else if (anno.points && anno.points.length > 0) {
              // average points Y
              const averageY = anno.points.reduce((sum, p) => sum + p.y, 0) / anno.points.length;
              if (bounds.minY !== undefined && averageY < bounds.minY) return false;
              if (bounds.maxY !== undefined && averageY > bounds.maxY) return false;
            }
          }
        }
      }
      return true;
    });
}
