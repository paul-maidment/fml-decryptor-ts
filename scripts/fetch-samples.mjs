// SPDX-License-Identifier: AGPL-3.0-only
// Optional refresh of the vendored sample files from the reference C#
// project's published repository. Run with `node scripts/fetch-samples.mjs`.
//
// The files are committed to the repo so tests are hermetic; this script only
// exists to pull a fresh copy from upstream when needed.
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const REF = "1f7041dd379e2f17f7c0b5986a646c9aac4d1f72";
const RAW_BASE = `https://raw.githubusercontent.com/paul-maidment/fml-decryptor/${REF}/SampleFiles`;

const SAMPLES = [
  "sample-1.fml",
  "sample-1_decoded.dat",
  "sample-2.fml",
  "sample-2_decoded.dat",
  "sample-3.fml",
  "sample-3_decoded.dat",
  "sample-4.fml",
  "sample-4_decoded.dat",
  "multi_chunk_sample_1.fml",
  "multi_chunk_sample_1_decoded.dat",
  "multi_chunk_sample_2.fml",
  "multi_chunk_sample_2_decoded.dat",
  "multi_chunk_sample_3.fml",
  "multi_chunk_sample_3_decoded.dat",
];

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "SampleFiles");

await mkdir(outDir, { recursive: true });

for (const name of SAMPLES) {
  const url = `${RAW_BASE}/${name}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  await writeFile(join(outDir, name), bytes);
  console.log(`fetched ${name} (${bytes.length} bytes)`);
}
