import { Event, up } from '../sky.ts';
import { KeyMap, Transform } from '../orb.ts';
// XXX could be a Component, on an element that self binds keyboard?

export interface KeysOpts { map?: KeyMap };

export class Keys extends Transform<KeysOpts> {
  declare curKeyMap: KeyMap;

  move(deltas: number[], ...rest: any[]) {
    const [dx, dy] = deltas;
    // XXX
    console.log('xxxx move')
    super.move(deltas, ...rest);
  }

  send(k: string, e: Event, ...rest: any[]) {
    console.log('xxxx send', k, e, ...rest, this.curKeyMap)
    Keys.do('captureInput', this, KeyCoder.characterize(e));
    super.send(k, e, ...rest);
  }

  setOpts(opts_: KeysOpts): KeysOpts {
    const opts = super.setOpts(up({ map: {} }, opts_));
    Keys.do('resetKeyMap', this);
    return opts;
  }

  // XXX from Layer
  captureInput(input: Input) {
    if (input.special) {
      const next = this.curKeyMap[input.special] || this.curKeyMap.default;
      if (next instanceof Function) {
        if (input.event && this.curKeyMap[input.special])
          input.event.preventDefault();
        this.resetKeyMap(input); // XXX Keys.do all these?
        return next.call(this, input.chars, input.event);
      } else if (next) {
        this.stepKeyMap(next, input);
      } else {
        console.debug('special input missed key map', input, this);
        this.resetKeyMap(input);
      }
    } else if (input.chars) {
      for (let i = 0; i < input.chars.length; i++) {
        const char = input.chars[i];
        const next = this.curKeyMap[char] || this.curKeyMap.default;
        if (next instanceof Function) {
          if (input.event && this.curKeyMap[char])
            input.event.preventDefault();
          this.resetKeyMap(input);
          return next.call(this, input.chars.slice(i), input.event);
        } else if (next) {
          this.stepKeyMap(next, input);
        } else {
          console.debug('input missed key map', input, this);
          this.resetKeyMap(input);
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
  }

  stepKeyMap(next: KeyMap, input: Input) {
    this.curKeyMap = next;
  }
}

// XXX a transform?
//  well the thing in layers w/ top and cur

// XXX
//  body.on('keydown', this.captureKey.bind(this));
//  body.on('paste', this.capturePaste.bind(this));
// XXX dont want to encroach on layers too much
//  but prob separating out the input handling part
// XXX actually yeah keys should prob be able to capture more than action
//  if 'C-a': Component
//   would be cool to grab it on keydown
//    add normal move pressure?
//     fire when?

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
