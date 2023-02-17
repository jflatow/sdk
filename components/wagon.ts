import { Box, clip } from '../sky.ts';
import { Component } from '../orb.ts';

export interface WagonOpts { bbox?: any };

export class Wagon extends Component<WagonOpts> {
  move(delta: number[], ...rest: any[]) {
    const [dx, dy] = delta;
    const cur = this.elem.transformation();
    const off = cur.translate = cur.translate || [0, 0];
    const bbox = new Box(this.opts.bbox || {}, true);
    if (bbox.width && dx)
      cur.translate[0] = clip(off[0] + dx, bbox.left, bbox.right)
    if (bbox.height && dy)
      cur.translate[1] = clip(off[1] + dy, bbox.top, bbox.bottom)
    super.move(delta, cur, ...rest); // may modify cur
    this.elem.transform(cur);
  }
}
