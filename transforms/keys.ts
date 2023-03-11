import { Event, up } from '../sky.ts';
import { KeyMap, Orb, Transform } from '../orb.ts';
// XXX could be a Component, on an element that self binds keyboard?
//  new KeyCapture(body, this)

export interface KeysOpts { map?: KeyMap };

export class Keys extends Transform<KeysOpts> {
  declare curKeyMap: KeyMap; // NB: avoid JS re-initializing undefined
  declare selected?: Orb; // XXX selections...

  grab(e: Event, ...rest: any[]) {
    Keys.do('captureInput', this, KeyCoder.characterize(e));
    super.grab(e, ...rest);
  }

  move(deltas: number[], e: Event, ...rest: any[]) {
    this.selected?.move(deltas, e, ...rest);
    super.move(deltas, e, ...rest);
  }

  free(e: Event, ...rest: any[]) {
    this.selected?.free(e, ...rest);
    super.free(e, ...rest);
  }

  setOpts(opts_: KeysOpts): KeysOpts {
    const opts = super.setOpts(up({ map: {} }, opts_));
    Keys.do('resetKeyMap', this);
    return opts;
  }

  captureInput(input: Input) {
    if (input.special) {
      const next = this.curKeyMap[input.special] || this.curKeyMap.default;
      if (next instanceof Function) { // XXX different than Orb.from a fn...
        if (input.event && this.curKeyMap[input.special])
          input.event.preventDefault();
        Keys.do('resetKeyMap', this, input);
        return next.call(this, input.chars, input.event);
      } else if (next instanceof Orb) {
        this.selected = next;
      } else if (next) {
        Keys.do('stepKeyMap', this, next, input);
      } else {
        console.debug('special input missed key map', input, this);
        Keys.do('resetKeyMap', this, input);
      }
    } else if (input.chars) {
      for (let i = 0; i < input.chars.length; i++) {
        const char = input.chars[i];
        const next = this.curKeyMap[char] || this.curKeyMap.default;
        if (next instanceof Function) {
          if (input.event && this.curKeyMap[char])
            input.event.preventDefault();
          Keys.do('resetKeyMap', this, input);
          return next.call(this, input.chars.slice(i), input.event);
        } else if (next instanceof Orb) {
          this.selected = next;
        } else if (next) {
          Keys.do('stepKeyMap', this, next, input);
        } else {
          console.debug('input missed key map', input, this);
          Keys.do('resetKeyMap', this, input);
        }
      }
    } else if (input.chars === '') {
      console.debug('empty input', input, this);
    } else {
      console.warn('unexpected input', input, this);
    }
  }

  resetKeyMap(input: Input = {}) {
    this.curKeyMap = this.opts.map!;
    this.selected = undefined;
  }

  stepKeyMap(next: KeyMap, input: Input) {
    this.curKeyMap = next;
  }
}

export interface Input {
  chars?: string;
  special?: string;
  event?: any;
}

export class KeyCoder {
  static characterize(event: Event): Input {
    const modifiers = this.modifiers(event);
    const key = this.keyChar(event);
    const special = this.specialChar(event);

    if (modifiers && (special || key))
      return { special: modifiers + (special || key), event };
    else if (special)
      return { special, event };
    else
      return { chars: key, event };
  }

  static modifiers(event: Event): string {
    let modifiers = '';
    if (event.metaKey)
      modifiers += '⌘-';
    if (event.ctrlKey)
      modifiers += 'C-';
    if (event.altKey)
      modifiers += 'M-';
    return modifiers;
  }

  static keyChar(event: Event): string {
    if (
      (event.altKey && event.code.startsWith('Alt')) ||
      (event.ctrlKey && event.code.startsWith('Control')) ||
      (event.metaKey && event.code.startsWith('Meta')) ||
      (event.shiftKey && event.code.startsWith('Shift'))
    ) return '';
    return event.key || '';
  }

  static specialChar(event: Event): string | undefined {
    switch (event.code) {
      case 'ArrowLeft': return 'left';
      case 'ArrowUp': return 'up';
      case 'ArrowRight': return 'right';
      case 'ArrowDown': return 'down';

      case 'Backspace': return 'DEL';
      case 'Delete': return 'DEL';
      case 'Enter': return 'RET';
      case 'Escape': return 'ESC';
      case 'Space': return 'SPC';
      case 'Tab': return 'TAB';
    }
  }
}
