# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-10-14

### Added

- Initial public release of `fml-decryptor-ts`.
- `decryptFml` — isomorphic, decryption-only decode of MFME `.fml` containers (Phase 1 and
  Phase 2), returning the decoded bytes plus phase, password, seed, chunk count and per-chunk
  CRC32 status.
- Error hierarchy: `FmlDecryptError` (base), `InvalidFmlError`, `DecompressionError`.
- `fml-decryptor-ts/primitives` subpath exposing the crypto building blocks.
- Tag-driven GitHub Actions release workflow using npm OIDC trusted publishing with provenance.

### Changed

- Replaced `aes-js` with `@noble/ciphers` for AES-ECB (raw block mode, no padding).
- The library is now ESM-only and targets the browser and Node ≥20.19; the core stays DOM-free.
- The former root Vite app is now a demo under `demo/` and is no longer the shipped artifact.

[Unreleased]: https://github.com/paul-maidment/fml-decryptor-ts/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/paul-maidment/fml-decryptor-ts/releases/tag/v0.1.0
