// Copyright 2013-present Jared Flatow
// SPDX-License-Identifier: AGPL-3.0-only

import { Box } from '../sky.ts';
import { Component } from '../orb.ts';

export interface ZoomOpts { mbox?: Box };

export class Zoom extends Component<ZoomOpts> {
  init() {} // quiet component...

  move(delta: number[], ...rest: any[]) {
    const [dx, dy] = delta;
    const cbox = new Box(this.elem.node.viewBox.baseVal);
    const nbox = cbox.scale(1 - dx / cbox.w, 1 - dy / cbox.h);
    const mbox = new Box(this.opts.mbox || { x: 1, y: 1 }, true);
    if (mbox.width && dx)
      if (mbox.left <= nbox.w && nbox.w <= mbox.right)
        Object.assign(cbox, { x: nbox.x, w: nbox.w });
    if (mbox.height && dy)
      if (mbox.top <= nbox.h && nbox.h <= mbox.bottom)
        Object.assign(cbox, { y: nbox.y, h: nbox.h });
    super.move(delta, cbox, ...rest); // may modify cbox
    this.elem.attrs({ viewBox: cbox });
  }
}
