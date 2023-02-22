import { Box, Elem, abs, up } from './sky.ts';

export type Event = any;
export type Func = (...args: any[]) => any;

export type GrabFn = (...args: any[]) => void;
export type MoveFn = (delta: number[], ...args: any[]) => void;
export type SendFn = (...args: any[]) => void;
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
  grip: number = 0;
  halt: boolean = false;
  jack?: Orb;

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

  static do<R>(method: string, instance: any, ...args: any[]): R {
    return (instance[method] ?? (this.prototype as any)[method])?.call(instance, ...args);
  }

  constructor(impl: IOrb = {}) {
    up(this, impl);
  }

  grab(...args: any[]) {
    if (!this.halt) {
      this.grip++;
      this.jack?.grab(...args);
    }
  }

  move(deltas: number[], ...args: any[]) {
    if (!this.halt) {
      this.jack?.move(deltas, ...args);
    }
  }

  send(...args: any[]) {
    if (!this.halt) {
      this.jack?.send(...args);
    }
  }

  free(...args: any[]) {
    if (!this.halt) {
      this.grip--;
      this.jack?.free(...args);
    }
  }
}

export class Transform<Opts> extends Orb {
  opts: Opts;

  constructor(jack: OrbLike = {}, opts: Opts = {} as Opts, impl = {}) {
    super(impl);
    this.jack = Orb.from(jack);
    this.opts = this.setOpts(opts);
  }

  setOpts(opts: Opts): Opts {
    // transition this.opts -> opts
    //  returns whatever we *actually* set
    // subtypes can simply chain the new opts they handle
    //  and return super.setOpts(chain(opts)) or chain(super.setOpts(opts))
    if (!this.halt) {
      this.opts = opts;
    }
    return this.opts;
  }
}

// XXX styles? default init? added to what?
//  I think cool to just compose default style 'sheet'
export class Component<Opts> extends Transform<Opts> {
  elem: Elem;
  subs?: Component<any>[];

  constructor(elem: Elem, jack?: Orb, opts?: Opts, impl = { elem }) {
    super(jack, opts, impl);
    this.elem = elem;
    this.subs = [];
    this.init();
  }

  static combo(a: any, b: any): any {
    return combo(a, b);
  }

  static quick<Opts>(elem: Elem, opts?: Opts) {
    return new this(elem, undefined, opts);
  }

  init() {
    // override to add implicit gestures, etc. on construction
  }

  render() {
    // override to propagate external state changes (to elem)
    //  remember to call super
    if (!this.halt) {
      this.subs?.forEach(c => c.render());
    }
  }
}

export function combo<A, B>(a: typeof Component<A>, b: typeof Component<B>): typeof Component<A & B> {
  // components should generally be independent of each other to be combined
  //  this version generalizes naturally to list, but binary is nice inline
  class c extends Component<A & B> {
    callAll<R>(method: string, ...args: any[]): R {
      const _ = (b.prototype as any)[method]?.call(up(this, { halt: true }), ...args);
      const r = (a.prototype as any)[method]?.call(up(this, { halt: false }), ...args);
      return r as R;
    }

    init() {
      return this.callAll('init');
    }

    render() {
      return this.callAll('render');
    }

    setOpts(opts: A & B): A & B {
      return this.callAll('setOpts', opts);
    }

    grab(...args: any[]) { this.callAll('grab', ...args) }
    move(...args: any[]) { this.callAll('move', ...args) }
    send(...args: any[]) { this.callAll('send', ...args) }
    free(...args: any[]) { this.callAll('free', ...args) }
  }
  return c;
}

export class Events {
  static readonly pointerup = 'pointerup';
  static readonly pointerdown = 'pointerdown';
  static readonly pointermove = 'pointermove';
  static readonly pointerexit = [this.pointerup, 'pointercancel'].join(' ')

  static readonly scrollwheel = 'mousewheel';
}
