import test from 'node:test';
import assert from 'node:assert/strict';

async function reader() {
  try {
    return (await import('../src/services/chatStream.js')).readChatResponse;
  } catch {
    assert.fail('The widget needs a tested stream reader that preserves incomplete events and surfaces errors');
  }
}

function response(parts, close = true, onCancel = () => {}) {
  const encoder = new TextEncoder();
  return new Response(new ReadableStream({
    start(controller) {
      for (const part of parts) controller.enqueue(typeof part === 'string' ? encoder.encode(part) : part);
      if (close) controller.close();
    },
    cancel: onCancel,
  }), { headers: { 'Content-Type': 'text/event-stream' } });
}

test('chat keeps fragmented event JSON and multibyte text across network chunks', async () => {
  const readChatResponse = await reader();
  const wire = 'data: {"sources":["approved.txt"],"done":false}\r\n\r\n'
    + 'data: {"token":"Hello தமிழ் 🧪","done":false}\r\n\r\n'
    + 'data: {"token":"!","done":false}\n\n'
    + 'data: {"token":"","done":true}\n\n';
  const encoded = new TextEncoder().encode(wire);
  const parts = [];
  for (let offset = 0; offset < encoded.length; offset += 3) parts.push(encoded.slice(offset, offset + 3));
  const tokens = [];
  assert.equal(await readChatResponse(response(parts), token => tokens.push(token)), 'Hello தமிழ் 🧪!');
  assert.deepEqual(tokens, ['Hello தமிழ் 🧪', '!']);
});

test('chat exposes streamed generation errors as a friendly failure instead of a blank success', async () => {
  const readChatResponse = await reader();
  await assert.rejects(readChatResponse(response(['data: {"error":"404 at http://internal-model/api/chat","done":true}\n\n'])),
    error => error.message === 'TANSY is temporarily unavailable. Please try again.');
});

test('chat rejects a truncated reply while retaining delivered text', async () => {
  const readChatResponse = await reader();
  const tokens = [];
  await assert.rejects(readChatResponse(response(['data: {"token":"Partial reply","done":false}\n\n']), token => tokens.push(token)), /temporarily unavailable/);
  assert.deepEqual(tokens, ['Partial reply']);
});

test('chat rejects malformed complete events and unsuccessful HTTP responses', async () => {
  const readChatResponse = await reader();
  await assert.rejects(readChatResponse(response(['data: {broken-json}\n\n'])), /temporarily unavailable/);
  await assert.rejects(readChatResponse(new Response('{"error":"knowledge_unavailable"}', { status: 503 })), /temporarily unavailable/);
});

test('chat completes at the done event and cancels an otherwise open stream', async () => {
  const readChatResponse = await reader();
  let cancelled = false;
  const result = await readChatResponse(response(['data: {"token":"Approved reply"}\n\ndata: {"done":true}\n\n'], false, () => { cancelled = true; }));
  assert.equal(result, 'Approved reply');
  assert.equal(cancelled, true);
});

test('chat treats an empty completed reply as a visible failure', async () => {
  const readChatResponse = await reader();
  await assert.rejects(readChatResponse(response(['data: {"sources":["approved.txt"]}\n\ndata: {"done":true}\n\n'])), /temporarily unavailable/);
});
