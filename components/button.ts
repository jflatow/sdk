import { Text } from './text.ts';
import { Component, Event } from '../orb.ts';
import { press } from '../gestures.ts';

export interface ButtonOpts {
  app?: any,
  act?: string,
  hold?: number,
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
      this.elem.style({ display: does ? null : 'none' }); // XXX keep? opt?
    }
    super.render();
  }

  move(deltas: number[], e: Event, ...rest: any[]) {
    const [dp] = deltas, threshold = this.opts.threshold ?? 18;
    this.level = (this.level || 0) + dp;
    if (this.level >= threshold) {
      if (this.level == threshold)
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
    const app = this.opts.app ?? {}, hold = this.opts.hold ?? 300;
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
}

export class TextButton extends Component.combo(Text, Button) {}
