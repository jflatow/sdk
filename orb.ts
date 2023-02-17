import { Box, Elem, abs, up } from './sky.ts';

export type Event = any;
export type Func = (...args: any[]) => any;

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

export type OrbLike = IOrb | SendFn | OrbLike[];
export type Gesture = (elem: Elem, jack: OrbLike, opts: any) => void;

export function broadcast(desc: { [k: string]: any[] }): { [k: string]: Func } {
  const cast = {} as { [k: string]: Func };
  for (const [k, os] of Object.entries(desc))
    cast[k] = (...args: any[]) => os.forEach((o, i) => o[k]?.(...args, i));
  return cast;
}

export class Orb implements IOrb {
  static from(jack: OrbLike): Orb {
    if (jack instanceof Orb)
      return jack;
    else if (typeof(jack) === 'function')
      return new this({ send: jack });
    else if (Array.isArray(jack))
      return new this(broadcast({ grab: jack, move: jack, send: jack, free: jack }));
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
    // subtypes can simply chain the new opts they handle
    //  and return super.setOpts(chain(opts)) or chain(super.setOpts(opts))
    return this.opts = opts;
  }
}

export class Component<Opts> extends Transform<Opts> {
  elem: Elem;
  subs?: Component<any>[];

  constructor(elem: Elem, jack?: Orb, opts?: Opts) {
    super(jack, opts, { elem });
    this.elem = elem;
    this.subs = [];
  }

  static quick<Opts>(elem: Elem, opts?: Opts) {
    return new this(elem, undefined, opts);
  }

  // XXX how to start building out browser tests?
    //  tests given component classes, will leverage from progs?
    //  compose sequences of actions/messages
}

export class Events {
  static readonly pointerup = 'pointerup';
  static readonly pointerdown = 'pointerdown';
  static readonly pointermove = 'pointermove';
  static readonly pointerexit = [this.pointerup, 'pointercancel'].join(' ')

  static readonly scrollwheel = 'mousewheel';
}
