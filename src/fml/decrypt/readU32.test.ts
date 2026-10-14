// SPDX-License-Identifier: AGPL-3.0-only
import { expect, it } from "vitest";
import readU32 from "./readU32";

it("78563412-little-endian-bytes readU32 returns-0x12345678", () => {
  expect(readU32(new Uint8Array([0x78, 0x56, 0x34, 0x12]), 0)).toBe(0x12345678);
});

it("4-byte-buffer-offset-0 readU32 succeeds-at-the-exact-boundary", () => {
  expect(readU32(new Uint8Array([0xff, 0xff, 0xff, 0xff]), 0)).toBe(0xffffffff);
});

it("4-byte-buffer-offset-1 readU32 throws-out-of-bounds", () => {
  expect(() => readU32(new Uint8Array([0x12, 0x34, 0x56, 0x78]), 1)).toThrow(/out-of-bounds/);
});

it("8-byte-buffer-offset-5 readU32 throws-out-of-bounds", () => {
  expect(() => readU32(new Uint8Array(8), 5)).toThrow(/out-of-bounds/);
});

it("4-byte-buffer-offset-4 readU32 throws-out-of-bounds", () => {
  expect(() => readU32(new Uint8Array(4), 4)).toThrow(/out-of-bounds/);
});

it("4-byte-buffer-offset--1 readU32 throws-out-of-bounds", () => {
  expect(() => readU32(new Uint8Array(4), -1)).toThrow(/out-of-bounds/);
});
