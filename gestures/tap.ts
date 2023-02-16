import { Elem, abs, up } from '../sky.ts';
import { OrbLike, Transform } from '../orb.ts';
import { swipe } from './swipe.ts';

export type TapOpts = { gap?: number, mx?: number, my?: number, stop?: number };
export type TapMsgs = { fire: any };

export function tap(elem: Elem, jack: OrbLike, opts_: TapOpts) {
  const opts = up({ gap: 250, mx: 1, my: 1 }, opts_);
  let open = false, Dx: number, Dy: number;
  class TapTransform extends Transform<TapOpts> {
    grab(e: Event, ...rest: any[]) {
      Dx = Dy = 0;
      open = true;
      setTimeout(function () { open = false }, opts.gap);
      if (opts.stop)
        e.stopImmediatePropagation();
      super.grab(e, ...rest);
    }

    move(delta: number[], ...rest: any[]) {
      const [dx, dy] = delta;
      Dx += abs(dx);
      Dy += abs(dy);
      super.move(delta, ...rest);
    }

    free(e: Event, ...rest: any[]) {
      if (open && Dx <= opts.mx && Dy <= opts.my)
        this.send({ fire: e });
      open = false;
      if (opts.stop)
        e.stopImmediatePropagation();
      super.free(e, ...rest);
    }
  }
  swipe(elem, new TapTransform(jack, opts), { stop: opts.stop });
}
