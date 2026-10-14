// SPDX-License-Identifier: AGPL-3.0-only
import { expect, it } from "vitest";
import { ascii } from "../utils";
import eclDecrypt from "./eclDecrypt";
import eclEncrypt from "./eclEncrypt";

const ALL_FF = new Uint8Array(16).fill(0xff);
const TEST_KEY = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

it("exact-block-ciphertext eclDecrypt returns-the-plaintext", () => {
  const pt = ascii("Hello World! 123");
  const ct = eclEncrypt(pt, TEST_KEY, ALL_FF);
  expect(Array.from(eclDecrypt(ct, TEST_KEY, ALL_FF))).toEqual(Array.from(pt));
});

it("partial-block-ciphertext eclDecrypt returns-the-plaintext", () => {
  const pt = ascii("Hello World! Hello World! Hello!?");
  const ct = eclEncrypt(pt, TEST_KEY, ALL_FF);
  expect(Array.from(eclDecrypt(ct, TEST_KEY, ALL_FF))).toEqual(Array.from(pt));
});
