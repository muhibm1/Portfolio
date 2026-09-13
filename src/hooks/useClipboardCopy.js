import { useEffect, useRef, useState } from 'react';

const COPY_FEEDBACK_MS = 2000;

/**
 * Copies text to the clipboard and reports "copied" or "failed" for two seconds, then "idle".
 * At most one reset timer is pending, and none outlives the component.
 */
export function useClipboardCopy() {
  const [copyStatus, setCopyStatus] = useState('idle');
  const resetTimerRef = useRef(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimeout(resetTimerRef.current);
    };
  }, []);

  const copyText = async (text) => {
    const hasCopied = await writeToClipboard(text);
    // The caller can unmount (or close) while the browser is still writing to the clipboard.
    if (!isMountedRef.current) return;

    clearTimeout(resetTimerRef.current);
    setCopyStatus(hasCopied ? 'copied' : 'failed');
    resetTimerRef.current = setTimeout(() => setCopyStatus('idle'), COPY_FEEDBACK_MS);
  };

  return [copyStatus, copyText];
}

// Resolves true only when the browser confirms the write. A missing Clipboard API (older
// browsers, non-secure origins) and a rejected write (permission denied) both resolve false.
async function writeToClipboard(text) {
  if (!navigator.clipboard) return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
