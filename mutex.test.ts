// Copyright 2013-present Jared Flatow
// SPDX-License-Identifier: AGPL-3.0-only

import { Activatable, Selectable, Stack, Selection } from './mutex.ts';

import { assert, assertEquals, assertRejects } from 'https://deno.land/std/testing/asserts.ts';

class Layer implements Activatable {
  async activate() {}
  async deactivate() {}
}

class Widget implements Selectable {
  select() {}
  deselect() {}
}

Deno.test('stack', async () => {
  const layer = new Layer;
  const stack = new Stack;
  await stack.addMember(layer);
  assertEquals(stack.members, [layer]);
  assertEquals(stack.active, layer);
  await stack.removeMember(layer);
  assertEquals(stack.members, []);
  assertEquals(stack.active, undefined);
});

Deno.test('selection', async () => {
  const widget = new Widget;
  const selection = new Selection;
  selection.select(widget);
  assertEquals(selection.selected, [widget]);
  selection.addSelected(widget);
  assertEquals(selection.selected, [widget]);
  selection.select(widget, widget);
  assertEquals(selection.selected, [widget]);
  selection.removeSelected(widget);
  assertEquals(selection.selected, []);
});