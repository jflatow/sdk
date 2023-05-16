import { Event, up } from '../sky.ts';
import { KeyMap, Orb, Transform } from '../orb.ts';

export interface KeysOpts { map?: KeyMap };

// XXX re-think selected here? possibly (just) rename?
//  also relates to both opt and state question
export class Keys extends Transform<KeysOpts> {
  declare curKeyMap: KeyMap; // NB: avoid JS re-initializing undefined
  declare selected?: Orb; // XXX selections general interface... prob just this

  grab(e: Event, ...rest: any[]): boolean {
    super.grab(e, ...rest);
    const input = KeyCoder.characterize(e);
    const reset = !this.selected && Keys.do('captureInput', this, input);
    if (this.selected?.grab(e, ...rest) as any)
      return Keys.do('resetKeyMap', this, input), true;
    return reset as boolean;
  }

  move(deltas: number[], e: Event, ...rest: any[]) {
    super.move(deltas, e, ...rest);
    this.selected?.move(deltas, e, ...rest);
  }

  send(e: Event, ...rest: any[]) {
    super.move(e, ...rest);
    this.selected?.send(e, ...rest);
  }

  free(e: Event, ...rest: any[]) {
    super.free(e, ...rest);
    this.selected?.free(e, ...rest);
  }

  setOpts(opts_: KeysOpts): KeysOpts {
    const opts = super.setOpts(up({ map: {} }, opts_));
    Keys.do('resetKeyMap', this);
    return opts;
  }

  captureInput(input: Input): boolean {
    if (input.special) {
      const next = this.curKeyMap[input.special] || this.curKeyMap.default;
      if (next instanceof Function) { // note: different than Orb.from a fn...
        if (input.event && this.curKeyMap[input.special])
          input.event.preventDefault?.();
        Keys.do('resetKeyMap', this, input);
        next.call(this, input.chars, input.event);
        return true;
      } else if (next instanceof Orb) {
        this.selected = next;
      } else if (next) {
        Keys.do('stepKeyMap', this, next, input);
      } else {
        console.debug('special input missed key map', input, this);
        Keys.do('resetKeyMap', this, input);
        return true;
      }
    } else if (input.chars) {
      for (let i = 0; i < input.chars.length; i++) {
        const char = input.chars[i];
        const next = this.curKeyMap[char] || this.curKeyMap.default;
        if (next instanceof Function) {
          if (input.event && this.curKeyMap[char])
            input.event.preventDefault?.();
          Keys.do('resetKeyMap', this, input);
          next.call(this, input.chars.slice(i), input.event);
          return true;
        } else if (next instanceof Orb) {
          this.selected = next;
        } else if (next) {
          Keys.do('stepKeyMap', this, next, input);
        } else {
          console.debug('input missed key map', input, this);
          Keys.do('resetKeyMap', this, input);
          return true;
        }
      }
    } else if (input.chars === '') {
      console.debug('empty input', input, this);
    } else {
      console.warn('unexpected input', input, this);
    }
    return false;
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
    if (event.altKey)
      return '';
    if (
      (event.ctrlKey && event.code?.startsWith('Control')) ||
      (event.metaKey && event.code?.startsWith('Meta')) ||
      (event.shiftKey && event.code?.startsWith('Shift'))
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

    if (event.key == 'Unidentified' || event.key == 'Dead') {
      // depends on keyboard but...
      const shift = event.shiftKey;
      switch (event.code) {
        case 'Minus': return shift ? '_' : '-';
        case 'Equal': return shift ? '+' : '=';
        case 'Semicolon': return shift ? ':' : ';';
        case 'Quote': return shift ? '"' : "'";
        case 'Backquote': return shift ? '~' : '`';
        case 'Comma': return shift ? '<' : ',';
        case 'Period': return shift ? '>' : '.';
        case 'Slash': return shift ? '?' : '/';
        case 'Backslash': return shift ? '|' : '\\';
        case 'BracketLeft': return shift ? '{' : '[';
        case 'BracketRight': return shift ? '}' : ']';
      }

      if (event.code.startsWith('Digit')) {
        const code = event.code.replace(/^Digit/, '');
        return shift ? ')!@#$%^&*('[code] : code;
      }

      if (event.code.startsWith('Key')) {
        const code = event.code.replace(/^Key/, '');
        return shift ? code.toUpperCase() : code.toLowerCase();
      }
    }
  }
}
