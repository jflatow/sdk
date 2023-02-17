export function assert(val, msg) {
  if (!val)
    throw new Error(`Assertion failed (${val}): ${msg}`);
}