// SPDX-License-Identifier: AGPL-3.0-only
// Read a little-endian uint32: bytes + offset in, number out.
type ReadU32 = (bytes: Uint8Array, offset: number) => number;

// The file format stores every header field as a little-endian uint32.
const readU32: ReadU32 = (bytes, offset) => {
  if (offset < 0 || offset + 4 > bytes.length) {
    throw new RangeError(`readU32: out-of-bounds read at offset ${offset} (length ${bytes.length})`);
  }

  return (
    bytes[offset]! |
    (bytes[offset + 1]! << 8) |
    (bytes[offset + 2]! << 16) |
    (bytes[offset + 3]! << 24)
  ) >>> 0;
};

export default readU32;
