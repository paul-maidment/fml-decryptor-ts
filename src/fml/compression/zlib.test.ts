// SPDX-License-Identifier: AGPL-3.0-only
import { deflateSync } from "node:zlib";
import { expect, it } from "vitest";
import zlibDecompress from "./zlib";
import { DecompressError } from "../compression";
import { ascii } from "../utils";

it("valid-deflate-data zlibDecompress returns-the-original-bytes", async () => {
  const original = ascii("the quick brown fox jumps over 0123456789");
  const result = await zlibDecompress(new Uint8Array(deflateSync(original)));
  expect(Array.from(result)).toEqual(Array.from(original));
});

it("invalid-deflate-data zlibDecompress throws-DecompressError", async () => {
  await expect(zlibDecompress(new Uint8Array([1, 2, 3, 4]))).rejects.toBeInstanceOf(DecompressError);
});
