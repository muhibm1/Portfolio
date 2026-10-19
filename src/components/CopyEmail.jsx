import { useEffect, useRef, useState } from 'react';

const COPIED = 'Copied';
const SELECTED = 'Selected';
const REST = 'Copy';
const RESET_SECONDS = 1.8;

/**
 * The email address as selectable text with a Copy button beside it. Copy uses the clipboard when
 * the browser allows it and otherwise selects the address so the visitor can copy it by hand.
 * Nothing leaves the browser.
 */
export default function CopyEmail({ email }) {
  const [label, setLabel] = useState(REST);
  const addressRef = useRef(null);
  const timerRef = useRef(null);

  // Clears the pending label reset when the component leaves the page.
  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Shows a short confirmation on the button, then puts the usual label back.
  const confirm = (text) => {
    setLabel(text);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setLabel(REST), RESET_SECONDS * 1000);
  };

  // Selects the address text so the visitor can copy it themselves.
  const selectAddress = () => {
    const node = addressRef.current;
    if (!node) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    confirm(SELECTED);
  };

  const copy = () => {
    try {
      navigator.clipboard.writeText(email).then(() => confirm(COPIED), selectAddress);
    } catch {
      selectAddress();
    }
  };

  return (
    <span className="inline-flex items-center gap-2.5">
      <span ref={addressRef} className="cursor-text select-all font-mono text-sm text-ink tab:text-[14.5px]">
        {email}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy the email address"
        className="min-h-8 cursor-pointer rounded-full border border-line-strong bg-surface px-3 text-[13px] text-ink hover:border-ink"
      >
        {label}
      </button>
    </span>
  );
}
