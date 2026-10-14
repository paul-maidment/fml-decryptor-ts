// SPDX-License-Identifier: AGPL-3.0-only
import { expect, it } from "vitest";
import { ascii, toHex } from "../utils";
import ripemd128 from "./ripemd128";

it("empty-input ripemd128 returns-cdf26213a150dc3ecb610f18f6b38b46", () => {
  expect(toHex(ripemd128(ascii("")))).toBe("cdf26213a150dc3ecb610f18f6b38b46");
});

it("input-a ripemd128 returns-86be7afa339d0fc7cfc785e72f578d33", () => {
  expect(toHex(ripemd128(ascii("a")))).toBe("86be7afa339d0fc7cfc785e72f578d33");
});

it("input-abc ripemd128 returns-c14a12199c66e4ba84636b0f69144c77", () => {
  expect(toHex(ripemd128(ascii("abc")))).toBe("c14a12199c66e4ba84636b0f69144c77");
});

it("input-01279247 ripemd128 returns-0e751ef3533305c26ac67b1a39204ac8", () => {
  expect(toHex(ripemd128(ascii("01279247")))).toBe("0e751ef3533305c26ac67b1a39204ac8");
});

it("input-0098ffef ripemd128 returns-d1f6109144b92b6ec44e8c4829e5ea9e", () => {
  expect(toHex(ripemd128(ascii("0098ffef")))).toBe("d1f6109144b92b6ec44e8c4829e5ea9e");
});

it("input-276c4849 ripemd128 returns-00fa20bde36860aa74c63dbc2bdd0b78", () => {
  expect(toHex(ripemd128(ascii("276c4849")))).toBe("00fa20bde36860aa74c63dbc2bdd0b78");
});

it("input-5ac7da74 ripemd128 returns-1b248a40f86bdc69effbe9bc5865fe96", () => {
  expect(toHex(ripemd128(ascii("5ac7da74")))).toBe("1b248a40f86bdc69effbe9bc5865fe96");
});
