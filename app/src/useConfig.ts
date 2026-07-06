import { useState, useEffect } from 'react';
import { Config, DEFAULT_CONFIG } from './types';

const STORAGE_KEY = 'litellm-chat-config';

export function useConfig() {
  const [config, setConfig] = useState<Config>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  return { config, setConfig };
}
