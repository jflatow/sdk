import { Elem, up } from '../sky.ts';
import { Event, Events, Orb, OrbLike } from '../orb.ts';

export interface PressOpts { gain?: number, every?: number, prevent?: boolean };

export function press(elem: Elem, jack_: OrbLike, opts_: PressOpts) {
  const jack = Orb.from(jack_);
  const opts = up({ gain: 1, every: 33 }, opts_);
  let i: any;
  return elem.on(Events.pointerdown, (e: Event) => {
    jack.grab(e);
    i = setInterval(() => jack.move([opts.gain, e.pressure], e), opts.every);
    if (opts.prevent)
      e.preventDefault();
    elem.doc().once(Events.pointerexit, (e: Event) => {
      jack.free(e);
      clearInterval(i);
      if (opts.prevent)
        e.preventDefault();
    });
  });
}
