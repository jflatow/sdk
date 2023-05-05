import { Elem } from '../sky.ts';
import { Frame, FrameOpts, BoxShapeMode } from './frame.ts';
import { BBoxSelectable, BBoxSelectorOpts, BBoxSelector } from '../transforms/selector.ts';

export interface SelectionBoxOpts<T extends BBoxSelectable> extends BBoxSelectorOpts<T>, FrameOpts {
  // ...
}

export class SelectionBox<T extends BBoxSelectable> extends Frame<BoxShapeMode, SelectionBoxOpts<T>> {
  get selection() {
    return this.opts.selection;
  }

  defaultOpts() {
    return { ...super.defaultOpts(), transient: true };
  }

  init() {
    super.init();
    this.jack = new BBoxSelector(this.jack, this.opts);
  }
}