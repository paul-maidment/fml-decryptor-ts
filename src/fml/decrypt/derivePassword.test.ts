// SPDX-License-Identifier: AGPL-3.0-only
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { expect, it } from "vitest";
import derivePassword from "./derivePassword";

const SAMPLE_DIR = fileURLToPath(new URL("../../../SampleFiles/", import.meta.url));

function readSample(name: string): Uint8Array {
  return new Uint8Array(readFileSync(join(SAMPLE_DIR, name)));
}

const KNOWN_PHASE_2 = [
  { name: "sample-1", password: "01279247", seed: 2230210428 },
  { name: "sample-2", password: "0098ffef", seed: 2125255912 },
  { name: "sample-3", password: "276c4849", seed: 634301314 },
  { name: "sample-4", password: "5ac7da74", seed: 2222551513 },
];

for (const { name, password, seed } of KNOWN_PHASE_2) {
  it(`${name}.fml derivePassword returns-password-${password}-and-phase-2`, () => {
    const result = derivePassword(readSample(`${name}.fml`));
    expect(result.password).toBe(password);
    expect(result.phase).toBe(2);
    expect(result.seed).toBe(seed);
  });
}

// No vendored sample is Phase 1, so this fixture places next_header_offset at
// EOF (no trailing seed) to exercise the static-password branch.
it("synthetic-phase-1-file derivePassword returns-password-b67de657-and-phase-1", () => {
  const bytes = new Uint8Array(148);
  new DataView(bytes.buffer).setUint32(140, bytes.length, true);

  const result = derivePassword(bytes);

  expect(result.password).toBe("b67de657");
  expect(result.phase).toBe(1);
  expect(result.seed).toBeUndefined();
});

// A next_header_offset that is neither EOF nor EOF-4 falls back to mixing the
// trailing 4 bytes as if Phase 2. 0x84EE4F7C mixes to the known 0x01279247.
it("unknown-next-header-offset derivePassword returns-password-01279247-and-phase-2", () => {
  const bytes = new Uint8Array(148);
  const view = new DataView(bytes.buffer);
  view.setUint32(140, 0, true);
  view.setUint32(144, 0x84ee4f7c, true);

  const result = derivePassword(bytes);

  expect(result.password).toBe("01279247");
  expect(result.phase).toBe(2);
  expect(result.seed).toBeUndefined();
});
