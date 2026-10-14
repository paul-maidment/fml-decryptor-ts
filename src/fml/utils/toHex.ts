// SPDX-License-Identifier: AGPL-3.0-only
// Format bytes as lowercase hex: bytes in, hex string out.
type ToHex = (bytes: Uint8Array) => string;

// Each byte as two hex digits, concatenated.
const toHex: ToHex = (bytes) => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export default toHex;
