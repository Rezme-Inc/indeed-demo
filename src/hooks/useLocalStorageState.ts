import { useEffect, useState } from "react";

export function useLocalStorageState<T>(
  key: string,
  initialValue: T | null = null
) {
  const readValue = () => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T | null>(readValue);

  // Reload when key changes
  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist when value changes
  useEffect(() => {
    if (storedValue === null) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
      }
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // ignore write errors
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
