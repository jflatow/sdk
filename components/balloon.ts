import { Box, clip } from '../sky.ts';
import { Component } from '../orb.ts';

export interface BalloonOpts { mbox?: any };

export class Balloon extends Component<BalloonOpts> {
  init() {} // quiet component...

  move(delta: number[], ...rest: any[]) {
    const [dx, dy] = delta;
    const cur = this.elem.transformation();
    const mul = cur.scale = cur.scale || [1, 1];
    const mbox = new Box(this.opts.mbox || {}, true);
    if (mbox.width && dx)
      cur.scale[0] = clip(parseFloat(mul[0] as string) + dx, mbox.left, mbox.right);
    if (mbox.height && dy)
      cur.scale[1] = clip(parseFloat(mul[1] as string) + dy, mbox.top, mbox.bottom);
    super.move(delta, cur, ...rest); // may modify cur
    this.elem.transform(cur);
  }
}
