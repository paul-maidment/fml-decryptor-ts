// SPDX-License-Identifier: AGPL-3.0-only
import { DECRYPT_ALL_CHUNKS_IV_BLOCK } from "../../constants";
import type { DecryptAllChunksResult } from "../../types";
import computeChunkCrc32 from "./crc32";
import { aesEcbEncryptBlock, eclDecrypt } from "../ecl";
import { ripemd128 } from "../key-derivation";
import { zlibDecompress } from "../compression";
import { ascii } from "../utils";
import readU32 from "./readU32";

// Decode every chunk: bytes + password in, concatenated output out.
type DecryptAllChunks = (bytes: Uint8Array, password: string) => Promise<DecryptAllChunksResult>;

// Each chunk is ECL-decrypted, zlib-decompressed, trimmed to dsize and
// concatenated; its CRC32 is checked (non-fatal) against the header.
const decryptAllChunks: DecryptAllChunks = async (bytes, password) => {
  if (bytes.length < 148) {
    throw new Error("FML data too short");
  }

  const key = ripemd128(ascii(password));
  const iv = aesEcbEncryptBlock(key, DECRYPT_ALL_CHUNKS_IV_BLOCK);

  const parts: Uint8Array[] = [];
  const chunkCrcOk: boolean[] = [];
  let decodedSize = 0;

  let csize = readU32(bytes, 128);
  let dsize = readU32(bytes, 132);
  let expectedCrc32 = readU32(bytes, 136);
  let position = 144;

  while (position < bytes.length - 4) {
    const ctLen = Math.min(csize, bytes.length - position);
    const ct = bytes.subarray(position, position + ctLen);

    const compressed = eclDecrypt(ct, key, iv);
    const decompressed = await zlibDecompress(compressed);

    const writeLen = decompressed.length > dsize ? dsize : decompressed.length;
    const chunkOutput = decompressed.slice(0, writeLen);

    parts.push(chunkOutput);
    decodedSize += writeLen;

    const actualCrc32 = computeChunkCrc32(chunkOutput);
    chunkCrcOk.push(actualCrc32 === expectedCrc32);

    position += csize;

    if (position + 16 > bytes.length - 4) break;

    csize = readU32(bytes, position);
    dsize = readU32(bytes, position + 4);
    expectedCrc32 = readU32(bytes, position + 8);
    position += 16;
  }

  const data = new Uint8Array(decodedSize);
  let offset = 0;
  for (const part of parts) {
    data.set(part, offset);
    offset += part.length;
  }

  return { data, chunkCount: parts.length, chunkCrcOk, decodedSize };
};

export default decryptAllChunks;
