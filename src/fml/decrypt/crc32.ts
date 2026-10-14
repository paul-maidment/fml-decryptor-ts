// SPDX-License-Identifier: AGPL-3.0-only
// CRC32 of a decompressed chunk: bytes in, 32-bit checksum out.
type ComputeChunkCrc32 = (data: Uint8Array) => number;

// Non-standard CRC32: init 0, no final XOR, polynomial 0xEDB88320.
// Ported from the reference FmlDecryptor.ComputeChunkCrc32.
const computeChunkCrc32: ComputeChunkCrc32 = (data) => {
  let crc = 0 >>> 0;
  for (let i = 0; i < data.length; i++) {
    crc = (crc ^ data[i]!) >>> 0;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) !== 0 ? ((crc >>> 1) ^ 0xedb88320) >>> 0 : (crc >>> 1) >>> 0;
    }
  }
  return crc >>> 0;
};

export default computeChunkCrc32;
