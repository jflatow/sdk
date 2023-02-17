import { Elem, up } from '../sky.ts';
import { Event, Events, Orb, OrbLike } from '../orb.ts';
import { swipe } from './swipe.ts';

export interface ScrollOpts { prevent?: boolean, stop?: boolean };

export function scroll(elem: Elem, jack_: OrbLike, opts_: ScrollOpts) {
  const jack = Orb.from(jack_);
  const opts = up({ prevent: true }, opts_);
  let lx: number, ly: number;
  elem.on(Events.scrollwheel, (e: Event) => {
    jack.move([e.wheelDeltaX, e.wheelDeltaY, lx, ly], e);
    lx = e.pageX;
    ly = e.pageY;
    if (opts.stop)
      e.stopImmediatePropagation();
    if (opts.prevent)
      e.preventDefault();
  });
}
