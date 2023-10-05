// Copyright 2013-present Jared Flatow
// SPDX-License-Identifier: AGPL-3.0-only

import { Orb } from './orb.ts';

import { assert, assertEquals, assertRejects } from 'https://deno.land/std/testing/asserts.ts';

Deno.test('orb', async () => {
  const send = () => {};
  const orb = Orb.from({ send });
  assertEquals(orb.send, send);
});
