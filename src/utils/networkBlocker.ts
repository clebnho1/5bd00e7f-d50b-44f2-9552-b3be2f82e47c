
/**
 * Sistema de bloqueio de rede para terceiros
 */

const BLOCKED_DOMAINS = [
  'facebook.com',
  'google-analytics.com',
  'googletagmanager.com',
  'doubleclick.net',
  'googlesyndication.com',
  'cloudflareinsights.com',
  'beacon.min.js',
  'clarity.ms',
  'hotjar.com',
  'fullstory.com',
  'static.cloudflareinsights.com'
];

let isActive = false;

export function initializeNetworkBlocker() {
  if (typeof window === 'undefined' || isActive) return;
  
  isActive = true;

  // Bloquear fetch para domínios específicos
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input.toString();
    
    if (BLOCKED_DOMAINS.some(domain => url.includes(domain))) {
      console.log(`🚫 Fetch bloqueado: ${url}`);
      return Promise.reject(new Error('🚫 Domínio bloqueado pelo sistema'));
    }
    
    return originalFetch.call(this, input, init);
  };

  // Bloquear XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
    const urlString = url.toString();
    
    if (BLOCKED_DOMAINS.some(domain => urlString.includes(domain))) {
      console.log(`🚫 XHR bloqueado: ${urlString}`);
      throw new Error('🚫 Domínio bloqueado pelo sistema');
    }
    
    return originalXHROpen.call(this, method, url, ...args);
  };

  // Bloquear criação de scripts dinamicamente
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName: string) {
    const element = originalCreateElement.call(this, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name: string, value: string) {
        if (name.toLowerCase() === 'src' && BLOCKED_DOMAINS.some(domain => value.includes(domain))) {
          console.log(`🚫 Script dinâmico bloqueado: ${value}`);
          return;
        }
        return originalSetAttribute.call(this, name, value);
      };
    }
    
    return element;
  };

  console.log('🛡️ Network bloqueador ativado');
}
