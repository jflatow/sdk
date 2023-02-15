import { Box, Elem, abs, clip, up } from './sky.ts';

export type Event = any;

export type GrabFn = (...args: any[]) => void;
export type MoveFn = (delta: number[], ...args: any[]) => void;
export type SendFn = (...messages: any[]) => void;
export type FreeFn = (...args: any[]) => void;

export interface IOrb {
  grab?: GrabFn;
  move?: MoveFn;
  send?: SendFn;
  free?: FreeFn;
}

export type OrbLike = IOrb | SendFn;

export class Orb implements IOrb {
  static from(jack: OrbLike): Orb {
    if (jack instanceof Orb)
      return jack;
    else if (typeof(jack) === 'function')
      return new this({ send: jack });
    else
      return new this(jack);
  }

  constructor(impl: IOrb = {}) {
    up(this, impl);
  }

  grab(...args: any[]) {}
  move(delta: number[], ...args: any[]) {}
  send(...messages: any[]) {}
  free(...args: any[]) {}
}

export class Transform<Opts> extends Orb {
  jack: Orb;
  opts: Opts;

  constructor(jack: OrbLike = {}, opts: Opts = {} as Opts, impl = {}) {
    super(impl);
    this.jack = Orb.from(jack);
    this.opts = this.setOpts(opts);
  }

  grab(...args: any[]) {
    this.jack.grab(...args);
  }

  move(delta: number[], ...args: any[]) {
    this.jack.move(delta, ...args);
  }

  send(...messages: any[]) {
    this.jack.send(...messages);
  }

  free(...args: any[]) {
    this.jack.free(...args)
  }

  setOpts(opts: Opts): Opts {
    // transition this.opts -> opts
    //  returns whatever we *actually* set
    return this.opts = opts;
  }
}

export class Component<Opts> extends Transform<Opts> {
  elem: Elem;

  constructor(elem: Elem, jack?: Orb, opts?: Opts) {
    super(jack, opts);
    this.elem = elem;
  }
}

export type TapOpts = { gap?: number, mx?: number, my?: number, stop?: number };
export type TapMsgs = { fire: any };

export type SwipeOpts = { prevent?: boolean, stop?: number };
export type SwipeMsgs = void;

export class Gestures {
  static readonly pointerup = 'pointerup';
  static readonly pointerdown = 'pointerdown';
  static readonly pointermove = 'pointermove';
  static readonly pointerexit = [this.pointerup, 'pointercancel'].join(' ')

  static tap(elem: Elem, jack: OrbLike, opts_: TapOpts) {
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
    return this.swipe(elem, new TapTransform(jack, opts), { stop: opts.stop });
  }

  static swipe(elem: Elem, jack_: OrbLike, opts_: SwipeOpts) {
    const jack = Orb.from(jack_);
    const opts = up({ glob: true }, opts_);
    const doc = elem.doc(), that = opts.glob ? doc : elem;
    let lx: number, ly: number, move: (e: Event) => void;
    elem.on(Gestures.pointerdown, (e: Event) => {
      let t = e.touches ? e.touches[0] : e;
      jack.grab(e);
      lx = t.pageX;
      ly = t.pageY;
      if (opts.prevent)
        e.preventDefault();

      that.on(Gestures.pointermove, move = (e: Event) => {
        let t = e.touches ? e.touches[0] : e;
        jack.move([t.pageX - lx, t.pageY - ly, lx, ly], e);
        lx = t.pageX;
        ly = t.pageY;
        if (opts.stop)
          e.stopImmediatePropagation();
        if (opts.prevent)
          e.preventDefault();
      })

      doc.once(Gestures.pointerexit, (e: Event) => {
        that.off(Gestures.pointermove, move);
        jack.free(e);
        if (opts.prevent)
          e.preventDefault();
      })
    })
    return this;
  }
}

// XXX orb/{components,transforms}.ts ?
export type WagonOpts = { bbox: any };
export type WagonIn = { delta: [dx: number, dy: number] };
export type WagonOut = { delta: [dx: number, dy: number], args: [cur: any] };
export type WagonMsgs = void;

export class Wagon extends Component<WagonOpts> {
  move(delta: number[], ...rest: any) {
    const [dx, dy] = delta;
    const cur = this.elem.transformation();
    const off = cur.translate = cur.translate || [0, 0];
    const bbox = new Box(this.opts.bbox || {}, true);
    if (bbox.width)
      cur.translate[0] = clip(off[0] + dx, bbox.left, bbox.right)
    if (bbox.height)
      cur.translate[1] = clip(off[1] + dy, bbox.top, bbox.bottom)
    this.elem.transform(cur);
    super.move(delta, cur, ...rest);
  }
}
