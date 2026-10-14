// SPDX-License-Identifier: AGPL-3.0-only
import { expect, it } from "vitest";
import mix from "./mix";
import mixInverse from "./mixInverse";

it("mixed-value mixInverse returns-the-original", () => {
  for (const v of [0x01279247, 0x0098ffef, 0x276c4849, 0x5ac7da74, 0x00000000, 0xffffffff]) {
    expect(mixInverse(mix(v))).toBe(v >>> 0);
    expect(mix(mixInverse(v))).toBe(v >>> 0);
  }
});
