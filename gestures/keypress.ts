// Copyright 2013-present Jared Flatow
// SPDX-License-Identifier: AGPL-3.0-only

import { Elem, up } from '../sky.ts';
import { Event, Events, Orb, OrbLike } from '../orb.ts';

export interface KeypressOpts { gain?: number, prevent?: boolean };

export function keypress(elem: Elem, jack_: OrbLike, opts_: KeypressOpts = {}) {
  const jack = Orb.from(jack_);
  const opts = up({ gain: 5 }, opts_);
  return elem.on(Events.keydown, (e: Event) => {
    if (!e.repeat)
      jack.grab(e);
    else
      jack.move([opts.gain, e.location], e);
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
