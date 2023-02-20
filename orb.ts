import { Box, Elem, abs, up } from './sky.ts';

export type Event = any;
export type Func = (...args: any[]) => any;

export type GrabFn = (...args: any[]) => void;
export type MoveFn = (delta: number[], ...args: any[]) => void;
export type SendFn = (...msgs: any[]) => void;
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
  send(...msgs: any[]) {}
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

  send(...msgs: any[]) {
    this.jack.send(...msgs);
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
    this.subs?.forEach(c => c.render());
  }
}

export function combo<A, B>(a: typeof Component<A>, b: typeof Component<B>): typeof Component<A & B> {
  class c extends Component<A & B> {
    init() {
      a.prototype.init.call(this);
      b.prototype.init.call(this);
    }

    render() {
      a.prototype.render.call(this);
      b.prototype.render.call(this);
    }

    setOpts(opts: A & B): A & B {
      // opts may get set multiple times
      //  however opts should generally be independent to be combined
      //   otherwise the order and impls of setOpts will matter
      a.prototype.setOpts.call(this, opts);
      b.prototype.setOpts.call(this, opts);
      return super.setOpts(opts);
    }

    // XXX ok this works too but what if they both define?
    //  ok yes it well-defined goes to first but
    //  unless I want to make it where you can't *not* call jack?
    //  so back to do(method: keyof IOrb, ...args: any[])
    //   calls Orb dfn if it exists, continues on jack?
    //   then we can do callAll
    //  why is it same or diff for setOpts w/ super?
    callFirst(method: keyof IOrb, ...args: any[]): any {
      if (a.prototype.hasOwnProperty(method))
        return a.prototype[method].call(this, ...args);
      else if (b.prototype.hasOwnProperty(method))
        return b.prototype[method].call(this, ...args);
      else
        return (super[method] as any)(...args);
    }

    grab(...args: any[]) { this.callFirst('grab', ...args) }
    move(...args: any[]) { this.callFirst('move', ...args) }
    send(...args: any[]) { this.callFirst('send', ...args) }
    free(...args: any[]) { this.callFirst('free', ...args) }
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
