import { Box } from '../sky.ts';
import { Component } from '../orb.ts';

export interface TextOpts { text?: string };

export class Text extends Component<TextOpts> {
  setOpts(opts: TextOpts): TextOpts {
    this.elem.txt(opts.text ?? this.constructor.name);
    return super.setOpts(opts);
  }
}
