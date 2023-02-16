import { Elem, up } from '../sky.ts';
import { Event, Events, Orb, OrbLike } from '../orb.ts';

export type SwipeOpts = { prevent?: boolean, stop?: number };
export type SwipeMsgs = void;

export function swipe(elem: Elem, jack_: OrbLike, opts_: SwipeOpts) {
  const jack = Orb.from(jack_);
  const opts = up({ glob: true }, opts_);
  const doc = elem.doc(), that = opts.glob ? doc : elem;
  let lx: number, ly: number, move: (e: Event) => void;
  elem.on(Events.pointerdown, (e: Event) => {
    let t = e.touches ? e.touches[0] : e;
    jack.grab(e);
    lx = t.pageX;
    ly = t.pageY;
    if (opts.prevent)
      e.preventDefault();

    that.on(Events.pointermove, move = (e: Event) => {
      let t = e.touches ? e.touches[0] : e;
      jack.move([t.pageX - lx, t.pageY - ly, lx, ly], e);
      lx = t.pageX;
      ly = t.pageY;
      if (opts.stop)
        e.stopImmediatePropagation();
      if (opts.prevent)
        e.preventDefault();
    });

    doc.once(Events.pointerexit, (e: Event) => {
      that.off(Events.pointermove, move);
      jack.free(e);
      if (opts.prevent)
        e.preventDefault();
    })
  });
}
