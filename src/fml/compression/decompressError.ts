// SPDX-License-Identifier: AGPL-3.0-only
// Raised when zlib decompression fails; the only error decryptFml treats as a wrong password.
export default class DecompressError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DecompressError";
  }
}
