import * as Sky from './sky.ts';

import { assert, assertEquals, assertRejects } from 'https://deno.land/std/testing/asserts.ts';

Deno.test('add', async () => {
  assertEquals(Sky.add(1, undefined), undefined);
  assertEquals(Sky.add(1, Infinity), Infinity);
  assertEquals(Sky.add(1, 2), 3);
});

Deno.test('box points empty', async () => {
  const box = Sky.box(0, 0);
  assertEquals(box.midX, 0);
  assertEquals(box.midY, 0);
  assertEquals(box.right, 0);
  assertEquals(box.bottom, 0);
});

Deno.test('box points', async () => {
  const box = Sky.box(1, 1, 100, 20);
  assertEquals(box, new Sky.Box({ x: 1, y: 1, w: 100, h: 20 }));
  assertEquals(box.width, 100);
  assertEquals(box.height, 20);
  assertEquals(box.left, 1);
  assertEquals(box.top, 1);
  assertEquals(box.midX, 51);
  assertEquals(box.midY, 11);
  assertEquals(box.right, 101);
  assertEquals(box.bottom, 21);
});
