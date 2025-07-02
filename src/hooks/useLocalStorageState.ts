import { useEffect, useState, useRef } from "react";

export function useLocalStorageState<T>(
  key: string,
  initialValue: T | null = null
) {
  const readValue = () => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T | null>(readValue);
  const lastValueRef = useRef<string | null>(null);

  // Reload when key changes
  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Poll for changes in localStorage (for same-tab updates)
  useEffect(() => {
    const pollForChanges = () => {
      if (typeof window === "undefined") return;
      
      const currentValue = localStorage.getItem(key);
      if (currentValue !== lastValueRef.current) {
        lastValueRef.current = currentValue;
        setStoredValue(readValue());
      }
    };

    // Poll every 100ms for changes
    const interval = setInterval(pollForChanges, 100);

    // Also listen for native storage events (for cross-tab updates)
    const handleNativeStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        setStoredValue(readValue());
      }
    };

    window.addEventListener('storage', handleNativeStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleNativeStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist when value changes
  useEffect(() => {
    if (storedValue === null) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
        lastValueRef.current = null;
      }
      return;
    }
    try {
      const serializedValue = JSON.stringify(storedValue);
      localStorage.setItem(key, serializedValue);
      lastValueRef.current = serializedValue;
    } catch (error) {
      console.error(`Error saving to ${key} in localStorage:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
