// SPDX-License-Identifier: AGPL-3.0-only
import newEcb from "./newEcb";

// ECL decrypt: ciphertext, key and IV in, plaintext out.
type EclDecrypt = (ct: Uint8Array, key: Uint8Array, iv: Uint8Array) => Uint8Array;

const eclDecrypt: EclDecrypt = (ct, key, iv) => {
  const ecb = newEcb(key);
  let fbD = Uint8Array.from(iv);
  let fbB = new Uint8Array(16);

  const fullBlocks = ct.length - (ct.length % 16);
  const result = new Uint8Array(ct.length);
  let resultPos = 0;

  for (let i = 0; i < fullBlocks; i += 16) {
    for (let j = 0; j < 16; j++) {
      fbB[j] = (ct[i + j]! ^ fbD[j]!) & 0xff;
    }

    const dec = ecb.decrypt(Array.from(ct.subarray(i, i + 16)));

    for (let j = 0; j < 16; j++) {
      result[resultPos++] = (dec[j]! ^ fbD[j]!) & 0xff;
    }

    const tmp = fbD;
    fbD = fbB;
    fbB = tmp;
  }

  const rem = ct.length % 16;
  if (rem > 0) {
    const keystream = ecb.encrypt(Array.from(fbD));
    for (let j = 0; j < rem; j++) {
      result[resultPos++] = (ct[fullBlocks + j]! ^ keystream[j]!) & 0xff;
    }
  }

  return result;
};

export default eclDecrypt;
