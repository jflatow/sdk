import { Elem, up } from '../sky.ts';
import { Event, Events, Orb, OrbLike } from '../orb.ts';

export type PinchOpts = { prevent?: boolean, stop?: boolean };

// TODO: dual trackpad and multi-touch pinch?
export function pinch(elem: Elem, jack_: OrbLike, opts_: PinchOpts = {}) {
  const jack = Orb.from(jack_);
  const opts = up({ prevent: true }, opts_);
  elem.on(Events.wheel, (e: Event) => {
    if (e.ctrlKey) {
      jack.move([-e.deltaY, -e.deltaY], e); // NB: only get single dimension...
      if (opts.stop)
        e.stopImmediatePropagation();
      if (opts.prevent)
        e.preventDefault();
    }
  });
}
