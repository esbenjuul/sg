/**
 * Compile-time type assertions. Zero runtime cost: `assertType` is a no-op.
 *
 *   assertType<Equals<A, B>>();   // fails `deno check` if A and B differ
 */
export type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;

export function assertType<_T extends true>(): void {}
