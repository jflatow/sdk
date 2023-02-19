import { Text, TextOpts } from './text.ts';
import { Event } from '../orb.ts';
import { tap } from '../gestures.ts'; // XXX switch to press

// export interface ButtonOpts extends TextOpts { app?: any, act?: string, hold?: number };
export interface ButtonOpts { app?: any, act?: string, hold?: number };

export type TextButtonOpts = TextOpts & ButtonOpts;

// XXX theres also Reflect.construct if want to avoid extends for traits?
//  weird though
// XXX so can't have anything but text? no good I think
//  need another way to compose w text
export class Button extends Text<TextButtonOpts> { // XXX TextButton
  init() {
    tap(this.elem, this);
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

  // XXX or just let app extend Button
  //  but problem is it means recreating inheritance chain off button?
  send(msg: any) {
    if (msg.fire)
      this.press(msg.fire);
    super.send(msg);
  }

  async press(e: Event) {
    // XXX def fix this and hook up to press? eh press dont help
    const app = this.opts.app ?? {}, hold = this.opts.hold ?? 300;
    const act = this.opts.act ?? this.constructor.name;
    const k = `do_${act}`;
    const f = app[k];
    if (f instanceof Function) {
      this.elem.addClass('pressed'); // XXX not just if app? somewhere else?
      try {
        // XXX replace with press trigger? throttle? lpf
        await new Promise(ok => setTimeout(ok, hold));
        await f(undefined, e); // XXX should we pass anything? actions take chars and event?
      } catch (err) {
        console.error(err);
      }
      this.elem.removeClass('pressed');
    } else {
      console.debug('stray pressed component', this);
    }
  }
}
