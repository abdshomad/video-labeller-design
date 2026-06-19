/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AutoLabelRule } from '../../src/types';

export const DEFAULT_AUTOLABEL_RULES: AutoLabelRule[] = [
  {
    id: 'rule-high-confidence',
    name: 'Reject Noise Signals',
    isEnabled: true,
    type: 'confidence_threshold',
    value: 0.75
  },
  {
    id: 'rule-urban-exclude-sky',
    name: 'Only Lower Frame Targets',
    isEnabled: false,
    type: 'spatial_filtering',
    spatialArea: {
      minY: 0.30,
      maxY: 1.00,
      minX: 0.00,
      maxX: 1.00
    }
  },
  {
    id: 'rule-unify-taxonomy',
    name: 'Re-Tag Vehicle Entities',
    isEnabled: true,
    type: 'auto_relabel',
    classMatch: 'Car',
    relabelTarget: 'Vehicle'
  }
];
