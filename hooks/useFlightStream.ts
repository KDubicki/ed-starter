'use client';

import { useEffect, useRef, useState } from 'react';
import { useFlightsStore } from '@/store/flightsStore';
import type { Flight } from '@/types';

type StreamStatus = 'connecting' | 'live' | 'error';

/**
 * Opens a Server-Sent Events connection to /api/flights/stream and
 * automatically pushes new flight data into the Zustand store every 5 s.
 * Returns the current connection status so the UI can show a live indicator.
 */
export function useFlightStream(): StreamStatus {
  const setFlights = useFlightsStore((s) => s.setFlights);
  const [status, setStatus] = useState<StreamStatus>('connecting');
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource('/api/flights/stream');
    esRef.current = es;

    es.addEventListener('flights', (e: MessageEvent) => {
      try {
        const flights = JSON.parse(e.data as string) as Flight[];
        setFlights(flights);
        setStatus('live');
      } catch {
        setStatus('error');
      }
    });

    es.onerror = () => {
      setStatus('error');
      es.close();
    };

    return () => {
      es.close();
    };
  }, [setFlights]);

  return status;
}
