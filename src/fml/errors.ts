// SPDX-License-Identifier: AGPL-3.0-only
// Error hierarchy for the FML decryptor. Every error thrown by decryptFml
// extends FmlDecryptError, so callers can catch the whole family in one clause.

// Base class for all FML decryptor errors.
export class FmlDecryptError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "FmlDecryptError";
  }
}

// Raised when the input is not a well-formed .fml container.
export class InvalidFmlError extends FmlDecryptError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "InvalidFmlError";
  }
}

// Raised when zlib decompression fails; the only error decryptFml treats as a wrong password.
export class DecompressionError extends FmlDecryptError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DecompressionError";
  }
}
