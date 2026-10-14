// SPDX-License-Identifier: AGPL-3.0-only
import { ecb } from "@noble/ciphers/aes.js";

// AES-ECB encrypt a single 16-byte block, with no PKCS#7 padding. Used to derive the IV.
type AesEcbEncryptBlock = (key: Uint8Array, block: Uint8Array) => Uint8Array;

const aesEcbEncryptBlock: AesEcbEncryptBlock = (key, block) =>
  ecb(key, { disablePadding: true }).encrypt(block);

export default aesEcbEncryptBlock;
