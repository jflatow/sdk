import { Text, TextOpts } from './text.ts';
import { Event } from '../orb.ts';
import { tap } from '../gestures.ts'; // XXX switch to press

export interface ButtonOpts extends TextOpts { app?: any, act?: string, hold?: number };

export class Button extends Text<ButtonOpts> {
  init() {
    tap(this.elem, ({ fire: e }) => this.press(e))
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

  async press(e: Event) {
    // XXX def fix this and hook up to press
    const app = this.opts.app ?? {}, hold = this.opts.hold ?? 300;
    const act = this.opts.act ?? this.constructor.name;
    const k = `do_${act}`;
    const f = app[k];
    if (f instanceof Function) {
      this.elem.addClass('pressed');
      try {
        // XXX replace with press trigger? throttle? lpf
        await new Promise(ok => setTimeout(ok, hold));
        await f(); // XXX should we pass anything? actions take chars and event?
      } catch (err) {
        console.error(err);
      }
      this.elem.removeClass('pressed');
    } else {
      console.debug('stray pressed component', this);
    }
  }
}
