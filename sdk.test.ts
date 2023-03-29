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

Deno.test('keys', async () => {
  let aPressed = 0, bPressed = 0, cPressed = 0;

  const map1 = {
    'C-x': () => aPressed++,
    'C-p': {
      c: () => cPressed++,
    },
    z: {
      n: () => false,
    }
  };
  const keys1 = Keys.sink({ map: map1 });

  keys1.grab({ ctrlKey: true, key: 'x' });
  keys1.grab({ ctrlKey: true, key: 'y' });
  assertEquals(aPressed, 1);
  assertEquals(bPressed, 0);
  assertEquals(cPressed, 0);

  keys1.opts.map['C-y'] = () => bPressed++;
  keys1.grab({ ctrlKey: true, key: 'y' });
  assertEquals(bPressed, 1);
  assertEquals(cPressed, 0);

  const map2 = {
    z: keys1
  };
  const keys2 = Keys.sink({ map: map2 });

  keys2.grab({ key: 'z' });
  keys2.grab({ ctrlKey: true, key: 'y' });
  assertEquals(aPressed, 1);
  assertEquals(bPressed, 2);
  assertEquals(cPressed, 0);

  keys2.grab({ key: 'q' });
  keys2.grab({ ctrlKey: true, key: 'y' });
  assertEquals(aPressed, 1);
  assertEquals(bPressed, 2);
  assertEquals(cPressed, 0);

  keys2.grab({ key: 'z' });
  keys2.grab({ ctrlKey: true, key: 'x' });
  assertEquals(aPressed, 2);
  assertEquals(bPressed, 2);
  assertEquals(cPressed, 0);

  keys2.grab({ key: 'z' });
  keys2.grab({ ctrlKey: true, key: 'p' });
  keys2.grab({ key: 'c' });
  keys2.grab({ key: 'c' });
  assertEquals(aPressed, 2);
  assertEquals(bPressed, 2);
  assertEquals(cPressed, 1);
});
