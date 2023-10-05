// Copyright 2013-present Jared Flatow
// SPDX-License-Identifier: AGPL-3.0-only

export type Fn = (...args: any[]) => void;
export type Fun = (...args: any[]) => any;
export type Timeout = number;

export function throttle(fun: Fun, every: number, T?: Timeout): Fn {
  return (...args: any[]) => {
    clearTimeout(T);
    T = setTimeout(() => fun(...args), every);
  }
}

export async function timer<V>(ms: number, val?: V): Promise<V | undefined> {
  return new Promise((okay) => setTimeout(() => okay(val), ms));
}

export type Num = bigint | number;

export class Uni {
  static int(x: string): number {
    return parseInt(x, 10);
  }

  static mod<T extends Num>(x: T, y: T): T {
    const r = x % y;
    return r < 0 ? (r as any + y as any) : r;
  }

  static max<T>(x?: T, y?: T): T | undefined {
    return x! > y! ? x : y;
  }

  static min<T>(x?: T, y?: T): T | undefined {
    return x! < y! ? x : y;
  }

  static nil<T>(x?: T): T | undefined {
    if (x instanceof Array)
      return [] as T;
    if (x instanceof Object)
      return {} as T;
    if (typeof(x) == 'string')
      return '' as T;
    if (typeof(x) == 'number')
      return 0 as T;
  }
}

export interface PadSpec {
  pad?: string;
  width?: number;
};

export function pad(s: any, opt?: PadSpec): string {
  return s.toString().padStart(opt?.width ?? 2, opt?.pad ?? '0');
}

export class List<X> extends Array<X> {
  constructor(x: X[] | X) {
    x instanceof Array ? super(...x) : super(x);
  }

  static item<I>(list?: I[], i = 0): I | undefined {
    return list && list[i < 0 ? list.length + i : i];
  }

  static append<I>(list: I[], item: I): I[] {
    return list.push(item), list;
  }

  static prepend<I>(list: I[], item: I): I[] {
    return list.unshift(item), list;
  }
}

export const Sec = 1000, Min = 60 * Sec, Hour = 60 * Min, Day = 24 * Hour, Week = 7 * Day;
export const DoW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export const MoY = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;

export type DoW = typeof DoW[number];
export type MoY = typeof MoY[number];

export type Year = number;
export type Month = number;
export type Day = number;
export type Week = number;
export type Hour = number;
export type Minute = number;
export type Second = number;
export type Millisecond = number;

export interface TimeSpec {
  y?: Year;
  m?: Month;
  d?: Day;
  h?: Hour;
  mi?: Minute;
  s?: Second;
  ms?: Millisecond;
}

export interface TimeDeltaSpec extends TimeSpec {
  w?: Week;
}

export interface TimeFoldOpt {
  start?: Date;
  stop?: Date;
  step?: TimeDeltaSpec;
}

export interface TimeFormatOpt {
  sep?: string;
  dsep?: string;
  tsep?: string;
  utc?: boolean;
}

export class Time extends Date {
  constructor(set: TimeSpec, rel?: Date | number) {
    const r = rel ? new Date(rel) : new Date;
    super(
      set?.y  ?? r.getFullYear(),
      set?.m  ?? r.getMonth(),
      set?.d  ?? r.getDate(),
      set?.h  ?? r.getHours(),
      set?.mi ?? r.getMinutes(),
      set?.s  ?? r.getSeconds(),
      set?.ms ?? r.getMilliseconds()
    );
  }

  static get(k: keyof TimeSpec, rel?: Date | number): number {
    const r = rel ? new Date(rel) : new Date;
    switch (k) {
      case 'y':  return r.getFullYear()
      case 'm':  return r.getMonth()
      case 'd':  return r.getDate()
      case 'h':  return r.getHours()
      case 'mi': return r.getMinutes()
      case 's':  return r.getSeconds()
      case 'ms': return r.getMilliseconds()
    }
  }

