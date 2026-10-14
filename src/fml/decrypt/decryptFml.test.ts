// SPDX-License-Identifier: AGPL-3.0-only
import { readFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { expect, it } from "vitest";

import aesEcbEncryptBlock from "../ecl/aesEcbEncryptBlock";
import eclEncrypt from "../ecl/eclEncrypt";
import ripemd128 from "../key-derivation/ripemd128";
import { ascii } from "../utils";
import computeChunkCrc32 from "./crc32";
import decryptFml from "./decryptFml";

const SAMPLE_DIR = fileURLToPath(new URL("../../../SampleFiles/", import.meta.url));

function readSample(name: string): Uint8Array {
  return new Uint8Array(readFileSync(join(SAMPLE_DIR, name)));
}

const ALL_FF = new Uint8Array(16).fill(0xff);

const DECODE_SAMPLES = [
  "sample-1",
  "sample-2",
  "sample-3",
  "sample-4",
  "multi_chunk_sample_1",
  "multi_chunk_sample_2",
  "multi_chunk_sample_3",
];

// No vendored sample is Phase 1, so this fixture is built with the ported
// eclEncrypt + the reference file-header constants. It is flagged here
// rather than silently claimed as real-world coverage.
function encodePhase1(plaintext: Uint8Array, password = "b67de657"): Uint8Array {
  const key = ripemd128(ascii(password));
  const iv = aesEcbEncryptBlock(key, ALL_FF);
  const encrypted = eclEncrypt(new Uint8Array(deflateSync(plaintext)), key, iv);
  const crc = computeChunkCrc32(plaintext);

  const prefix = new Uint8Array([
    0x41, 0x41, 0x43, 0x53, 0x00, 0x00, 0x08, 0x00,
    0x3f, 0xf4, 0x41, 0xc1, 0x01, 0x00, 0x00, 0x00,
    0x29, 0x5c, 0x8f, 0x3f, 0x02, 0x00, 0x01, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]);
  const counter = new Uint8Array(100);
  for (let i = 0; i < 100; i++) counter[i] = i;
  const encryptedCounter = eclEncrypt(counter, key, iv);

  const total = 128 + 16 + encrypted.length;
  const out = new Uint8Array(total);
  out.set(prefix, 0);
  out.set(encryptedCounter, 28);
  const view = new DataView(out.buffer);
  view.setUint32(128, encrypted.length, true);
  view.setUint32(132, plaintext.length, true);
  view.setUint32(136, crc, true);
  view.setUint32(140, total, true);
  out.set(encrypted, 144);
  return out;
}

for (const name of DECODE_SAMPLES) {
  it(`${name}.fml decryptFml returns-${name}_decoded.dat-byte-for-byte`, async () => {
    const input = readSample(`${name}.fml`);
    const expected = readSample(`${name}_decoded.dat`);

    const result = await decryptFml(input);

    expect(result.data.length).toBe(expected.length);
    for (let i = 0; i < expected.length; i++) {
      if (result.data[i] !== expected[i]) {
        throw new Error(
          `byte mismatch at offset ${i}: expected 0x${expected[i]!.toString(16)}, ` +
            `got 0x${result.data[i]!.toString(16)}`,
        );
      }
    }
    expect(result.decodedSize).toBe(expected.length);
    expect(result.chunkCount).toBeGreaterThanOrEqual(1);
    expect(result.chunkCrcOk.every(Boolean)).toBe(true);
    expect(result.password).toMatch(/^[0-9a-f]{8}$/);
  });
}

it("multi_chunk_sample_2.fml decryptFml reports-phase-2-2-chunks-and-no-fallback", async () => {
  const result = await decryptFml(readSample("multi_chunk_sample_2.fml"));
  expect(result.phase).toBe(2);
  expect(result.chunkCount).toBe(2);
  expect(result.seed).toBeTypeOf("number");
  expect(result.usedFallback).toBe(false);
});

it("sample-1..4.fml decryptFml returns-the-known-passwords", async () => {
  const expected = ["01279247", "0098ffef", "276c4849", "5ac7da74"];
  for (let i = 0; i < expected.length; i++) {
    const result = await decryptFml(readSample(`sample-${i + 1}.fml`));
    expect(result.password).toBe(expected[i]);
  }
});

it("10-byte-buffer decryptFml throws-FML-data-too-short", async () => {
  await expect(decryptFml(new Uint8Array(10))).rejects.toThrow(/too short/);
});

it("synthetic-phase-1-file decryptFml returns-the-plaintext-and-reports-phase-1", async () => {
  const plaintext = ascii("phase one payload: the quick brown fox 0123456789");
  const result = await decryptFml(encodePhase1(plaintext));

  expect(result.phase).toBe(1);
  expect(result.password).toBe("b67de657");
  expect(result.seed).toBeUndefined();
  expect(result.usedFallback).toBe(false);
  expect(result.chunkCount).toBe(1);
  expect(result.chunkCrcOk).toEqual([true]);
  expect(Array.from(result.data)).toEqual(Array.from(plaintext));
});
