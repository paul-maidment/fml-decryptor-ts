// SPDX-License-Identifier: AGPL-3.0-only
import newEcb from "./newEcb";

// AES-ECB encrypt a single 16-byte block. Used to derive the IV.
type AesEcbEncryptBlock = (key: Uint8Array, block: Uint8Array) => Uint8Array;

const aesEcbEncryptBlock: AesEcbEncryptBlock = (key, block) => {
  const ecb = newEcb(key);
  return Uint8Array.from(ecb.encrypt(Array.from(block)));
};

export default aesEcbEncryptBlock;