  static pass(dif: TimeDeltaSpec, rel?: Date | number): Date {
    const r = rel ? new Date(rel) : new Date;
    for (const k in dif)
      switch (k) {
        case 'y':      r.setFullYear(r.getFullYear() + dif[k]!);     break;
        case 'm':         r.setMonth(r.getMonth() + dif[k]!);        break;
        case 'w':          r.setDate(r.getDate() + dif[k]! * 7);     break;
        case 'd':          r.setDate(r.getDate() + dif[k]!);         break;
        case 'h':         r.setHours(r.getHours() + dif[k]!);        break;
        case 'mi':      r.setMinutes(r.getMinutes() + dif[k]!);      break;
        case 's':       r.setSeconds(r.getSeconds() + dif[k]!);      break;
        case 'ms': r.setMilliseconds(r.getMilliseconds() + dif[k]!); break;
      }
    return r;
  }

  static fold<A>(fun: (a: A, t: Date) => A, acc: A, opt?: TimeFoldOpt): A {
    let t = opt?.start ?? new Date;
    const stop = opt?.stop, step = opt?.step ?? { d: 1 };
    const fwd = Time.pass(step, t) >= t, jump = {};
    for (let i = 1, s = t; !stop || (fwd ? (t < stop) : (t > stop)); i++) {
      acc = fun(acc, t);
      for (const k in step)
        (jump as any)[k] = (step as any)[k] * i;
      t = Time.pass(jump, s);
    }
    return acc;
  }

  static read(stamp: string, opt?: TimeFormatOpt): Date {
    const sep = opt?.sep ?? 'T', dsep = opt?.dsep ?? '-', tsep = opt?.tsep ?? ':';
    const utc = opt?.utc || stamp[stamp.length - 1] == 'Z';
    const dtp = stamp.split(sep);
    const datep = dtp[0] ? dtp[0].split(dsep).map(Uni.int) : [0, 0, 0];
    const timep = dtp[1] ? dtp[1].substring(0, 8).split(':').map(Uni.int) : [0, 0, 0];
    if (utc)
      return new Date(Date.UTC(datep[0], datep[1] - 1, datep[2], timep[0], timep[1], timep[2]));
    return new Date(datep[0], datep[1] - 1, datep[2], timep[0], timep[1], timep[2]);
  }

  static datestamp(t: Date, opt?: TimeFormatOpt): string {
    const datep = opt?.utc ?
      [t.getUTCFullYear(), pad(t.getUTCMonth() + 1), pad(t.getUTCDate())] :
      [t.getFullYear(), pad(t.getMonth() + 1), pad(t.getDate())];
    return datep.join(opt?.dsep ?? '-');
  }

  static timestamp(t: Date, opt?: TimeFormatOpt): string {
    const timep = opt?.utc ?
      [pad(t.getUTCHours()), pad(t.getUTCMinutes()), pad(t.getUTCSeconds())] :
      [pad(t.getHours()), pad(t.getMinutes()), pad(t.getSeconds())];
    return timep.join(opt?.tsep ?? ':') + (opt?.utc ? 'Z' : '');
  }

  static stamp(t: Date, opt?: TimeFormatOpt): string {
    return Time.datestamp(t, opt) + (opt?.sep ?? 'T') + Time.timestamp(t, opt);
  }

  static fromGregorian(s: Second): Date {
    return new Date((s - 62167219200) * 1000);
  }

  static toGregorian(t: Date): Second {
    return ~~(t as any / 1000) + 62167219200;
  }

  static daysInMonth(y: Year, m: Month): number {
    return 32 - new Date(y, m, 32).getDate();
  }

  static isLeapYear(y: Year): boolean {
    return !(y % 4) && ((y % 100) != 0 || !(y % 400));
  }

  static weekday(t: Date): DoW {
    return DoW[t.getDay()];
  }

  static month(t: Date): MoY {
    return MoY[t.getMonth()];
  }
}
