import { Box, fnt, noop } from '../../sky.ts';
import { Component } from '../../orb.ts';

export type LoopOpts = { bbox: any, wrap: any };
export type LoopIn = { delta: [dx: number, dy: number], args: [cur: any] };
export type LoopOut = { delta: [dx: number, dy: number], args: [cur: any] };
export type LoopMsgs = void;

export class Loop extends Component<LoopOpts> {
  move(delta: number[], cur: any, ...rest: any[]) {
    const [dx, dy] = delta;
    const off = cur.translate || [0, 0];
    const bbox = new Box(this.opts.bbox || {}, true);
    const wrap = this.opts.wrap || noop;
    let ox = fnt(off[0], bbox.left);
    let oy = fnt(off[1], bbox.top);
    let lx = ox, ly = oy, over = true;
    while (over) {
      over = false;
      if (bbox.width) {
        const wx = lx < bbox.left && 1 || lx > bbox.right && -1;
        if (wx) {
          over = true;
          lx += wx * bbox.width;
          if (!wrap.call(this, wx, 0, ox, oy))
            ox += wx * bbox.width;
        }
      }
      if (bbox.height) {
        const wy = ly < bbox.top && 1 || ly > bbox.bottom && -1;
        if (wy) {
          over = true;
          ly += wy * bbox.height;
          if (!wrap.call(this, 0, wy, ox, oy))
            oy += wy * bbox.height;
        }
      }
    }
    cur.translate = [ox, oy];
    super.move(delta, cur, ...rest);
  }
}
