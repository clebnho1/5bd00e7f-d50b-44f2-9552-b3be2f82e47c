
import { useState, useCallback } from 'react';

export function useWebhookValidation() {
  const [isValidUrl, setIsValidUrl] = useState(false);

  const validateWebhookUrl = useCallback((url: string): boolean => {
    if (!url.trim()) {
      setIsValidUrl(false);
      return false;
    }

    try {
      const urlObj = new URL(url);
      const isValid = urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      setIsValidUrl(isValid);
      return isValid;
    } catch {
      setIsValidUrl(false);
      return false;
    }
  }, []);

  return {
    isValidUrl,
    validateWebhookUrl
  };
}
