import { Box, Elem, Event, abs, up } from './sky.ts';

export type { Event };
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

  static sink<Opts>(opts?: Opts) {
    return new this(undefined, opts);
  }

  defaultOpts(): Opts {
    // for convenience, can always override setOpts for performance
    return {} as Opts;
  }

  setOpts(opts: Opts): Opts {
    // transition this.opts -> opts
    //  returns whatever we *actually* set
    // subtypes can simply chain the new opts they handle
    //  and return super.setOpts(chain(opts)) or chain(super.setOpts(opts))
    if (!this.halt) {
      this.opts = up(this.defaultOpts() as object, opts);
    }
    return this.opts;
  }
}

// XXX styles? default init? added to what?
//  I think cool to just compose default style 'sheet'
//   bc where would you add it? to parent? new style sheet?
//    then its like for every instance
//  but begs the question, how to collect and when/where to add?
//   imagine should be part of sdk but some sort of frame/layer above
export class Component<Opts> extends Transform<Opts> {
  elem: Elem;
  subs: Component<any>[];

  constructor(elem: Elem, jack?: Orb, opts?: Opts, impl = { elem }) {
    super(jack, opts, impl);
    this.elem = elem;
    this.subs = [];
    this.init();
  }

  static combo<A, B>(a: typeof Component<A>, b: typeof Component<B>): typeof Component<A & B> {
    return combo(a, b);
  }

  static quick<Opts>(root: Elem, opts?: Opts) {
    return new this(root.div(), undefined, opts);
  }

  static styles() {
    return {}; // XXX hm make sense? where called?
  }

  init() {
    // override to add implicit gestures, etc. on construction
    //  remember to call super, typically
    this.elem.addClass(['component', this.constructor.name]); // XXX
  }

  render(): Elem {
    // override to propagate external state changes (to elem)
    //  remember to call super
    if (!this.halt) {
      this.subs.forEach(c => c.render());
    }
    return this.elem;
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
      return this.callAll('render') as Elem;
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
  static readonly keydown = 'keydown';
  static readonly keyup = 'keyup';

  static readonly pointerup = 'pointerup';
  static readonly pointerdown = 'pointerdown';
  static readonly pointermove = 'pointermove';
  static readonly pointerexit = [this.pointerup, 'pointercancel'].join(' ')

  static readonly scrollwheel = 'mousewheel';
}

export type Action<T = string> = (payload?: T, event?: Event) => Promise<any>;

export interface KeyMap {
  [ key: string ]: KeyMap | Action;
}
