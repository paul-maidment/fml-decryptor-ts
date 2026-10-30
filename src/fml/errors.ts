// SPDX-License-Identifier: AGPL-3.0-only
// Error hierarchy for the FML decryptor. Every error thrown by decryptFml
// extends FmlDecryptError, so callers can catch the whole family in one clause.

/**
 * Base class for all errors raised by this package.
 *
 * Catch this to handle any decryptor failure; catch a subclass for a specific
 * cause. It extends the native `Error`, so `instanceof` and `cause` work as usual.
 */
export class FmlDecryptError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "FmlDecryptError";
  }
}

/**
 * Raised when the input is not a well-formed `.fml` container, for example when
 * it is shorter than the 148-byte header.
 */
export class InvalidFmlError extends FmlDecryptError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "InvalidFmlError";
  }
}

/**
 * Raised when zlib decompression fails.
 *
 * This is the only error {@link decryptFml} treats as evidence of a wrong
 * password, retrying once with the static Phase 1 fallback password.
 */
export class DecompressionError extends FmlDecryptError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DecompressionError";
  }
}
