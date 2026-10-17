export const CHAT_UNAVAILABLE_MESSAGE = 'TANSY is temporarily unavailable. Please try again.';

// A network read can end anywhere, including inside JSON or a UTF-8 character.
// Buffer complete SSE events before parsing, and require an explicit completion.
export async function readChatResponse(response, onToken = () => {}) {
  if (!response.ok || !response.body) throw new Error(CHAT_UNAVAILABLE_MESSAGE);
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let pending = '';
  let eventLines = [];
  let answer = '';
  let completed = false;

  const dispatch = () => {
    if (!eventLines.length) return;
    const event = JSON.parse(eventLines.join('\n'));
    eventLines = [];
    if (event.error) throw new Error(CHAT_UNAVAILABLE_MESSAGE);
    if (typeof event.token === 'string' && event.token) {
      answer += event.token;
      onToken(event.token);
    }
    if (event.done === true) completed = true;
  };
  const line = value => {
    value = value.replace(/\r$/, '');
    if (!value) dispatch();
    else if (value.startsWith('data:')) eventLines.push(value.slice(5).replace(/^ /, ''));
  };

  try {
    while (!completed) {
      const { value, done } = await reader.read();
      pending += decoder.decode(value, { stream: !done });
      let newline;
      while (!completed && (newline = pending.indexOf('\n')) !== -1) {
        line(pending.slice(0, newline));
        pending = pending.slice(newline + 1);
      }
      if (done) {
        if (pending) line(pending);
        dispatch();
        break;
      }
    }
    if (!completed || !answer.trim()) throw new Error(CHAT_UNAVAILABLE_MESSAGE);
    return answer;
  } catch {
    throw new Error(CHAT_UNAVAILABLE_MESSAGE);
  } finally {
    try { await reader.cancel(); } catch { /* The network may already be closed. */ }
    reader.releaseLock();
  }
}
