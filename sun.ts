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
