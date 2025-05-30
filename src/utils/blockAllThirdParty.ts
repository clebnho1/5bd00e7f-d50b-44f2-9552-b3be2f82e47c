
/**
 * Bloqueia TODOS os scripts e serviços de terceiros
 */
export function blockAllThirdPartyServices() {
  if (typeof window === 'undefined') return;

  // Lista expandida de domínios bloqueados
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
    'www.facebook.com',
    'pixel.facebook.com',
    'static.ads-twitter.com',
    'ads.linkedin.com',
    'bat.bing.com',
    'clarity.ms'
  ];

  // Intercepta e bloqueia Image requests (pixels)
  const OriginalImage = window.Image;
  window.Image = class extends OriginalImage {
    constructor(width?: number, height?: number) {
      super(width, height);
      
      const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')?.set;
      if (originalSrcSetter) {
        Object.defineProperty(this, 'src', {
          set: function(value: string) {
            if (value && blockedDomains.some(domain => value.includes(domain))) {
              console.log('🚫 Blocked third-party pixel:', value.substring(0, 50) + '...');
              return;
            }
            originalSrcSetter.call(this, value);
          },
          get: function() {
            return this.getAttribute('src') || '';
          }
        });
      }
    }
  } as any;

  // Observer mais agressivo para remoção de elementos
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Remove preload/prefetch de terceiros
          if (element.tagName === 'LINK') {
            const rel = element.getAttribute('rel');
            const href = element.getAttribute('href');
            if (href && blockedDomains.some(domain => href.includes(domain))) {
              if (rel === 'preload' || rel === 'prefetch' || rel === 'dns-prefetch') {
                element.remove();
                console.log('🚫 Removed third-party link:', rel, href.substring(0, 50) + '...');
              }
            }
          }

          // Remove scripts de terceiros
          if (element.tagName === 'SCRIPT') {
            const src = element.getAttribute('src');
            if (src && blockedDomains.some(domain => src.includes(domain))) {
              element.remove();
              console.log('🚫 Removed third-party script:', src.substring(0, 50) + '...');
            }
          }

          // Remove iframes de terceiros
          if (element.tagName === 'IFRAME') {
            const src = element.getAttribute('src');
            if (src && blockedDomains.some(domain => src.includes(domain))) {
              element.remove();
              console.log('🚫 Removed third-party iframe:', src.substring(0, 50) + '...');
            }
          }
        }
      });
    });
  });

  observer.observe(document.head, { childList: true, subtree: true });
  observer.observe(document.body, { childList: true, subtree: true });

  // Bloqueia fetch mais rigorosamente
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input.toString();
    
    if (blockedDomains.some(domain => url.includes(domain))) {
      console.log('🚫 Blocked third-party fetch to:', url.substring(0, 50) + '...');
      return Promise.reject(new Error('Third-party fetch blocked'));
    }
    
    return originalFetch(input, init);
  };

  // Bloqueia XMLHttpRequest mais rigorosamente
  const OriginalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = class extends OriginalXHR {
    open(method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null) {
      const urlStr = url.toString();
      if (blockedDomains.some(domain => urlStr.includes(domain))) {
        console.log('🚫 Blocked third-party XHR to:', urlStr.substring(0, 50) + '...');
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
    'gtag', 'ga', 'gaq', '_gaq', 'dataLayer', 'google_tag_manager', 'gtm',
    'fbq', '_fbq', 'FB', 'twq', 'snaptr', 'rdt', 'lintrk', 'clarity'
  ];

  trackingObjects.forEach(obj => {
    try {
      // @ts-ignore
      if (window[obj]) {
        // @ts-ignore
        delete window[obj];
      }
      // @ts-ignore
      window[obj] = function() {
        console.log(`🚫 ${obj} call blocked`);
      };
    } catch (e) {
      // Silencioso
    }
  });

  // Substitui dataLayer por um array vazio protegido
  // @ts-ignore
  window.dataLayer = new Proxy([], {
    set() {
      console.log('🚫 dataLayer push blocked');
      return true;
    }
  });

  console.log('🛡️ Enhanced third-party blocking activated');
}

// Executa imediatamente
blockAllThirdPartyServices();
