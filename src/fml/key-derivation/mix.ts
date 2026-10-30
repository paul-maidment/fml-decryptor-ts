// SPDX-License-Identifier: AGPL-3.0-only
import { MIX_ADDR } from "../constants";

/**
 * Apply the forward Mixer to a 32-bit value.
 *
 * @param last4 - Seed or trailing 32-bit value.
 * @returns The mixed 32-bit value.
 */
type Mix = (last4: number) => number;

// Forward Mixer direction, ported from the reference FmlDecryptor.Mix.
const mix: Mix = (last4) => {
  let result = last4 >>> 0;
  for (let i = 0; i < 100; i++) {
    const x = (MIX_ADDR ^ result) >>> 0;
    const v4 = ((x >>> 24) | (x << 24) | (x & 0x00ffff00)) >>> 0;
    result = ((v4 << 3) | (v4 >>> 29)) >>> 0;
  }
  return result >>> 0;
};

export default mix;
