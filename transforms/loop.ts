// Copyright 2013-present Jared Flatow
// SPDX-License-Identifier: AGPL-3.0-only

import { Box, Transformation, fnt, noop } from '../sky.ts';
import { Transform } from '../orb.ts';

export interface LoopOpts { bbox?: any, wrap?: any };

export class Loop extends Transform<LoopOpts> {
  move(deltas: number[], cur: Transformation, ...rest: any[]) {
    const [dx, dy] = deltas;
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
    super.move(deltas, cur, ...rest);
  }
}
