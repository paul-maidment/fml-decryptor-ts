// SPDX-License-Identifier: AGPL-3.0-only
import aesjs from "aes-js";
import type { ModeOfOperationECB } from "aes-js";

// Instantiate an AES-ECB operation for the given key.
type NewEcb = (key: Uint8Array) => ModeOfOperationECB;

const newEcb: NewEcb = (key) => new aesjs.ModeOfOperation.ecb(Array.from(key));

export default newEcb;
