// SPDX-License-Identifier: AGPL-3.0-only
import { expect, it } from "vitest";
import { ascii, toHex } from "../utils";
import eclEncrypt from "./eclEncrypt";

const ALL_FF = new Uint8Array(16).fill(0xff);
const TEST_KEY = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

// Expected ciphertexts produced by the reference FmlDecryptor.EclEncrypt.
it("exact-block-plaintext eclEncrypt returns-b8de777da3128176a3af1e244680e4f8", () => {
  const pt = ascii("Hello World! 123");
  expect(toHex(eclEncrypt(pt, TEST_KEY, ALL_FF))).toBe("b8de777da3128176a3af1e244680e4f8");
});

it("partial-block-plaintext eclEncrypt returns-25cd7e066c0dceb853ea89fc64ca5dd5ae1a1d4c3765fc7d0bd7df8dc2469104cc", () => {
  const pt = ascii("Hello World! Hello World! Hello!?");
  expect(toHex(eclEncrypt(pt, TEST_KEY, ALL_FF))).toBe(
    "25cd7e066c0dceb853ea89fc64ca5dd5ae1a1d4c3765fc7d0bd7df8dc2469104cc",
  );
});
