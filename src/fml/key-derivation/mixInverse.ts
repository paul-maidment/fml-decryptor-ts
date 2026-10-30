// SPDX-License-Identifier: AGPL-3.0-only
import { MIX_ADDR } from "../constants";

/**
 * Apply the inverse Mixer, recovering the value passed to {@link mix}.
 *
 * @param password - Mixed 32-bit value.
 * @returns The original 32-bit value.
 */
type MixInverse = (password: number) => number;

// Exact inverse of the Mixer, ported from the reference FmlDecryptor.MixInverse.
const mixInverse: MixInverse = (password) => {
  let result = password >>> 0;
  for (let i = 0; i < 100; i++) {
    const v4 = ((result >>> 3) | (result << 29)) >>> 0;
    const v = ((v4 >>> 24) | (v4 << 24) | (v4 & 0x00ffff00)) >>> 0;
    result = (MIX_ADDR ^ v) >>> 0;
  }
  return result >>> 0;
};

export default mixInverse;
