// SPDX-License-Identifier: AGPL-3.0-only
// Custom "ECL" feedback mode over AES-ECB, ported from the reference
// FmlDecryptor.EclDecrypt / EclEncrypt. The mode is symmetric per block.
export { default as aesEcbEncryptBlock } from "./aesEcbEncryptBlock";
export { default as eclDecrypt } from "./eclDecrypt";
export { default as eclEncrypt } from "./eclEncrypt";
