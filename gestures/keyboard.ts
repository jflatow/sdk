import { Elem, up } from '../sky.ts';
import { Event, Events, Orb, OrbLike } from '../orb.ts';

export interface KeyboardOpts { prevent?: boolean };

export function keyboard(elem: Elem, jack_: OrbLike, opts_: KeyboardOpts = {}) {
  const jack = Orb.from(jack_);
  const opts = up({}, opts_);
  return elem.on(Events.keydown, (e: Event) => {
    // XXX actually like keypress could be cool (maybe even rename)
    //  do gain/every -> move on repeat, w options
    //   so press and hold acts like mouse press
    if (!e.repeat)
      jack.grab(e);
    jack.send(e.key, e);
    if (opts.prevent)
      e.preventDefault();
    if (!e.repeat)
      elem.once(Events.keyup, (e: Event) => {
        jack.free(e);
        if (opts.prevent)
          e.preventDefault();
      });
  });
}
