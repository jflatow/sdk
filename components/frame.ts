import { Box, Elem, Event, Point } from '../sky.ts';
import { Component } from '../orb.ts';

export interface Shape<M, E = Elem> {
  deform(deltas: number[], mode?: M): this;
  mold(elem: E): void;
}

export interface ShapeConstructor<M, E = Elem> {
  new (point?: Point): Shape<M, E>;
}

export type BoxShapeMode = 'move' | 'resize';
export class BoxShape extends Box {
  constructor(point?: Point) { super(point) }

  deform(deltas: number[], mode?: BoxShapeMode): this {
    const [dx, dy] = deltas;
    switch (mode) {
      case 'move':
        return this.shift(dx, dy);
      case 'resize':
      default:
        return this.stretch(dx, dy);
    }
  }

  mold(elem: Elem) {
    elem.embox(this.normalize());
  }
}

export interface FrameOpts<M = BoxShapeMode> {
  shape?: Shape<M>,
  shapeFn?: ShapeConstructor<M>,
  transient?: boolean,
};

export class Frame<M = BoxShapeMode, O extends FrameOpts<M> = FrameOpts<M>> extends Component<O> {
  defaultOpts(): O {
    return { shapeFn: BoxShape } as any;
  }

  setOpts(opts_: O): O {
    const opts = super.setOpts(opts_);
    const shape = opts.shape = opts.shape ?? new opts.shapeFn!();
    shape.mold(this.elem);
    return opts;
  }

  grab(e: Event, ...rest: any[]) {
    super.grab(e, ...rest);
    if (!this.opts.shape || this.opts.transient)
      this.setOpts({ shape: new this.opts.shapeFn!(this.elem.pos(e)) } as O);
    if (this.opts.transient)
      this.elem.show();
    this.elem.order(-1);
  }

  move(deltas: number[], ...rest: any[]) {
    const shape = this.opts.shape?.deform(deltas, this.mode as M);
    super.move(deltas, shape, ...rest); // may modify shape
    this.setOpts({ shape } as O);
  }

  free(e: Event, ...rest: any[]) {
    super.free(e, ...rest);
    if (this.opts.transient)
      this.elem.hide();
  }
}
