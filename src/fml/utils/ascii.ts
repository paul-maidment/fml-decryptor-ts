// SPDX-License-Identifier: AGPL-3.0-only
// Encode a string as ASCII bytes: string in, bytes out.
type Ascii = (value: string) => Uint8Array;

// Low byte of each char code.
const ascii: Ascii = (value) => {
  const out = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i++) out[i] = value.charCodeAt(i) & 0xff;
  return out;
};

export default ascii;
