// GET /api/flights/stream — Server-Sent Events (SSE) live FIDS feed
//
// Cool feature: instead of polling, clients open a persistent connection and
// receive flight updates pushed from the server every 5 seconds automatically.
//
// Usage in client:
//   const source = new EventSource('/api/flights/stream');
//   source.addEventListener('flights', (e) => {
//     const flights = JSON.parse(e.data);
//     // update your UI
//   });
//   source.addEventListener('error', () => source.close());

import { readFlights } from '@/lib/flights';

export const dynamic = 'force-dynamic';

const INTERVAL_MS = 5_000;

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      function push() {
        // Stop if client has disconnected
        if (request.signal.aborted) {
          clearInterval(timer);
          return;
        }
        try {
          const flights = readFlights();
          const payload = `event: flights\ndata: ${JSON.stringify(flights)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          clearInterval(timer);
        }
      }

      // Push immediately on connect, then every INTERVAL_MS
      push();
      timer = setInterval(push, INTERVAL_MS);

      // Primary cleanup: AbortSignal fires reliably when client disconnects
      request.signal.addEventListener('abort', () => {
        clearInterval(timer);
        try {
          controller.close();
        } catch {
          // already closed, ignore
        }
      });
    },
    // Fallback cleanup if the stream is cancelled via the ReadableStream API
    cancel() {
      clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // disable buffering in nginx proxies
    },
  });
}
