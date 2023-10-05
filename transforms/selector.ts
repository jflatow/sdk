// Copyright 2013-present Jared Flatow
// SPDX-License-Identifier: AGPL-3.0-only

import { Box, Event } from '../sky.ts';
import { Transform, Representable } from '../orb.ts';
import { Selectable, Selection } from '../mutex.ts';

export interface BBoxSelectable extends Representable, Selectable {}

export interface BBoxSelectorOpts<T extends BBoxSelectable> {
  selectable?: () => T[];
  selection?: Selection<T>;
}

export class BBoxSelector<T extends BBoxSelectable> extends Transform<BBoxSelectorOpts<T>> {
  setOpts(opts_: BBoxSelectorOpts<T>): BBoxSelectorOpts<T> {
    const opts = super.setOpts(opts_);
    opts.selection = opts.selection ?? new Selection;
    return opts;
  }

  grab() {
    this.opts.selection!.select();
  }

  move(deltas: number[], bbox: Box, ...rest: any[]) {
    const region = bbox.normalize();
    const selection = this.opts.selection!;
    const selectables = this.opts.selectable?.() ?? [];
    for (const item of selectables) {
      if (region.overlaps(item.elem.bbox())) {
        selection.addSelected(item);
      } else {
        selection.removeSelected(item);
      }
    }
    super.move(deltas, selection, ...rest);
  }
}
