// SPDX-License-Identifier: AGPL-3.0-only
// Shared constants for the FML cipher. Each is named after the function it serves.

// Serves mix / mixInverse.
export const MIX_ADDR = 0x00c59a00;

// Serves decryptAllChunks — the AES-ECB input used to derive the per-chunk IV.
export const DECRYPT_ALL_CHUNKS_IV_BLOCK = new Uint8Array(16).fill(0xff);

// Serves derivePassword (Phase 1) and decryptFml (fallback).
export const DECRYPT_FML_ALT_PASSWORD = "b67de657";
