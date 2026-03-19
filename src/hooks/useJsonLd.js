import { useEffect, useRef } from 'react';

/**
 * Injects one or more JSON-LD <script> blocks into <head>.
 * Automatically cleans up on unmount / dependency change.
 * @param {Object|Object[]|null} data — single or array of JSON-LD objects
 */
export function useJsonLd(data) {
  const scriptRefs = useRef([]);

  useEffect(() => {
    scriptRefs.current.forEach((s) => s.remove());
    scriptRefs.current = [];

    if (!data) return;
    const items = Array.isArray(data) ? data : [data];

    items.forEach((item) => {
      if (!item) return;
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(item);
      document.head.appendChild(script);
      scriptRefs.current.push(script);
    });

    return () => {
      scriptRefs.current.forEach((s) => s.remove());
      scriptRefs.current = [];
    };
  }, [JSON.stringify(data)]); // eslint-disable-line react-hooks/exhaustive-deps
}
