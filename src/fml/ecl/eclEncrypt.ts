// SPDX-License-Identifier: AGPL-3.0-only
import { ecb } from "@noble/ciphers/aes.js";

// ECL encrypt: plaintext, key and IV in, ciphertext out.
type EclEncrypt = (plaintext: Uint8Array, key: Uint8Array, iv: Uint8Array) => Uint8Array;

// Raw AES-ECB, no PKCS#7 padding. noble's `encrypt` is single-use per instance,
// so each block (which carries feedback from the previous one) gets a fresh one.
const eclEncrypt: EclEncrypt = (plaintext, key, iv) => {
  let fbD = Uint8Array.from(iv);
  let fbB = new Uint8Array(16);

  const fullBlocks = plaintext.length - (plaintext.length % 16);
  const result = new Uint8Array(plaintext.length);
  let resultPos = 0;

  for (let i = 0; i < fullBlocks; i += 16) {
    const block = new Uint8Array(16);
    for (let j = 0; j < 16; j++) {
      block[j] = (plaintext[i + j]! ^ fbD[j]!) & 0xff;
    }

    const ct = ecb(key, { disablePadding: true }).encrypt(block);

    for (let j = 0; j < 16; j++) {
      result[resultPos++] = ct[j]! & 0xff;
    }
    for (let j = 0; j < 16; j++) {
      fbB[j] = (ct[j]! ^ fbD[j]!) & 0xff;
    }

    const tmp = fbD;
    fbD = fbB;
    fbB = tmp;
  }

  const rem = plaintext.length % 16;
  if (rem > 0) {
    const keystream = ecb(key, { disablePadding: true }).encrypt(fbD);
    for (let j = 0; j < rem; j++) {
      result[resultPos++] = (plaintext[fullBlocks + j]! ^ keystream[j]!) & 0xff;
    }
  }

  return result;
};

export default eclEncrypt;
