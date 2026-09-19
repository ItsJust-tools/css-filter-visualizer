import { useState, useCallback } from 'react';

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fall back to document.execCommand on permission rejection or insecure origin
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (successful) return true;
  } catch {
    // Legacy path failed too — fall through to error reporting below
  }

  // All methods failed — rethrow the original clipboard error when available
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      throw err;
    }
  }

  throw new Error('Clipboard write failed');
}

export interface UseClipboardOptions {
  timeout?: number;
}

export function useClipboard(options: UseClipboardOptions = {}) {
  const { timeout = 2000 } = options;
  const [hasCopied, setHasCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        const success = await copyToClipboard(text);
        if (success) {
          setHasCopied(true);
          setError(null);
          if (timeout > 0) {
            setTimeout(() => {
              setHasCopied(false);
            }, timeout);
          }
        } else {
          throw new Error('Copy command returned false');
        }
        return success;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        setHasCopied(false);
        return false;
      }
    },
    [timeout]
  );

  return { copy, hasCopied, error };
}
