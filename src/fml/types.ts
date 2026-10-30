// SPDX-License-Identifier: AGPL-3.0-only
// Shared types for the FML decryptor. Each is named after the function it serves.

/**
 * Result of {@link decryptFml}.
 */
export interface DecryptFmlResult {
  /** Decoded payload bytes. */
  data: Uint8Array;
  /** Detected file generation: `1` for legacy, `2` for the current format. */
  phase: 1 | 2;
  /** Password used for decryption: the derived password, or the fallback. */
  password: string;
  /** `true` when the derived password failed and the static fallback was used. */
  usedFallback: boolean;
  /** Phase 2 seed, when the container carries one. */
  seed?: number;
  /** Number of chunks decoded. */
  chunkCount: number;
  /** Per-chunk CRC32 status; mismatches are reported but never fatal. */
  chunkCrcOk: boolean[];
  /** Total decoded byte length across all chunks. */
  decodedSize: number;
}

/**
 * Result of {@link derivePassword}.
 */
export interface DerivePasswordResult {
  /** 8-character hex password, or the static Phase 1 password. */
  password: string;
  /** Detected file generation: `1` for legacy, `2` for the current format. */
  phase: 1 | 2;
  /** Phase 2 seed, when the container carries one. */
  seed?: number;
}

/**
 * Result of {@link decryptAllChunks}.
 */
export interface DecryptAllChunksResult {
  /** Concatenated decoded payload of every chunk. */
  data: Uint8Array;
  /** Number of chunks decoded. */
  chunkCount: number;
  /** Per-chunk CRC32 status; mismatches are reported but never fatal. */
  chunkCrcOk: boolean[];
  /** Total decoded byte length across all chunks. */
  decodedSize: number;
}
