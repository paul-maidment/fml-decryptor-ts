// SPDX-License-Identifier: AGPL-3.0-only
// Format a value as 8 lowercase hex digits: number in, string out.
type ToHex8 = (value: number) => string;

// Password strings are the mixed seed rendered as 8 hex characters.
const toHex8: ToHex8 = (value) => {
  return (value >>> 0).toString(16).padStart(8, "0");
};

export default toHex8;
