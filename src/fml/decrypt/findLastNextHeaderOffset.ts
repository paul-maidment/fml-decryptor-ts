// SPDX-License-Identifier: AGPL-3.0-only
import readU32 from "./readU32";

// Walk the chunk chain: bytes in, the final next_header_offset out.
type FindLastNextHeaderOffset = (bytes: Uint8Array) => number;

const MAX_CHUNKS = 10000;

// Walk the chunk header chain from offset 128 following each chunk's
// next_header_offset field; returns the final chunk's next_header_offset.
const findLastNextHeaderOffset: FindLastNextHeaderOffset = (bytes) => {
  let pos = 128;
  let lastNextOff = 0;
  let maxChunks = MAX_CHUNKS;

  while (pos + 16 <= bytes.length && maxChunks-- > 0) {
    const nextOff = readU32(bytes, pos + 12);
    lastNextOff = nextOff;

    if (nextOff >= bytes.length || nextOff <= pos) break;
    if (nextOff + 16 > bytes.length) break;

    pos = nextOff;
  }

  return lastNextOff;
};

export default findLastNextHeaderOffset;
