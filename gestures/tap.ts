// Copyright 2013-present Jared Flatow
// SPDX-License-Identifier: AGPL-3.0-only

import { Elem, abs, up } from '../sky.ts';
import { Event, Events, Orb, OrbLike, Transform } from '../orb.ts';
import { swipe } from './swipe.ts';

export interface TapOpts { gap?: number, mx?: number, my?: number, stop?: boolean };
export interface TapSend { fire: Event };

export function tap(elem: Elem, jack: OrbLike, opts_: TapOpts = {}) {
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

export interface DblTapOpts { gap?: number, prevent?: boolean };

export function dbltap(elem: Elem, jack_: OrbLike, opts_: DblTapOpts = {}) {
  const jack = Orb.from(jack_);
  const opts = up({ gap: 250 }, opts_);
  let taps = 0;
  elem.on(Events.pointerdown, (e: Event) => {
    if (taps++)
      jack.send({ fire: e });
    setTimeout(() => { taps = 0 }, opts.gap);
    if (opts.prevent)
      e.preventDefault()
  });
}
