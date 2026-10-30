// SPDX-License-Identifier: AGPL-3.0-only
import { DecompressionError } from "../errors";

/**
 * Decompress zlib (RFC 1950) data using the native `DecompressionStream`.
 *
 * @param data - Compressed bytes.
 * @returns The decompressed bytes.
 * @throws {@link DecompressionError} When the stream cannot be decompressed.
 */
type ZlibDecompress = (data: Uint8Array) => Promise<Uint8Array>;

// Uses the native DecompressionStream ("deflate" == zlib / RFC 1950), which
// makes the decrypt path asynchronous.
const zlibDecompress: ZlibDecompress = async (data) => {
  const stream = new DecompressionStream("deflate");
  const writer = stream.writable.getWriter();
  // Errors surface via the reader below; drain the writer side too so a failed
  // decompression doesn't raise an unhandled rejection.
  void writer.write(data as Uint8Array<ArrayBuffer>).catch(() => undefined);
  void writer.close().catch(() => undefined);

  const reader = stream.readable.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        total += value.length;
      }
    }
  } catch (err) {
    throw new DecompressionError("zlib decompression failed", { cause: err });
  }

  const output = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
};

export default zlibDecompress;
