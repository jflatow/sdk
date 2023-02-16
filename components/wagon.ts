import { Box, clip } from '../sky.ts';
import { Component } from '../orb.ts';

export type WagonOpts = { bbox: any };
export type WagonIn = { delta: [dx: number, dy: number] };
export type WagonOut = { delta: [dx: number, dy: number], args: [cur: any] };
export type WagonMsgs = void;

export class Wagon extends Component<WagonOpts> {
  move(delta: number[], ...rest: any[]) {
    const [dx, dy] = delta;
    const cur = this.elem.transformation();
    const off = cur.translate = cur.translate || [0, 0];
    const bbox = new Box(this.opts.bbox || {}, true);
    if (bbox.width)
      cur.translate[0] = clip(off[0] + dx, bbox.left, bbox.right)
    if (bbox.height)
      cur.translate[1] = clip(off[1] + dy, bbox.top, bbox.bottom)
    this.elem.transform(cur);
    super.move(delta, cur, ...rest);
  }
}
