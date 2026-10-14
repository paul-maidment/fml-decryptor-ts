// SPDX-License-Identifier: AGPL-3.0-only
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { expect, it } from "vitest";
import decryptAllChunks from "./decryptAllChunks";

const SAMPLE_DIR = fileURLToPath(new URL("../../../SampleFiles/", import.meta.url));

function readSample(name: string): Uint8Array {
  return new Uint8Array(readFileSync(join(SAMPLE_DIR, name)));
}

function expectBytesEqual(actual: Uint8Array, expected: Uint8Array): void {
  expect(actual.length).toBe(expected.length);
  for (let i = 0; i < expected.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error(
        `byte mismatch at offset ${i}: expected 0x${expected[i]!.toString(16)}, got 0x${actual[i]!.toString(16)}`,
      );
    }
  }
}

it("sample-1.fml-with-password-01279247 decryptAllChunks returns-the-decoded-file-in-one-chunk", async () => {
  const result = await decryptAllChunks(readSample("sample-1.fml"), "01279247");
  expectBytesEqual(result.data, readSample("sample-1_decoded.dat"));
  expect(result.chunkCount).toBe(1);
  expect(result.chunkCrcOk).toEqual([true]);
  expect(result.decodedSize).toBe(9407);
});

it("multi_chunk_sample_2.fml-with-password-5e10a4d3 decryptAllChunks returns-the-decoded-file-in-two-chunks", async () => {
  const result = await decryptAllChunks(readSample("multi_chunk_sample_2.fml"), "5e10a4d3");
  expectBytesEqual(result.data, readSample("multi_chunk_sample_2_decoded.dat"));
  expect(result.chunkCount).toBe(2);
  expect(result.chunkCrcOk).toEqual([true, true]);
  expect(result.decodedSize).toBe(721799);
});

it("sample-2.fml-with-wrong-password decryptAllChunks throws", async () => {
  await expect(decryptAllChunks(readSample("sample-2.fml"), "00000000")).rejects.toThrow();
});

it("100-byte-buffer decryptAllChunks throws-FML-data-too-short", async () => {
  await expect(decryptAllChunks(new Uint8Array(100), "01279247")).rejects.toThrow(/too short/);
});
