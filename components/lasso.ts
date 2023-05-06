import { Elem } from '../sky.ts';
import { BoxFrame, FrameOpts } from './frame.ts';
import { BBoxSelectable, BBoxSelectorOpts, BBoxSelector } from '../transforms/selector.ts';

export interface SelectionBoxOpts<T extends BBoxSelectable> extends BBoxSelectorOpts<T>, FrameOpts {
  // ...
}

export class SelectionBox<T extends BBoxSelectable> extends BoxFrame<SelectionBoxOpts<T>> {
  declare selector: BBoxSelector<T>;

  get selection() {
    return this.selector.opts.selection;
  }

  defaultOpts() {
    return { ...super.defaultOpts(), transient: true };
  }

  init() {
    super.init();
    this.jack = this.selector = new BBoxSelector(this.jack, this.opts);
  }

  // XXX dotted outline style?
}