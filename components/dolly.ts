import { Box, clip } from '../sky.ts';
import { Component } from '../orb.ts';

export interface DollyOpts { bbox?: Box };

export class Dolly extends Component<DollyOpts> {
  init() {} // quiet component...

  move(delta: number[], ...rest: any[]) {
    const [dx, dy] = delta;
    const cbox = new Box(this.elem.node.viewBox.baseVal);
    const nbox = cbox.shift(-dx, -dy);
    const bbox = new Box(this.opts.bbox || {}, true);
    if (bbox.width && dx)
      cbox.x = clip(nbox.x, bbox.left, bbox.right);
    if (bbox.height && dy)
      cbox.y = clip(nbox.y, bbox.top, bbox.bottom);
    super.move(delta, cbox, ...rest); // may modify cbox
    this.elem.attrs({ viewBox: cbox });
  }
}
