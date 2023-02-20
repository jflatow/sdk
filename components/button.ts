import { Text } from './text.ts';
import { Component, Event } from '../orb.ts';
import { press } from '../gestures.ts';

export interface ButtonOpts { app?: any, act?: string, hold?: number };

export class Button extends Component<ButtonOpts> {
  level?: number; // XXX on button or press?
  // XXX nice that these are mutable here
  //  also seems maybe more extensible

  init() {
    press(this.elem, this); // XXX still think press not tap?
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
    super.render();
  }

  move(deltas: number[], e: Event, ...rest: any[]) {
    const [dp] = deltas, threshold = 25; // XXX on button or press?
    this.level = (this.level || 0) + dp;
    if (this.level > threshold) {
      Button.prototype.press.call(this, e); // XXX
      this.level = 0;
    }
    this.elem.style({ opacity: 1 - this.level / threshold });
    // XXX in regard to combos, kinda not nice we can't rely on instance methods or properties
    //  like if we wanted to wrap this.level / threshold, how would even expose
    //   in a way thats meant to be mixed in?
    // XXX was not calling super yet and guess would be cool if we didn't have to
    super.move(deltas, e, ...rest);
  }

  send(msg: any) { // XXX rest? would be cool if not necessary
    if (msg.fire)
      Button.prototype.press.call(this, msg.fire); // XXX sorry subclasses?
    super.send(msg);
  }

  free(...rest: any[]) {
    this.level = 0;
    this.elem.style({ opacity: null });
    // XXX super...
    super.free(...rest);
  }

  // XXX now reconsider how this whole thing works re: press vs tap, pressure, etc
  async press(e: Event) {
    // XXX def fix this and hook up to press? eh press dont help
    const app = this.opts.app ?? {}, hold = this.opts.hold ?? 300;
    const act = this.opts.act ?? this.constructor.name;
    const k = `do_${act}`;
    const f = app[k];
    this.elem.addClass('pressed'); // XXX not just if app? somewhere else?
    if (f instanceof Function) {
      try {
        // XXX replace with press trigger? throttle? lpf
        await new Promise(ok => setTimeout(ok, hold));
        await f(undefined, e); // XXX should we pass anything? actions take chars and event?
      } catch (err) {
        console.error(err);
      }
    }
    this.elem.removeClass('pressed');
  }
}

export class TextButton extends Component.combo(Text, Button) {}
