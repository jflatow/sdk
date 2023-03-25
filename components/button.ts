import { Text, TextOpts } from './text.ts';
import { Component, Event } from '../orb.ts';
import { press } from '../gestures.ts';

export interface ButtonOpts {
  app?: any,
  act?: string,
  repeat?: boolean,
  threshold?: number,
};

export class Button extends Component<ButtonOpts> {
  level?: number;

  init() {
    press(this.elem, this);
  }

  render() {
    const app = this.opts.app ?? {};
    const act = this.opts.act ?? this.constructor.name;
    const k = `does_${act}`;
    const f = app[k];
    if (f instanceof Function) {
      const does = f();
      this.elem.style({ display: does ? null : 'none' });
    }
    return super.render();
  }

  move(deltas: number[], e: Event, ...rest: any[]) {
    const [dp] = deltas, threshold = this.opts.threshold ?? 18;
    const last = this.level || 0;
    this.level = last + dp;
    if (this.level >= threshold) {
      if (last < threshold)
        this.send({ fire: e });
      if (this.opts.repeat)
        this.level = 0;
    }
    Button.do('style', this, this.level / threshold);
    super.move(deltas, e, ...rest);
  }

  send(msg: any, ...rest: any[]) {
    if (msg.fire)
      Button.do('press', this, msg.fire);
    super.send(msg, ...rest);
  }

  free(...rest: any[]) {
    Button.do('style', this, this.level = undefined);
    super.free(...rest);
  }

  style(spectrum?: number) {
    if (spectrum === undefined) {
      this.elem.style({ opacity: null });
    } else {
      this.elem.style({ opacity: 1 - spectrum });
    }
  }

  async press(e: Event) {
    const app = this.opts.app ?? {};
    const act = this.opts.act ?? this.constructor.name;
    const k = `do_${act}`;
    const f = app[k];
    this.elem.addClass('pressed');
    if (f instanceof Function) {
      try {
        await f(undefined, e);
      } catch (err) {
        console.error(err);
      }
    }
    this.elem.removeClass('pressed');
  }

  static bypass(btn: Component<any>) {
    return (_: any, e: Event) => Button.do('press', btn, e);
  }
}

export interface TextButtonOpts extends TextOpts, ButtonOpts {}

export class TextButton<Opts extends TextButtonOpts = TextButtonOpts> extends Component.combo(Text, Button)<Opts> {}
