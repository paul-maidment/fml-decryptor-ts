// SPDX-License-Identifier: AGPL-3.0-only
import { ecb } from "@noble/ciphers/aes.js";

/**
 * Encrypt a single 16-byte block with AES-ECB and no padding.
 *
 * Used to derive the per-chunk IV from the key.
 *
 * @param key - 16-byte AES key.
 * @param block - 16-byte plaintext block.
 * @returns The 16-byte ciphertext block.
 */
type AesEcbEncryptBlock = (key: Uint8Array, block: Uint8Array) => Uint8Array;

const aesEcbEncryptBlock: AesEcbEncryptBlock = (key, block) =>
  ecb(key, { disablePadding: true }).encrypt(block);

export default aesEcbEncryptBlock;
