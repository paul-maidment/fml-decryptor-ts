// SPDX-License-Identifier: AGPL-3.0-only
import { beforeEach, expect, it, vi } from "vitest";

const { decodeMock } = vi.hoisted(() => ({ decodeMock: vi.fn() }));
vi.mock("./decryptAllChunks", () => ({ default: decodeMock }));

import decryptFml from "./decryptFml";
import { DecompressError } from "../compression";

beforeEach(() => {
  decodeMock.mockReset();
});

it("range-error-from-decode decryptFml rethrows-and-does-not-fall-back", async () => {
  decodeMock.mockImplementation(async () => {
    throw new RangeError("boom");
  });

  await expect(decryptFml(new Uint8Array(200))).rejects.toThrow(/boom/);
  expect(decodeMock).toHaveBeenCalledTimes(1);
});

it("decompress-error-from-decode decryptFml falls-back-to-alt-password", async () => {
  decodeMock
    .mockRejectedValueOnce(new DecompressError("bad"))
    .mockResolvedValueOnce({ data: new Uint8Array(0), chunkCount: 0, chunkCrcOk: [], decodedSize: 0 });

  const result = await decryptFml(new Uint8Array(200));

  expect(result.usedFallback).toBe(true);
  expect(decodeMock).toHaveBeenCalledTimes(2);
  expect(decodeMock.mock.calls[1]![1]!).toBe("b67de657");
});

it("decompress-error-from-decode decryptFml reports-phase-1-and-no-seed", async () => {
  decodeMock
    .mockRejectedValueOnce(new DecompressError("bad"))
    .mockResolvedValueOnce({ data: new Uint8Array(0), chunkCount: 0, chunkCrcOk: [], decodedSize: 0 });

  const result = await decryptFml(new Uint8Array(200));

  expect(result.phase).toBe(1);
  expect(result.seed).toBeUndefined();
});
