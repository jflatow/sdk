import * as Sun from './sun.ts';

import { assert, assertEquals, assertRejects } from 'https://deno.land/std/testing/asserts.ts';

Deno.test('throttle', async () => {
  let x = 3;
  const fun = Sun.throttle((y) => x = y, 100);
  assertEquals(x, 3);
  fun(10);
  assertEquals(x, 3);
  fun(11);
  assertEquals(x, 3);
  fun(12);
  assertEquals(x, 3);
  await Sun.timer(100);
  assertEquals(x, 12);
});

Deno.test('num, min, max', async () => {
  assertEquals(Sun.Num.int('016'), 16);
  assertEquals(Sun.Num.mod(25, 5), 0);
  assertEquals(Sun.Num.mod(-25, 6), 5);
  assertEquals(Sun.min(1, null), null);
  assertEquals(Sun.max(1, null), 1);
  assertEquals(Sun.min(null, 1), null);
  assertEquals(Sun.max(1, null), 1);
  assertEquals(Sun.min(1), undefined);
  assertEquals(Sun.max(1), undefined);
  assertEquals(Sun.min(1, undefined), Sun.max(1, undefined));
  assertEquals(Sun.min(undefined, 1), Sun.max(undefined, 1));
  assertEquals(Sun.min('ab', 'bc'), 'ab');
  assertEquals(Sun.max('ab', 'bc'), 'bc');
});

Deno.test('nil', async () => {
  assertEquals(Sun.nil([1, 2]), []);
  assertEquals(Sun.nil({ a: 1 }), {} as any);
  assertEquals(Sun.nil('ok'), '');
  assertEquals(Sun.nil(1), 0);
  assertEquals(Sun.nil(true), undefined);
});

Deno.test('pad', async () => {
  assertEquals(Sun.pad(5), '05');
  assertEquals(Sun.pad('ok', { width: 12, pad: 'x' }), 'xxxxxxxxxxok');
});

Deno.test('list', async () => {
  const L = Sun.List;
  assertEquals(L.item([1, 2, 3], 2), 3);
  assertEquals(L.append([1, 2], 3), L.prepend([2, 3], 1));
});

Deno.test('time', async () => {
  const L = Sun.List;
  const T = Sun.Time;
  const t = new Date(2023, 0, 7, 23, 27, 19);
  const u = new Date(2023, 0, 14, 23, 27, 19);
  assertEquals(T.stamp(t), '2023-01-07 23:27:19');
  assertEquals(T.pass({ w: 1 }, t), u);
  assertEquals(T.fold(L.append, [] as Date[], { start: t, stop: u }), [
    t,
    new Date(2023, 0, 8, 23, 27, 19),
    new Date(2023, 0, 9, 23, 27, 19),
    new Date(2023, 0, 10, 23, 27, 19),
    new Date(2023, 0, 11, 23, 27, 19),
    new Date(2023, 0, 12, 23, 27, 19),
    new Date(2023, 0, 13, 23, 27, 19),
  ]);
});