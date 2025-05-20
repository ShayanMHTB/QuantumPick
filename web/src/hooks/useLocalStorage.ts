"use client";

import { useState, useEffect, useRef } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  
  // Flag to check if we're mounted (to handle SSR)
  const isMounted = useRef(false);

  // Load from localStorage on client-side only when component mounts
  useEffect(() => {
    isMounted.current = true;
    
    try {
      // Check if running in browser environment
      if (typeof window === "undefined") {
        return;
      }

      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      
      // Parse stored json or if none, use initialValue
      const value = item ? JSON.parse(item) : initialValue;
      
      if (isMounted.current) {
        setStoredValue(value);
      }
    } catch (error) {
      // If error, use the initialValue
      console.error("Error reading from localStorage:", error);
      if (isMounted.current) {
        setStoredValue(initialValue);
      }
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [initialValue, key]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Check if running in browser environment
      if (typeof window === "undefined") {
        console.warn(
          `Tried to set localStorage key "${key}" in a non-browser environment`
        );
        return;
      }

      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (valueToStore === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // Log errors
      console.error("Error writing to localStorage:", error);
    }
  };

  return [storedValue, setValue];
}
