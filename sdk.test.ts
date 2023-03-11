import { Sky, Orb, Gestures, Components, Transforms } from './sdk.ts';

const { keypress, press, scroll, swipe, tap } = Gestures;
const { Amp, Keys, Loop } = Transforms;
const { Button, Text, TextButton, Wagon } = Components;

import { assert, assertEquals, assertRejects } from 'https://deno.land/std/testing/asserts.ts';

Deno.test('sub component', async () => {
  class MyButtonT extends TextButton { defaultOpts = () => ({ text: '⮑' }) }
  assertEquals(!!MyButtonT.quick, true);
});
