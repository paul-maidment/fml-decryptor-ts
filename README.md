# FML Decryptor (TypeScript)

A browser-only decryptor for MFME `.fml` containers. Drop an `.fml` file onto the page, it
decrypts in-memory and offers a `_decoded.dat` download. Nothing is uploaded — there is no
server.

The crypto core is a standalone, DOM-free TypeScript port of the reference C# implementation
(`FmlDecryptor.cs` / `Ripemd128.cs`), verified byte-for-byte against that project's published
sample files.

## Features

- **Decrypt-only.** Ports the decode path; no encoder.
- **Standalone core.** All crypto lives in `src/fml/` with no DOM dependency — the UI merely
  imports it.
- **Client-side.** Runs entirely in the browser via Vite; no backend.
- **Multi-chunk, phase-aware.** Handles Phase 1 (legacy) and Phase 2 (current) files, auto-detecting
  the phase and deriving the per-file password.
- **Verified.** Unit vectors plus full byte-for-byte decode of the reference `SampleFiles`.

## Quick start

Requires Node.js `^20.19` or `>=22.12`. The project uses **Yarn 4 (Berry)**, pinned via the
`packageManager` field and activated with Corepack.

```bash
corepack enable    # once, so `yarn` resolves to the pinned version
yarn install

yarn dev           # dev server -> http://localhost:5173
yarn build         # production build -> dist/
yarn preview       # serve the production build
```

## Using it

1. Open the dev server (or the built `dist/`) in a browser.
2. Drag an `.fml` file onto the drop zone, or click to pick one.
3. Read the result panel — phase, password, seed, chunk count, decoded size, and per-chunk
   CRC32 status.
4. Click **Download** to save `<name-without-.fml>_decoded.dat`.

## How it works

```text
last 4 bytes ─► Mixer (×100) ─► 8-char hex password ─► RIPEMD-128 ─► 16-byte AES key
              ─► IV (AES-ECB of 0xFF ×16) ─► ECL decrypt ─► zlib decompress ─► plaintext
```

Two file generations exist:

| Phase | Password | Layout | Detected by |
|-------|----------|--------|-------------|
| **Phase 1** (legacy) | static `b67de657` | ends at EOF, no seed | last chunk's `next_header_offset == file size` |
| **Phase 2** (current) | seed-derived via Mixer | 4-byte seed appended at EOF | last chunk's `next_header_offset == file size - 4` |

Each chunk is independently ECL-decrypted and zlib-decompressed, trimmed to its declared size,
and concatenated; a per-chunk CRC32 is checked (non-fatal) against the header.

## Project layout

```text
.
├─ index.html                 upload UI shell
├─ vite.config.ts             Vite + Vitest config
├─ eslint.config.mjs          flat ESLint config
├─ SampleFiles/               vendored .fml + *_decoded.dat fixtures
├─ scripts/
│  └─ fetch-samples.mjs       refresh fixtures from the reference repo
└─ src/
   ├─ main.ts                 UI glue: picker, drag-drop, result panel, download
   ├─ style.css
   ├─ constants.ts            shared constants (named after the function they serve)
   ├─ types.ts                shared types
   ├─ types/aes-js.d.ts       ambient types for aes-js
   └─ fml/                    standalone, DOM-free decryptor
      ├─ index.ts             public API
      ├─ key-derivation/      mix, mixInverse, ripemd128
      ├─ ecl/                 ECL feedback mode over AES-ECB
      ├─ compression/         zlib decompression (native DecompressionStream)
      ├─ decrypt/             password derivation + chunk decode
      └─ utils/               internal byte/string helpers
```

Each source file holds a single function in a consistent style (a local `type`, a `const`
typed with it, and a `default` export). Most functions have a `<function>.test.ts` beside
them, kept beside the code they cover: the crypto core and decode path carry direct
known-answer and byte-for-byte vectors, while a few small helpers are covered indirectly
through those tests.

## Scripts

| Script | What it does |
|--------|--------------|
| `yarn dev` | Start the Vite dev server |
| `yarn build` | Typecheck and build to `dist/` |
| `yarn preview` | Serve the production build |
| `yarn test` | Run the Vitest suite once |
| `yarn test:watch` | Vitest in watch mode |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn typecheck:core` | Typecheck `src/fml/**` with no `DOM` lib (enforces the DOM-free core) |
| `yarn lint` / `yarn lint:fix` | ESLint (fix in place) |
| `yarn audit` | `yarn npm audit` |
| `yarn audit:osv` | OSV Scanner over the lockfile |
| `yarn check` | **Everything:** typecheck (+ core) → lint → test → build → CVE scan |

### One command for all checks

```bash
yarn check
```

Runs the full gate in one shot. A Husky `pre-commit` hook runs the fast subset
(`typecheck` + `typecheck:core` + `lint`) on every commit, and the GitHub Actions workflow
(`.github/workflows/ci.yml`) runs the whole `check` on push/PR.

`audit:osv` shells out to [OSV Scanner](https://github.com/google/osv-scanner); install the
binary and put it on your `PATH` (the CI workflow does this automatically).

## Testing

Vitest, with test files kept beside the functions they cover:

```bash
yarn test
```

Coverage mirrors the reference C# test project: RIPEMD-128 and Mixer known-answer vectors, ECL
encrypt/decrypt vectors, CRC32 vectors, and full byte-for-byte decode of `sample-1..4` and
`multi_chunk_sample_1..3`.

## Verification & provenance

The port is matched to the reference C# implementation, not just the prose format description:

- **Reference project:** <https://github.com/paul-maidment/fml-decryptor>
- **Sample files:** the 14 `.fml` / `_decoded.dat` fixtures in `SampleFiles/` are vendored from
  that repository (committed, so tests are hermetic). Refresh them with
  `node scripts/fetch-samples.mjs`.

### Known gap

No vendored sample is a Phase 1 (legacy) file. The suite builds a **synthetic Phase 1 fixture**
from the ported `eclEncrypt` and the reference header constants, and flags it as such rather
than claiming real-world coverage.

## Out of scope

No encoder / encode UI, no React, no WebCrypto (it cannot do AES-ECB), no backend.

## License

Licensed under the **GNU Affero General Public License v3.0** (`AGPL-3.0-only`) — see [`LICENSE`](LICENSE).

AGPL-3.0 carries a network clause: if you run a modified version of this software to provide a
service over a network, you must offer that service's users the corresponding source.
