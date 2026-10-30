// SPDX-License-Identifier: AGPL-3.0-only
// End-to-end smoke test of the shipped artifact: pack the tarball, install it
// into a fresh project, import it through its public export map, decrypt a
// known sample, assert CommonJS is rejected, and produce a browser bundle.
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sampleDir = join(repoRoot, "SampleFiles");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited with ${result.status}`);
  }
}

function runNpm(args, options = {}) {
  if (process.env.npm_execpath) {
    run(process.execPath, [process.env.npm_execpath, ...args], options);
    return;
  }
  run(process.platform === "win32" ? "npm.cmd" : "npm", args, {
    ...options,
    shell: process.platform === "win32",
  });
}

async function findTarball(dir) {
  const tarball = (await readdir(dir)).find((name) => name.endsWith(".tgz"));
  if (!tarball) {
    throw new Error(`No tarball produced in ${dir}`);
  }
  return join(dir, tarball);
}

const consumerCheck = `
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { decryptFml } from "fml-decryptor-ts";
import * as primitives from "fml-decryptor-ts/primitives";

const [fmlPath, expectedPath] = process.argv.slice(2);
const result = await decryptFml(await readFile(fmlPath));
const expected = await readFile(expectedPath);

if (!Buffer.from(result.data).equals(expected)) {
  throw new Error("decrypted bytes differ from " + expectedPath);
}

const required = [
  "decryptAllChunks",
  "derivePassword",
  "findLastNextHeaderOffset",
  "ripemd128",
  "mix",
  "eclDecrypt",
  "zlibDecompress",
];
for (const name of required) {
  if (typeof primitives[name] !== "function") {
    throw new Error("missing primitive: " + name);
  }
}

const require = createRequire(import.meta.url);
let cjsError;
try {
  require("fml-decryptor-ts");
} catch (error) {
  cjsError = error;
}
if (cjsError?.code !== "ERR_PACKAGE_PATH_NOT_EXPORTED") {
  throw new Error(
    "CommonJS require() should fail with ERR_PACKAGE_PATH_NOT_EXPORTED, got " +
      (cjsError?.code ?? "no error"),
  );
}

console.log("decryptOk:true");
console.log("primitivesOk:true");
console.log("cjsRejected:true");
`;

const browserMain = [
  'import { decryptFml } from "fml-decryptor-ts";',
  "",
  "const status = document.createElement(\"p\");",
  'status.textContent = "decryptFml: " + typeof decryptFml;',
  "document.body.append(status);",
  "",
].join("\n");

const browserHtml = [
  "<!doctype html>",
  '<html lang="en">',
  "  <head><meta charset=\"utf-8\"><title>smoke</title></head>",
  "  <body>",
  '    <script type="module" src="/main.js"></script>',
  "  </body>",
  "</html>",
  "",
].join("\n");

const tempRoot = await mkdtemp(join(tmpdir(), "fml-smoke-"));
try {
  const packDir = join(tempRoot, "pack");
  await mkdir(packDir);
  runNpm(["pack", "--pack-destination", packDir], { cwd: repoRoot });
  const tarball = await findTarball(packDir);

  const consumerDir = join(tempRoot, "consumer");
  await mkdir(consumerDir);
  await writeFile(
    join(consumerDir, "package.json"),
    JSON.stringify(
      {
        name: "fml-smoke-consumer",
        version: "0.0.0",
        private: true,
        type: "module",
      },
      null,
      2,
    ) + "\n",
  );
  runNpm(["install", "--no-audit", "--no-fund", tarball], { cwd: consumerDir });

  await writeFile(join(consumerDir, "check.mjs"), consumerCheck);
  run(
    process.execPath,
    [
      join(consumerDir, "check.mjs"),
      join(sampleDir, "sample-1.fml"),
      join(sampleDir, "sample-1_decoded.dat"),
    ],
    { cwd: consumerDir },
  );

  await writeFile(join(consumerDir, "index.html"), browserHtml);
  await writeFile(join(consumerDir, "main.js"), browserMain);
  run(
    process.execPath,
    [join(repoRoot, "node_modules", "vite", "bin", "vite.js"), "build", "--logLevel", "warn"],
    { cwd: consumerDir },
  );
  console.log("browserBuildOk:true");
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
