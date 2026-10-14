// SPDX-License-Identifier: AGPL-3.0-only
import { expect, it } from "vitest";
import mix from "./mix";

it("input-0x84EE4F7C mix returns-0x01279247", () => {
  expect(mix(0x84ee4f7c)).toBe(0x01279247);
});

it("input-0x7EACD4E8 mix returns-0x0098FFEF", () => {
  expect(mix(0x7eacd4e8)).toBe(0x0098ffef);
});

it("input-0x25CEAB82 mix returns-0x276C4849", () => {
  expect(mix(0x25ceab82)).toBe(0x276c4849);
});

it("input-0x847971D9 mix returns-0x5AC7DA74", () => {
  expect(mix(0x847971d9)).toBe(0x5ac7da74);
});
