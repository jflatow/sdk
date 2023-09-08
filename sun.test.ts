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
