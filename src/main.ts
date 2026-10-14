// SPDX-License-Identifier: AGPL-3.0-only
import "./style.css";
import { decryptFml, type DecryptFmlResult } from "./fml";

function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing element #${id}`);
  }
  return element as T;
}

const dropEl = requireElement<HTMLLabelElement>("drop");
const fileEl = requireElement<HTMLInputElement>("file");
const resultEl = requireElement<HTMLElement>("result");
const errorEl = requireElement<HTMLElement>("error");

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
}

function baseName(name: string): string {
  return name.replace(/\.fml$/i, "");
}

function clearPanels(): void {
  resultEl.hidden = true;
  resultEl.replaceChildren();
  errorEl.hidden = true;
  errorEl.replaceChildren();
}

function showError(message: string): void {
  resultEl.hidden = true;
  resultEl.replaceChildren();
  errorEl.hidden = false;
  errorEl.replaceChildren();

  const title = document.createElement("h2");
  title.textContent = "Could not decrypt";
  const body = document.createElement("p");
  body.textContent = message;
  errorEl.append(title, body);
}

function row(label: string, value: string, ok?: boolean): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "row";

  const labelEl = document.createElement("span");
  labelEl.className = "label";
  labelEl.textContent = label;

  const valueEl = document.createElement("span");
  valueEl.className = ok === undefined ? "value" : ok ? "value ok" : "value bad";
  valueEl.textContent = value;

  wrap.append(labelEl, valueEl);
  return wrap;
}

function save(data: Uint8Array, filename: string): void {
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  const blob = new Blob([copy.buffer], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function render(result: DecryptFmlResult, file: File, inputSize: number): void {
  errorEl.hidden = true;
  errorEl.replaceChildren();
  resultEl.hidden = false;
  resultEl.replaceChildren();

  const title = document.createElement("h2");
  title.textContent = "Decrypted";
  const filename = document.createElement("p");
  filename.className = "filename";
  filename.textContent = file.name;
  resultEl.append(title, filename);

  const rows = document.createElement("div");
  rows.className = "rows";
  rows.append(
    row("Phase", String(result.phase)),
    row("Password", result.password),
    row("Seed", result.seed !== undefined ? `0x${result.seed.toString(16).padStart(8, "0")}` : "— (none)"),
    row("Chunks", String(result.chunkCount)),
    row("Decoded size", formatBytes(result.decodedSize)),
    row("Input size", formatBytes(inputSize)),
    row("Ratio", `${(result.decodedSize / inputSize).toFixed(2)}x`),
    row("Used fallback", result.usedFallback ? "yes" : "no", !result.usedFallback),
  );
  resultEl.append(rows);

  const crcTitle = document.createElement("h3");
  crcTitle.textContent = "Chunk CRC32";
  resultEl.append(crcTitle);

  const crcList = document.createElement("div");
  crcList.className = "crcs";
  result.chunkCrcOk.forEach((ok, index) => {
    const chip = document.createElement("span");
    chip.className = ok ? "chip ok" : "chip bad";
    chip.textContent = `#${index + 1} ${ok ? "OK" : "FAIL"}`;
    crcList.append(chip);
  });
  resultEl.append(crcList);

  const download = document.createElement("button");
  download.className = "download";
  download.textContent = `Download ${baseName(file.name)}_decoded.dat`;
  download.addEventListener("click", () => {
    save(result.data, `${baseName(file.name)}_decoded.dat`);
  });
  resultEl.append(download);
}

async function handleFile(file: File): Promise<void> {
  clearPanels();
  dropEl.classList.add("busy");
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const result = await decryptFml(bytes);
    render(result, file, bytes.length);
  } catch (error) {
    showError(error instanceof Error ? error.message : String(error));
  } finally {
    dropEl.classList.remove("busy");
  }
}

fileEl.addEventListener("change", () => {
  const file = fileEl.files?.[0];
  if (file) void handleFile(file);
  fileEl.value = "";
});

for (const type of ["dragenter", "dragover"]) {
  dropEl.addEventListener(type, (event) => {
    event.preventDefault();
    dropEl.classList.add("over");
  });
}
for (const type of ["dragleave", "dragend"]) {
  dropEl.addEventListener(type, () => dropEl.classList.remove("over"));
}

dropEl.addEventListener("drop", (event) => {
  event.preventDefault();
  dropEl.classList.remove("over");
  const file = event.dataTransfer?.files?.[0];
  if (file) void handleFile(file);
});
