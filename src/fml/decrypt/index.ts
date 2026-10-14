// SPDX-License-Identifier: AGPL-3.0-only
// Decode path for MFME .fml containers, ported from the reference
// FmlDecryptor.cs (DerivePassword, FindLastNextHeaderOffset, DecryptAllChunks).
export { default as decryptFml } from "./decryptFml";
export { default as decryptAllChunks } from "./decryptAllChunks";
export { default as derivePassword } from "./derivePassword";
export { default as findLastNextHeaderOffset } from "./findLastNextHeaderOffset";
export { default as computeChunkCrc32 } from "./crc32";
export type { DecryptFmlResult } from "../types";
