// SPDX-License-Identifier: AGPL-3.0-only
// Shared types for the FML decryptor. Each is named after the function it serves.

// Serves decryptFml.
export interface DecryptFmlResult {
  data: Uint8Array;
  phase: 1 | 2;
  password: string;
  usedFallback: boolean;
  seed?: number;
  chunkCount: number;
  chunkCrcOk: boolean[];
  decodedSize: number;
}

// Serves derivePassword.
export interface DerivePasswordResult {
  password: string;
  phase: 1 | 2;
  seed?: number;
}

// Serves decryptAllChunks.
export interface DecryptAllChunksResult {
  data: Uint8Array;
  chunkCount: number;
  chunkCrcOk: boolean[];
  decodedSize: number;
}
