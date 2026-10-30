// SPDX-License-Identifier: AGPL-3.0-only
// RIPEMD-128, ported byte-for-byte from the reference Ripemd128.cs.
// All arithmetic is kept in uint32 via `>>> 0`.

const IV = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
const KL = [0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc];
const KR = [0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x00000000];

const WL = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
];
const WR = [
  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
];
const SL = [
  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
];
const SR = [
  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
];

function rotl(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0;
}

function f1(x: number, y: number, z: number): number {
  return (x ^ y ^ z) >>> 0;
}
function f2(x: number, y: number, z: number): number {
  return ((x & y) | (~x & z)) >>> 0;
}
function f3(x: number, y: number, z: number): number {
  return ((x | ~y) ^ z) >>> 0;
}
function f4(x: number, y: number, z: number): number {
  return ((x & z) | (y & ~z)) >>> 0;
}

/**
 * Hash bytes with RIPEMD-128.
 *
 * @param data - Input bytes.
 * @returns The 16-byte digest.
 */
type Ripemd128 = (data: Uint8Array) => Uint8Array;

const ripemd128: Ripemd128 = (data) => {
  const ml = BigInt(data.length) * 8n;
  const padLen = (56 - ((data.length + 1) % 64) + 64) % 64;
  const totalLen = data.length + 1 + padLen + 8;
  const padded = new Uint8Array(totalLen);
  padded.set(data, 0);
  padded[data.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setBigUint64(totalLen - 8, ml, true);

  let h0 = IV[0]!;
  let h1 = IV[1]!;
  let h2 = IV[2]!;
  let h3 = IV[3]!;

  const X = new Uint32Array(16);

  for (let i = 0; i < totalLen; i += 64) {
    for (let k = 0; k < 16; k++) {
      X[k] = view.getUint32(i + k * 4, true);
    }

    let al = h0;
    let bl = h1;
    let cl = h2;
    let dl = h3;
    let ar = h0;
    let br = h1;
    let cr = h2;
    let dr = h3;

    for (let j = 0; j < 16; j++) {
      let t = (al + f1(bl, cl, dl) + X[WL[j]!]! + KL[0]!) >>> 0;
      t = rotl(t, SL[j]!);
      al = dl;
      dl = cl;
      cl = bl;
      bl = t;
    }
    for (let j = 16; j < 32; j++) {
      let t = (al + f2(bl, cl, dl) + X[WL[j]!]! + KL[1]!) >>> 0;
      t = rotl(t, SL[j]!);
      al = dl;
      dl = cl;
      cl = bl;
      bl = t;
    }
    for (let j = 32; j < 48; j++) {
      let t = (al + f3(bl, cl, dl) + X[WL[j]!]! + KL[2]!) >>> 0;
      t = rotl(t, SL[j]!);
      al = dl;
      dl = cl;
      cl = bl;
      bl = t;
    }
    for (let j = 48; j < 64; j++) {
      let t = (al + f4(bl, cl, dl) + X[WL[j]!]! + KL[3]!) >>> 0;
      t = rotl(t, SL[j]!);
      al = dl;
      dl = cl;
      cl = bl;
      bl = t;
    }

    for (let j = 0; j < 16; j++) {
      let t = (ar + f4(br, cr, dr) + X[WR[j]!]! + KR[0]!) >>> 0;
      t = rotl(t, SR[j]!);
      ar = dr;
      dr = cr;
      cr = br;
      br = t;
    }
    for (let j = 16; j < 32; j++) {
      let t = (ar + f3(br, cr, dr) + X[WR[j]!]! + KR[1]!) >>> 0;
      t = rotl(t, SR[j]!);
      ar = dr;
      dr = cr;
      cr = br;
      br = t;
    }
    for (let j = 32; j < 48; j++) {
      let t = (ar + f2(br, cr, dr) + X[WR[j]!]! + KR[2]!) >>> 0;
      t = rotl(t, SR[j]!);
      ar = dr;
      dr = cr;
      cr = br;
      br = t;
    }
    for (let j = 48; j < 64; j++) {
      let t = (ar + f1(br, cr, dr) + X[WR[j]!]! + KR[3]!) >>> 0;
      t = rotl(t, SR[j]!);
      ar = dr;
      dr = cr;
      cr = br;
      br = t;
    }

    const tmp = (h1 + cl + dr) >>> 0;
    h1 = (h2 + dl + ar) >>> 0;
    h2 = (h3 + al + br) >>> 0;
    h3 = (h0 + bl + cr) >>> 0;
    h0 = tmp;
  }

  const result = new Uint8Array(16);
  const out = new DataView(result.buffer);
  out.setUint32(0, h0, true);
  out.setUint32(4, h1, true);
  out.setUint32(8, h2, true);
  out.setUint32(12, h3, true);
  return result;
};

export default ripemd128;
