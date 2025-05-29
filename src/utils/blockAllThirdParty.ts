
/**
 * Bloqueia TODOS os scripts e serviços de terceiros
 */
export function blockAllThirdPartyServices() {
  if (typeof window === 'undefined') return;

  // Bloqueia Google Analytics, GTM, DoubleClick
  const blockedDomains = [
    'google-analytics.com',
    'googletagmanager.com',
    'doubleclick.net',
    'googleadservices.com',
    'googlesyndication.com',
    'facebook.com',
    'fbcdn.net',
    'analytics.google.com',
    'tagmanager.google.com'
  ];

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
    open(method: string, url: string | URL, ...args: any[]) {
      const urlStr = url.toString();
      if (blockedDomains.some(domain => urlStr.includes(domain))) {
        console.log('🚫 Blocked third-party XHR to:', urlStr);
        throw new Error('Third-party XHR blocked');
      }
      return super.open(method, url, ...args);
    }
  } as any;

  // Bloqueia criação de scripts dinâmicos
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName: string, options?: ElementCreationOptions) {
    const element = originalCreateElement.call(this, tagName, options);
    
    if (tagName.toLowerCase() === 'script') {
      const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src')?.set;
      if (originalSrcSetter) {
        Object.defineProperty(element, 'src', {
          set: function(value: string) {
            if (blockedDomains.some(domain => value.includes(domain))) {
              console.log('🚫 Blocked third-party script:', value);
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
    
    if (tagName.toLowerCase() === 'iframe') {
      const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'src')?.set;
      if (originalSrcSetter) {
        Object.defineProperty(element, 'src', {
          set: function(value: string) {
            if (blockedDomains.some(domain => value.includes(domain))) {
              console.log('🚫 Blocked third-party iframe:', value);
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
    
    return element;
  };

  // Bloqueia WebSocket para terceiros
  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = class extends OriginalWebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      const urlStr = url.toString();
      if (blockedDomains.some(domain => urlStr.includes(domain))) {
        console.log('🚫 Blocked third-party WebSocket to:', urlStr);
        throw new Error('Third-party WebSocket blocked');
      }
      super(url, protocols);
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
    '_fbq'
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

  // Substitui dataLayer por um array vazio para evitar erros
  // @ts-ignore
  window.dataLayer = [];

  // Bloqueia tentativas de injeção via appendChild
  const originalAppendChild = Element.prototype.appendChild;
  Element.prototype.appendChild = function<T extends Node>(node: T): T {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const src = element.getAttribute('src');
      
      if (src && blockedDomains.some(domain => src.includes(domain))) {
        console.log('🚫 Blocked third-party element injection:', src);
        return node;
      }
    }
    
    return originalAppendChild.call(this, node);
  };

  console.log('🛡️ All third-party services completely blocked');
}

// Executa imediatamente
blockAllThirdPartyServices();
