# FML Decryptor (TypeScript)

[![npm version](https://img.shields.io/npm/v/fml-decryptor-ts.svg)](https://www.npmjs.com/package/fml-decryptor-ts)
[![license](https://img.shields.io/badge/license-AGPL--3.0--only-blue.svg)](LICENSE)
[![CI](https://github.com/paul-maidment/fml-decryptor-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/paul-maidment/fml-decryptor-ts/actions/workflows/ci.yml)

An isomorphic, decryption-only library for MFME `.fml` containers. Give it the bytes of an
`.fml` file and it returns the decoded payload — in the browser or on Node, with no backend.

The crypto core is a standalone, DOM-free TypeScript port of the reference C# implementation
(`FmlDecryptor.cs` / `Ripemd128.cs`), verified byte-for-byte against that project's published
sample files.

## Install

```bash
npm install fml-decryptor-ts
```

- **ESM-only.** No CommonJS build.
- **Node ≥22.12** (uses the global `DecompressionStream`).
- **Isomorphic.** The core has no DOM dependency, so the same build runs in the browser.

## Building from source

**Requirements:** Node ≥22.12 and npm. The repo uses npm (it ships a `package-lock.json`); yarn and
pnpm are not required.

```bash
git clone https://github.com/paul-maidment/fml-decryptor-ts.git
cd fml-decryptor-ts
npm install
npm run build     # library -> dist/, demo -> dist-demo/
```

`npm run build` is just `npm run build:lib && npm run build:demo`:

| Output       | Built by              | What it is                                                                 |
| ------------ | --------------------- | -------------------------------------------------------------------------- |
| `dist/`      | `npm run build:lib`   | The published library (tsup: ESM + `.d.ts`). This is what `import "fml-decryptor-ts"` resolves to. |
| `dist-demo/` | `npm run build:demo`  | The static browser demo (Vite).                                            |

If you only need the library, run `npm run build:lib` on its own.

> **Local consumers:** projects that depend on this package via
> `"fml-decryptor-ts": "file:../fml-decryptor-ts"` (for example `fml-decoder-ts`) resolve the
> package through `dist/`. Run `npm run build:lib` here first, otherwise their install/build will
> fail or pick up a stale build.

For day-to-day development run `npm run dev` (demo dev server), and `npm run check` before pushing
(typecheck, lint, tests, build, package and CVE checks — the same suite CI runs).

## Usage

```ts
import { decryptFml } from "fml-decryptor-ts";

const bytes = new Uint8Array(await file.arrayBuffer());
const result = await decryptFml(bytes);

result.data; // Uint8Array — the decoded payload
result.phase; // 1 | 2 — which file generation was detected
result.password; // the derived (or fallback) 8-hex-char password
result.usedFallback; // true when the static fallback password was needed
result.seed; // number | undefined — Phase 2 only
result.chunkCount; // number of chunks decoded
result.chunkCrcOk; // boolean[] — per-chunk CRC32 status (non-fatal)
result.decodedSize; // total decoded byte length
```

`decryptFml` accepts `Uint8Array | ArrayBuffer` and always returns `Uint8Array` in `result.data`.

### Result shape

```ts
interface DecryptFmlResult {
  data: Uint8Array;
  phase: 1 | 2;
  password: string;
  usedFallback: boolean;
  seed?: number;
  chunkCount: number;
  chunkCrcOk: boolean[];
  decodedSize: number;
}
```

### Errors

All errors extend `FmlDecryptError`:

| Class                | Thrown when                                                    |
| -------------------- | -------------------------------------------------------------- |
| `InvalidFmlError`    | The input is not a well-formed container (e.g. shorter than 148 bytes). |
| `DecompressionError` | zlib decompression fails — the signal that the password was wrong. |

`decryptFml` tries the derived password first and falls back to the static Phase 1 password
only when a `DecompressionError` is raised. Any other error propagates unchanged.

```ts
import { decryptFml, FmlDecryptError, InvalidFmlError } from "fml-decryptor-ts";

try {
  const result = await decryptFml(bytes);
} catch (err) {
  if (err instanceof InvalidFmlError) {
    // not an .fml file
  } else if (err instanceof FmlDecryptError) {
    // any other decryptor failure
  }
}
```

## Primitives

The low-level building blocks live on the `fml-decryptor-ts/primitives` subpath. The top-level
API is built entirely from these; they are exported for advanced or experimental use, and are
not covered by the same stability guarantee as `decryptFml`.

```ts
import { ripemd128, mix, eclDecrypt, zlibDecompress } from "fml-decryptor-ts/primitives";
```

`/primitives` exports: `decryptAllChunks`, `derivePassword`, `findLastNextHeaderOffset`,
`computeChunkCrc32`, `ripemd128`, `mix`, `mixInverse`, `eclDecrypt`, `eclEncrypt`,
`aesEcbEncryptBlock`, `zlibDecompress`, `DECRYPT_FML_ALT_PASSWORD`.

## How it works

```text
last 4 bytes ─► Mixer (×100) ─► 8-char hex password ─► RIPEMD-128 ─► 16-byte AES key
              ─► IV (AES-ECB of 0xFF ×16) ─► ECL decrypt ─► zlib decompress ─► plaintext
```

Two file generations exist:

| Phase                  | Password                  | Layout                         | Detected by                                   |
| ---------------------- | ------------------------- | ------------------------------ | --------------------------------------------- |
| **Phase 1** (legacy)   | static `b67de657`         | ends at EOF, no seed           | last chunk's `next_header_offset == file size` |
| **Phase 2** (current)  | seed-derived via the Mixer | 4-byte seed appended at EOF    | last chunk's `next_header_offset == file size - 4` |

Each chunk is independently ECL-decrypted and zlib-decompressed, trimmed to its declared size,
and concatenated; a per-chunk CRC32 is checked (non-fatal) against the header.

## Verification & provenance

The port is matched to the reference C# implementation, not just the prose format description:

- **Reference project:** <https://github.com/paul-maidment/fml-decryptor>
- **Sample files:** the `.fml` / `_decoded.dat` fixtures in `SampleFiles/` are vendored from that
  repository (committed, so tests are hermetic). Refresh them with `node scripts/fetch-samples.mjs`.

Releases are published from GitHub Actions using npm **trusted publishing** (OIDC, no long-lived
tokens) with automatic **provenance**, so the published bytes are tied to this repository, commit
and workflow.

## The demo

`demo/` holds a browser page that drops an `.fml` file onto `decryptFml` and offers the decoded
output as a download. It is a demo, not a shipped artifact.

Run `npm run dev` for the dev server at <http://localhost:5173>, or `npm run build:demo` to emit a
static build to `dist-demo/` (see [Building from source](#building-from-source)).

A GitHub Pages deploy of the demo is a separate follow-up.

## Project layout

```text
.
├─ src/fml/                standalone, DOM-free library (the published core)
│  ├─ index.ts             public API: decryptFml, result type, error classes
│  ├─ primitives.ts        fml-decryptor-ts/primitives
│  ├─ errors.ts            FmlDecryptError → InvalidFmlError, DecompressionError
│  ├─ constants.ts         shared constants (named after the function they serve)
│  ├─ types.ts             shared types
│  ├─ key-derivation/      mix, mixInverse, ripemd128
│  ├─ ecl/                 ECL feedback mode over AES-ECB (@noble/ciphers)
│  ├─ compression/         zlib decompression (native DecompressionStream)
│  ├─ decrypt/             password derivation + chunk decode
│  └─ utils/               internal byte/string helpers
├─ demo/                   browser demo app (Vite)
├─ tsup.config.ts          library build (dist/)
├─ vite.config.ts          demo build (dist-demo/)
├─ vitest.config.ts        test config
├─ SampleFiles/            vendored .fml + *_decoded.dat fixtures
└─ scripts/fetch-samples.mjs
```

## Scripts

| Script                   | What it does                                                     |
| ------------------------ | ---------------------------------------------------------------- |
| `npm run dev`            | Start the demo dev server                                        |
| `npm run build:lib`      | Build the library to `dist/` (tsup)                              |
| `npm run build:demo`     | Build the demo to `dist-demo/` (Vite)                            |
| `npm run build`          | Both of the above (`build:lib` then `build:demo`)                |
| `npm test`               | Run the Vitest suite once                                        |
| `npm run typecheck`      | `tsc --noEmit`                                                   |
| `npm run typecheck:core` | Typecheck `src/fml/**` with no `DOM` lib (enforces the DOM-free core) |
| `npm run lint`           | ESLint                                                           |
| `npm run publint`        | Validate the published package layout                            |
| `npm run attw`           | Check the published types (ESM-only profile)                     |
| `npm run check`          | **Everything:** typecheck (+ core) → lint → test → build → publint → attw → CVE scan |

### Releasing

Version bumps are published by pushing a `v*` tag; `.github/workflows/publish.yml` builds the
library and runs `npm publish` via trusted publishing. See `CHANGELOG.md` for the release history.

## License

Licensed under the **GNU Affero General Public License v3.0** (`AGPL-3.0-only`) — see [`LICENSE`](LICENSE).

AGPL-3.0 carries a network clause: if you run a modified version of this software to provide a
service over a network, you must offer that service's users the corresponding source.
