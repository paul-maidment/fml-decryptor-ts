// SPDX-License-Identifier: AGPL-3.0-only
import { DECRYPT_FML_ALT_PASSWORD } from "../constants";
import type { DerivePasswordResult } from "../types";
import { mix } from "../key-derivation";
import findLastNextHeaderOffset from "./findLastNextHeaderOffset";
import readU32 from "./readU32";
import toHex8 from "./toHex8";

/**
 * Detect the file generation and derive the decryption password.
 *
 * Phase 1 containers end at EOF and use the static password; Phase 2 containers
 * append a 4-byte seed that is run through the Mixer.
 *
 * @param bytes - Raw `.fml` container bytes.
 * @returns The password, detected phase and Phase 2 seed when present.
 */
type DerivePassword = (bytes: Uint8Array) => DerivePasswordResult;

// Phase 1 (legacy) ends at EOF with the static password; Phase 2 (current)
// appends a 4-byte seed that is run through the Mixer.
const derivePassword: DerivePassword = (bytes) => {
  const lastNextOff = findLastNextHeaderOffset(bytes);

  if (lastNextOff === bytes.length) {
    return { password: DECRYPT_FML_ALT_PASSWORD, phase: 1 };
  }

  if (lastNextOff === bytes.length - 4) {
    const seed = readU32(bytes, bytes.length - 4);
    return { password: toHex8(mix(seed)), phase: 2, seed };
  }

  const last4 = readU32(bytes, bytes.length - 4);
  return { password: toHex8(mix(last4)), phase: 2 };
};

export default derivePassword;
