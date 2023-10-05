// Copyright 2013-present Jared Flatow
// SPDX-License-Identifier: AGPL-3.0-only

import { Elem, abs, pow } from '../sky.ts';
import { Transform } from '../orb.ts';

export type AmpOpts = { ax?: number, ay?: number, kx?: number, ky?: number };
export type AmpIn = { delta: [dx: number, dy: number] };
export type AmpOut = { delta: [dx: number, dy: number] };
export type AmpMsgs = void;

export class Amp extends Transform<AmpOpts> {
  move(deltas: number[], ...rest: any[]) {
    const [dx, dy] = deltas;
    const opts = this.opts;
    const ax = opts.ax ?? 1, ay = opts.ay ?? 1;
    const kx = opts.kx ?? 1, ky = opts.ky ?? 1;
    super.move([kx * pow(dx, ax), ky * pow(dy, ay)], ...rest)
  }
}
