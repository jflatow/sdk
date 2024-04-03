export function assert(val, msg) {
  if (!val)
    throw new Error(`Assertion failed (${val}): ${msg}`);
}

export function assertEquals(val, to, msg) {
  const a = JSON.stringify(val), b = JSON.stringify(to);
  if (a != b)
    throw new Error(`Assertion failed (${a} != ${b}): ${msg}`);
}
