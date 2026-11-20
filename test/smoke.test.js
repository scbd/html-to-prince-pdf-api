'use strict';

// Smoke tests: start the real server (src/index.js) and render a PDF through Prince.
// Requires the prince binary, so run them inside the Docker image:
//   docker run --rm <image> npm test

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');

const PORT = Number(process.env.TEST_PORT) || 17070;
const BASE = `http://127.0.0.1:${PORT}`;

let server;
let log = '';

const HTML = `<!DOCTYPE html>
<html><head><title>Smoke test</title></head>
<body><h1>html-to-prince-pdf-api</h1><p>Hello PDF. 10 &#13221; of text.</p></body></html>`;

before(async () => {
  server = spawn(process.execPath, [path.join(__dirname, '..', 'src', 'index.js')], {
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', (d) => { log += d; });
  server.stderr.on('data', (d) => { log += d; });

  const deadline = Date.now() + 15000;
  while (!log.includes('Express server listening')) {
    if (server.exitCode !== null) throw new Error(`server exited early:\n${log}`);
    if (Date.now() > deadline) throw new Error(`server did not start:\n${log}`);
    await new Promise((r) => setTimeout(r, 100));
  }
});

after(() => {
  if (server && server.exitCode === null) server.kill('SIGTERM');
});

test('node version satisfies engines (^22.23.4 || ^24.22.1 || >=26.12.1)', () => {
  const [major, minor, patch] = process.versions.node.split('.').map(Number);
  const atLeast = (m, p) => minor > m || (minor === m && patch >= p);
  const ok = (major === 22 && atLeast(23, 4)) ||
             (major === 24 && atLeast(22, 1)) ||
             (major === 26 && atLeast(12, 1)) ||
             major > 26;
  assert.ok(ok, `node ${process.versions.node} does not satisfy engines`);
});

test('POST /api/render returns a valid PDF', async () => {
  const res = await fetch(`${BASE}/api/render?pdf-title=Smoke`, {
    method: 'POST',
    headers: { 'content-type': 'text/html' },
    body: HTML,
  });
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /application\/pdf/);
  const buf = Buffer.from(await res.arrayBuffer());
  assert.equal(buf.subarray(0, 5).toString('latin1'), '%PDF-');
  assert.ok(buf.length > 1000, `PDF too small: ${buf.length} bytes`);
  assert.match(buf.subarray(-1024).toString('latin1'), /%%EOF/);
});

test('attachment-name sets content-disposition', async () => {
  const res = await fetch(`${BASE}/api/render?attachment-name=smoke.pdf`, {
    method: 'POST',
    headers: { 'content-type': 'text/html' },
    body: HTML,
  });
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-disposition') || '', /smoke\.pdf/);
  await res.arrayBuffer();
});

test('bad input (no HTML body) returns 400', async () => {
  const res = await fetch(`${BASE}/api/render`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  });
  assert.equal(res.status, 400);
  assert.equal(await res.text(), 'Error rendering pdf');
});

test('unknown route returns 404', async () => {
  const res = await fetch(`${BASE}/`);
  assert.equal(res.status, 404);
  await res.text();
});

test('server log has no warnings or deprecations', () => {
  assert.doesNotMatch(log, /DeprecationWarning|ExperimentalWarning|\(node:\d+\) \w*Warning|Warning:/,
    `unexpected warnings in server log:\n${log}`);
  assert.doesNotMatch(log, /Uncaught|unhandled/i, `unexpected errors in server log:\n${log}`);
});
