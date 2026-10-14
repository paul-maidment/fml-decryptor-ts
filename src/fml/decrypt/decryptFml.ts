// SPDX-License-Identifier: AGPL-3.0-only
import { DECRYPT_FML_ALT_PASSWORD } from "../../constants";
import type { DecryptFmlResult } from "../../types";
import { DecompressError } from "../compression";
import decryptAllChunks from "./decryptAllChunks";
import derivePassword from "./derivePassword";

// Full decode of a .fml file: bytes in, result out.
type DecryptFml = (bytes: Uint8Array) => Promise<DecryptFmlResult>;

// Tries the derived password, then the fallback; rethrows if both fail.
const decryptFml: DecryptFml = async (bytes) => {
  if (bytes.length < 148) {
    throw new Error("FML data too short");
  }

  const { password, phase, seed } = derivePassword(bytes);

  try {
    const result = await decryptAllChunks(bytes, password);
    return { ...result, phase, password, usedFallback: false, ...(seed === undefined ? {} : { seed }) };
  } catch (err) {
    if (!(err instanceof DecompressError)) throw err;
    const result = await decryptAllChunks(bytes, DECRYPT_FML_ALT_PASSWORD);
    return { ...result, phase: 1, password: DECRYPT_FML_ALT_PASSWORD, usedFallback: true };
  }
};

export default decryptFml;
