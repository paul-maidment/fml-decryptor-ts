// SPDX-License-Identifier: AGPL-3.0-only
declare module "aes-js" {
  export class ModeOfOperationECB {
    constructor(key: number[] | Uint8Array);
    encrypt(plaintext: number[] | Uint8Array): number[];
    decrypt(ciphertext: number[] | Uint8Array): number[];
  }

  const aesjs: {
    ModeOfOperation: {
      ecb: typeof ModeOfOperationECB;
    };
  };

  export default aesjs;
}
