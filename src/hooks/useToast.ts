import { useState, useCallback } from 'react';

interface UseToastReturn {
  message: string | null;
  showToast: (message: string, duration?: number) => void;
}

export function useToast(defaultDuration: number = 2000): UseToastReturn {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string, duration: number = defaultDuration) => {
    setMessage(message);
    setTimeout(() => {
      setMessage(null);
    }, duration);
  }, [defaultDuration]);

  return { message, showToast };
}
