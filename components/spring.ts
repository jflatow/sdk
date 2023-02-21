import { Box, abs, log, up } from '../sky.ts';
import { Component } from '../orb.ts';

export interface SpringOpts {
  lock?: boolean,
  kx?: number, ky?: number,
  lx?: number, ly?: number,
  tx?: number, ty?: number,
  restore?: any,
  stretch?: any,
  balance?: any,
  perturb?: any
};

export class Spring extends Component<SpringOpts> {
  // XXX can combos handle state like this? have to inline initializers?
  dx = 0;
  dy = 0;
  anim?: any;

  move(delta: number[], ...rest: any[]) {
    const {
      lock,
      kx, ky,
      lx, ly,
      tx, ty,
      ...fns
    } = up({ kx: 8, ky: 8, lx: 1, ly: 1, tx: 1, ty: 1 }, this.opts);
    const restore = fns.restore ?? (
      (dx: number, dy: number, mx: number, my: number): any => {
        if (lock && this.grip)
          return;
        if (mx > tx) dx /= kx * log(mx + 1) || 1;
        if (my > ty) dy /= ky * log(my + 1) || 1;
        this.dx -= dx;
        this.dy -= dy;
        return super.move([dx, dy], ...rest);
      }
    );
    const [dx, dy] = delta;
    this.dx += lx * dx;
    this.dy += ly * dy;
    fns.stretch?.call(this);
    if (!this.anim) {
      fns.perturb?.call(this);
      this.anim = this.elem.animate(() => {
        const dx = this.dx, dy = this.dy, mx = abs(dx), my = abs(dy);
        const more = restore.call(this, dx, dy, mx, my) || this.dx || this.dy || this.grip;
        if (!more) {
          this.anim = null;
          fns.balance?.call(this);
        }
        return more;
      });
    }
    super.move(delta, ...rest);
  }
}
