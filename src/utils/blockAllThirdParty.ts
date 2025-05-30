
/**
 * Sistema avançado de bloqueio de serviços de terceiros
 */
export function blockAllThirdPartyServices() {
  if (typeof window === 'undefined') return;

  // Lista expandida e categorizada de domínios bloqueados
  const blockedDomains = {
    analytics: [
      'google-analytics.com', 'googletagmanager.com', 'analytics.google.com',
      'tagmanager.google.com', 'doubleclick.net', 'googleadservices.com',
      'googlesyndication.com'
    ],
    social: [
      'facebook.com', 'fbcdn.net', 'connect.facebook.net',
      'www.facebook.com', 'pixel.facebook.com', 'static.ads-twitter.com'
    ],
    advertising: [
      'ads.linkedin.com', 'bat.bing.com', 'clarity.ms',
      'googleads.g.doubleclick.net', 'tpc.googlesyndication.com'
    ]
  };

  const allBlockedDomains = Object.values(blockedDomains).flat();

  // Interceptação mais robusta de Image (pixels de tracking)
  const OriginalImage = window.Image;
  window.Image = class extends OriginalImage {
    constructor(width?: number, height?: number) {
      super(width, height);
      
      const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')?.set;
      if (originalSrcSetter) {
        Object.defineProperty(this, 'src', {
          set: function(value: string) {
            if (value && allBlockedDomains.some(domain => value.includes(domain))) {
              console.log('🚫 [BLOCK] Pixel bloqueado:', value.substring(0, 60) + '...');
              return;
            }
            originalSrcSetter.call(this, value);
          },
          get: function() {
            return this.getAttribute('src') || '';
          },
          configurable: true,
          enumerable: true
        });
      }
    }
  } as any;

  // Observer mais agressivo com throttling
  let observerTimeout: number | null = null;
  const observer = new MutationObserver((mutations) => {
    if (observerTimeout) return;
    
    observerTimeout = window.setTimeout(() => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Bloqueio de links de preload/prefetch
            if (element.tagName === 'LINK') {
              const rel = element.getAttribute('rel');
              const href = element.getAttribute('href');
              if (href && allBlockedDomains.some(domain => href.includes(domain))) {
                if (rel === 'preload' || rel === 'prefetch' || rel === 'dns-prefetch') {
                  element.remove();
                  console.log('🚫 [BLOCK] Link removido:', rel, href.substring(0, 60) + '...');
                }
              }
            }

            // Bloqueio de scripts
            if (element.tagName === 'SCRIPT') {
              const src = element.getAttribute('src');
              if (src && allBlockedDomains.some(domain => src.includes(domain))) {
                element.remove();
                console.log('🚫 [BLOCK] Script removido:', src.substring(0, 60) + '...');
              }
            }

            // Bloqueio de iframes
            if (element.tagName === 'IFRAME') {
              const src = element.getAttribute('src');
              if (src && allBlockedDomains.some(domain => src.includes(domain))) {
                element.remove();
                console.log('🚫 [BLOCK] Iframe removido:', src.substring(0, 60) + '...');
              }
            }
          }
        });
      });
      observerTimeout = null;
    }, 100);
  });

  observer.observe(document, { childList: true, subtree: true });

  // Fetch interceptor aprimorado
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input.toString();
    
    if (allBlockedDomains.some(domain => url.includes(domain))) {
      console.log('🚫 [BLOCK] Fetch bloqueado:', url.substring(0, 60) + '...');
      return Promise.reject(new Error('Requisição de terceiro bloqueada'));
    }
    
    return originalFetch(input, init);
  };

  // XMLHttpRequest interceptor aprimorado
  const OriginalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = class extends OriginalXHR {
    open(method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null) {
      const urlStr = url.toString();
      if (allBlockedDomains.some(domain => urlStr.includes(domain))) {
        console.log('🚫 [BLOCK] XHR bloqueado:', urlStr.substring(0, 60) + '...');
        throw new Error('Requisição XHR de terceiro bloqueada');
      }
      
      return super.open(method, url, async, user, password);
    }
  } as any;

  // Bloqueio de objetos globais de tracking
  const trackingObjects = [
    'gtag', 'ga', 'gaq', '_gaq', 'dataLayer', 'google_tag_manager', 'gtm',
    'fbq', '_fbq', 'FB', 'twq', 'snaptr', 'rdt', 'lintrk', 'clarity',
    'GoogleAnalyticsObject', '_gat', '_gtag'
  ];

  trackingObjects.forEach(obj => {
    try {
      Object.defineProperty(window, obj, {
        value: function() {
          console.log(`🚫 [BLOCK] ${obj} call interceptado`);
        },
        writable: false,
        configurable: false
      });
    } catch (e) {
      // Silencioso se já estiver definido
    }
  });

  // DataLayer protegido
  try {
    Object.defineProperty(window, 'dataLayer', {
      value: new Proxy([], {
        set() {
          console.log('🚫 [BLOCK] dataLayer push bloqueado');
          return true;
        },
        get() {
          return function() {
            console.log('🚫 [BLOCK] dataLayer access bloqueado');
          };
        }
      }),
      writable: false,
      configurable: false
    });
  } catch (e) {
    // Silencioso se já estiver definido
  }

  console.log('🛡️ Sistema de bloqueio de terceiros ativado - Proteção máxima aplicada');
}

// Execução imediata
blockAllThirdPartyServices();
