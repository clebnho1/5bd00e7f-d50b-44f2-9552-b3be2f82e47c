
/**
 * Bloqueador super agressivo de todos os serviços de terceiros
 */

const BLOCKED_DOMAINS = [
  // Facebook/Meta
  'facebook.com', 'fbcdn.net', 'connect.facebook.net', 'pixel.facebook.com',
  'www.facebook.com', 'static.xx.fbcdn.net', 'm.facebook.com',
  
  // Google Analytics/Ads
  'google-analytics.com', 'googletagmanager.com', 'doubleclick.net',
  'googleadservices.com', 'googlesyndication.com', 'analytics.google.com',
  'tagmanager.google.com', 'www.googletagmanager.com',
  
  // Outros serviços de tracking
  'ads.linkedin.com', 'bat.bing.com', 'clarity.ms',
  'hotjar.com', 'fullstory.com', 'mixpanel.com'
];

const BLOCKED_KEYWORDS = [
  'pixel', 'tracking', 'analytics', 'gtag', 'fbq', '_gaq', 'dataLayer'
];

export function initializeSuperBlocker() {
  if (typeof window === 'undefined') return;

  // Bloquear criação de elementos
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName: string, options?: ElementCreationOptions) {
    const element = originalCreateElement.call(this, tagName, options);
    
    if (tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'iframe') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name: string, value: string) {
        if (name === 'src' && BLOCKED_DOMAINS.some(domain => value.includes(domain))) {
          console.log('🚫 [SUPER_BLOCK] Elemento bloqueado:', value);
          return;
        }
        originalSetAttribute.call(this, name, value);
      };
    }
    
    return element;
  } as any;

  // Bloquear appendChild
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function<T extends Node>(newChild: T): T {
    if (newChild.nodeType === Node.ELEMENT_NODE) {
      // Correção do TypeScript: verificar se é Element antes do cast
      if (newChild instanceof Element) {
        const src = newChild.getAttribute('src');
        if (src && BLOCKED_DOMAINS.some(domain => src.includes(domain))) {
          console.log('🚫 [SUPER_BLOCK] appendChild bloqueado:', src);
          return newChild;
        }
      }
    }
    return originalAppendChild.call(this, newChild);
  };

  // Bloquear insertBefore
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function<T extends Node>(newChild: T, refChild: Node | null): T {
    if (newChild.nodeType === Node.ELEMENT_NODE) {
      // Correção do TypeScript: verificar se é Element antes do cast
      if (newChild instanceof Element) {
        const src = newChild.getAttribute('src');
        if (src && BLOCKED_DOMAINS.some(domain => src.includes(domain))) {
          console.log('🚫 [SUPER_BLOCK] insertBefore bloqueado:', src);
          return newChild;
        }
      }
    }
    return originalInsertBefore.call(this, newChild, refChild);
  };

  // Interceptar Image de forma mais agressiva
  const OriginalImage = window.Image;
  window.Image = class extends OriginalImage {
    private _src: string = '';
    
    constructor(width?: number, height?: number) {
      super(width, height);
    }
    
    set src(value: string) {
      if (BLOCKED_DOMAINS.some(domain => value.includes(domain)) ||
          BLOCKED_KEYWORDS.some(keyword => value.toLowerCase().includes(keyword))) {
        console.log('🚫 [SUPER_BLOCK] Image src bloqueado:', value.substring(0, 60) + '...');
        this._src = '';
        return;
      }
      this._src = value;
      super.src = value;
    }
    
    get src(): string {
      return this._src;
    }
  } as any;

  // Bloquear fetch de forma mais agressiva
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input.toString();
    
    if (BLOCKED_DOMAINS.some(domain => url.includes(domain)) ||
        BLOCKED_KEYWORDS.some(keyword => url.toLowerCase().includes(keyword))) {
      console.log('🚫 [SUPER_BLOCK] Fetch bloqueado:', url.substring(0, 60) + '...');
      return Promise.reject(new Error('Blocked by super blocker'));
    }
    
    return originalFetch(input, init);
  };

  // Bloquear XMLHttpRequest de forma mais agressiva
  const OriginalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = class extends OriginalXHR {
    open(method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null) {
      const urlStr = url.toString();
      
      if (BLOCKED_DOMAINS.some(domain => urlStr.includes(domain)) ||
          BLOCKED_KEYWORDS.some(keyword => urlStr.toLowerCase().includes(keyword))) {
        console.log('🚫 [SUPER_BLOCK] XHR bloqueado:', urlStr.substring(0, 60) + '...');
        throw new Error('Blocked by super blocker');
      }
      
      return super.open(method, url, async, user, password);
    }
  } as any;

  // Neutralizar objetos globais
  const trackingObjects = [
    'gtag', 'ga', 'gaq', '_gaq', 'dataLayer', 'google_tag_manager', 'gtm',
    'fbq', '_fbq', 'FB', 'twq', 'snaptr', 'rdt', 'lintrk', 'clarity'
  ];

  trackingObjects.forEach(obj => {
    try {
      Object.defineProperty(window, obj, {
        value: new Proxy(function() {}, {
          apply() {
            console.log(`🚫 [SUPER_BLOCK] ${obj} call bloqueado`);
            return;
          },
          get() {
            return () => console.log(`🚫 [SUPER_BLOCK] ${obj} access bloqueado`);
          }
        }),
        writable: false,
        configurable: false
      });
    } catch (e) {
      // Silencioso
    }
  });

  console.log('🛡️ Super bloqueador ativado');
}
