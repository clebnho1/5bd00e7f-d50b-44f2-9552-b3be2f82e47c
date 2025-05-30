
/**
 * Sistema de bloqueio de rede para terceiros
 */

const BLOCKED_DOMAINS = [
  'facebook.com',
  'google-analytics.com',
  'googletagmanager.com',
  'doubleclick.net',
  'googlesyndication.com'
];

export function initializeNetworkBlocker() {
  if (typeof window === 'undefined') return;

  // Bloquear fetch para domínios específicos
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input.toString();
    
    if (BLOCKED_DOMAINS.some(domain => url.includes(domain))) {
      return Promise.reject(new Error('🚫 Domínio bloqueado pelo sistema'));
    }
    
    return originalFetch.call(this, input, init);
  };

  // Bloquear XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
    const urlString = url.toString();
    
    if (BLOCKED_DOMAINS.some(domain => urlString.includes(domain))) {
      throw new Error('🚫 Domínio bloqueado pelo sistema');
    }
    
    return originalXHROpen.call(this, method, url, ...args);
  };

  console.log('🛡️ Network bloqueador ativado');
}
