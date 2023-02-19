import { Text } from './text.ts';
import { Component, Event } from '../orb.ts';
import { tap } from '../gestures.ts'; // XXX switch to press

export interface ButtonOpts { app?: any, act?: string, hold?: number };

export class Button extends Component<ButtonOpts> {
  init() {
    tap(this.elem, this); // XXX stilll try for press I think
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

  // setOpts() {
  //   // XXX
  //   this.jack = send... ?
  // }

  send(msg: any) {
    if (msg.fire)
      Button.prototype.press.call(this, msg.fire); // XXX sorry subclasses?
    super.send(msg);
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
