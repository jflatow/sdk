import { Sky, Orb, Gestures, Components, Transforms } from './sdk.ts';

const { keypress, press, scroll, swipe, tap } = Gestures;
const { Amp, Keys, Loop } = Transforms;
const { Button, Text, TextButton, Wagon } = Components;

import { assert, assertEquals, assertRejects } from 'https://deno.land/std/testing/asserts.ts';

Deno.test('sub component', async () => {
  // note that defaultOpts must be on the prototype, not just instances
  class MyButtonT extends TextButton { defaultOpts() { return ({ text: '⮑' }) } }
  const elem = {
    div: () => elem,
    txt: () => null,
    on: () => null,
    addClass: () => null,
  } as unknown as Sky.Elem;
  const btn = MyButtonT.quick(elem);
  assertEquals(!!MyButtonT.quick, true);
  assertEquals(btn instanceof MyButtonT, true);
  assertEquals(btn.defaultOpts(), { text: '⮑' });
  assertEquals(btn.opts, { text: '⮑' });
});
