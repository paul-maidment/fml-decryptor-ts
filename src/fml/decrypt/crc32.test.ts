// SPDX-License-Identifier: AGPL-3.0-only
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { expect, it } from "vitest";
import computeChunkCrc32 from "./crc32";

const SAMPLE_DIR = fileURLToPath(new URL("../../../SampleFiles/", import.meta.url));

function readSample(name: string): Uint8Array {
  return new Uint8Array(readFileSync(join(SAMPLE_DIR, name)));
}

it("sample-1_decoded.dat computeChunkCrc32 returns-0xF34ACF20", () => {
  expect(computeChunkCrc32(readSample("sample-1_decoded.dat"))).toBe(0xf34acf20);
});

it("sample-2_decoded.dat computeChunkCrc32 returns-0x5443415D", () => {
  expect(computeChunkCrc32(readSample("sample-2_decoded.dat"))).toBe(0x5443415d);
});
