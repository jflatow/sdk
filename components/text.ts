import { Component } from '../orb.ts';

export interface TextOpts { text?: string };

export class Text<T extends TextOpts = TextOpts> extends Component<T> {
  setOpts(opts: T): T {
    this.elem.txt(opts.text ?? this.constructor.name);
    return super.setOpts(opts);
  }
}
