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
  mode?: unknown;

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

  static middle(orb: Orb, before?: Func, after?: Func): Orb {
    return new class Middle extends Orb {
      grab(...args: any[]) { before?.(); orb.grab(...args); after?.() }
      move(...args: any[]) { before?.(); orb.move(...args as [number[], ...any[]]); after?.() }
      send(...args: any[]) { before?.(); orb.send(...args); after?.() }
      free(...args: any[]) { before?.(); orb.free(...args); after?.() }
    }
  }

  static proxy(fn: () => Orb | null): Orb {
    return new class Proxy extends Orb {
      grab(...args: any[]) { fn()?.grab(...args) }
      move(...args: any[]) { fn()?.move(...args as [number[], ...any[]]) }
      send(...args: any[]) { fn()?.send(...args) }
      free(...args: any[]) { fn()?.free(...args) }
    }
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

  withMode(mode: unknown) {
    // intentionally does not revert
    return Orb.middle(this, () => this.mode = mode);
  }
}

export class Transform<Opts> extends Orb {
  opts: Opts;

  constructor(jack: OrbLike = {}, opts: Opts = {} as Opts, impl = {}) {
    super(impl);
    this.jack = Orb.from(jack);
    this.opts = this.setOpts(opts);
  }

  static sink<Opts>(opts?: Opts): any {
    return new this(undefined, opts);
  }

  defaultOpts(opts: Opts): Opts {
    // for convenience, can always override setOpts for performance
    return {} as Opts;
  }

  setOpts(opts: Opts): Opts {
    // transition this.opts -> opts
    //  returns whatever we *actually* set
    // subtypes can simply chain the new opts they handle
    //  and return super.setOpts(chain(opts)) or chain(super.setOpts(opts))
    if (!this.halt) {
      this.opts = up(this.opts ?? this.defaultOpts(opts) as object, opts);
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

  constructor(elem: Elem, jack?: OrbLike, opts?: Opts, impl = { elem }) {
    super(jack, opts, impl);
    this.elem = elem;
    this.subs = [];
    this.init();
  }

  static combo<A, B>(a: typeof Component<A>, b: typeof Component<B>): typeof Component {
    return combo(a, b) as typeof Component; // tsc can't quite handle A & B
  }

  static quick<Opts, T extends typeof Component<any>>(this: T, root: Elem, opts?: Opts): InstanceType<T> {
    return new this(this.sprout(root, opts), undefined, opts) as InstanceType<T>;
  }

  static sprout<Opts>(root: Elem, _opts?: Opts): Elem {
    return root.div();
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

  destroy() {
    // override to add additional standard cleanup
    this.elem.remove();
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

    callFold<R>(method: string, p: any = {}, fun: (p?: any, x?: any) => any = up): R {
      const q = fun(p, (b.prototype as any)[method]?.call(up(this, { halt: true })));
      const r = fun(q, (a.prototype as any)[method]?.call(up(this, { halt: false })));
      return r as R;
    }

    init() {
      return this.callAll('init');
    }

    render() {
      return this.callAll('render') as Elem;
    }

    defaultOpts(opts: A & B): A & B {
      return this.callFold('defaultOpts', opts);
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

  static readonly wheel = 'wheel';
}

export type Action<T = string> = (payload?: T, event?: Event) => any;
export type Actuator = Action | Orb;

export interface KeyMap {
  [ key: string ]: KeyMap | Action;
}

export interface Representable {
  elem: Elem;
}
