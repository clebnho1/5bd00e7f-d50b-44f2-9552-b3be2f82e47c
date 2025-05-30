
/**
 * Bloqueia TODOS os scripts e serviços de terceiros
 */
export function blockAllThirdPartyServices() {
  if (typeof window === 'undefined') return;

  // Bloqueia Google Analytics, GTM, DoubleClick, Facebook
  const blockedDomains = [
    'google-analytics.com',
    'googletagmanager.com',
    'doubleclick.net',
    'googleadservices.com',
    'googlesyndication.com',
    'facebook.com',
    'fbcdn.net',
    'analytics.google.com',
    'tagmanager.google.com',
    'connect.facebook.net',
    'www.facebook.com'
  ];

  // Bloqueia preload de recursos do Facebook
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Remove preload de terceiros
          if (element.tagName === 'LINK' && element.getAttribute('rel') === 'preload') {
            const href = element.getAttribute('href');
            if (href && blockedDomains.some(domain => href.includes(domain))) {
              element.remove();
              console.log('🚫 Removed third-party preload:', href);
            }
          }

          // Remove scripts de terceiros
          if (element.tagName === 'SCRIPT') {
            const src = element.getAttribute('src');
            if (src && blockedDomains.some(domain => src.includes(domain))) {
              element.remove();
              console.log('🚫 Removed third-party script:', src);
            }
          }

          // Remove iframes de terceiros
          if (element.tagName === 'IFRAME') {
            const src = element.getAttribute('src');
            if (src && blockedDomains.some(domain => src.includes(domain))) {
              element.remove();
              console.log('🚫 Removed third-party iframe:', src);
            }
          }
        }
      });
    });
  });

  observer.observe(document.head, { childList: true, subtree: true });
  observer.observe(document.body, { childList: true, subtree: true });

  // Bloqueia fetch para domínios de terceiros
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input.toString();
    
    if (blockedDomains.some(domain => url.includes(domain))) {
      console.log('🚫 Blocked third-party fetch to:', url);
      return Promise.reject(new Error('Third-party fetch blocked'));
    }
    
    return originalFetch(input, init);
  };

  // Bloqueia XMLHttpRequest
  const OriginalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = class extends OriginalXHR {
    open(method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null) {
      const urlStr = url.toString();
      if (blockedDomains.some(domain => urlStr.includes(domain))) {
        console.log('🚫 Blocked third-party XHR to:', urlStr);
        throw new Error('Third-party XHR blocked');
      }
      
      if (async !== undefined) {
        if (user !== undefined) {
          if (password !== undefined) {
            return super.open(method, url, async, user, password);
          }
          return super.open(method, url, async, user);
        }
        return super.open(method, url, async);
      }
      return super.open(method, url);
    }
  } as any;

  // Remove objetos globais de tracking
  const trackingObjects = [
    'gtag',
    'ga',
    'gaq',
    '_gaq',
    'dataLayer',
    'google_tag_manager',
    'gtm',
    'fbq',
    '_fbq',
    'FB'
  ];

  trackingObjects.forEach(obj => {
    try {
      // @ts-ignore
      if (window[obj]) {
        // @ts-ignore
        delete window[obj];
      }
    } catch (e) {
      // Silencioso
    }
  });

  // Substitui dataLayer por um array vazio
  // @ts-ignore
  window.dataLayer = [];

  // Bloqueia Facebook Pixel especificamente
  // @ts-ignore
  window.fbq = function() {
    console.log('🚫 Facebook Pixel call blocked');
  };

  console.log('🛡️ All third-party services completely blocked');
}

// Executa imediatamente
blockAllThirdPartyServices();
