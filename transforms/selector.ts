import { Box, Event } from '../sky.ts';
import { Orb, Transform, Representable } from '../orb.ts';
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

// XXX and where do Graphs live??
//  prob like Layers, in userspace for now
//  function selectionBox
//   or wrap class/cons?
//  tied to how will selection be exposed?
//   leave it on opts, it could be like thing.jack.selection
//    so whats thing.jack.opts.selection
//  let selection box expose the selection top
