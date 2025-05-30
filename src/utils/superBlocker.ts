
/**
 * Bloqueador ULTRA agressivo de TODOS os serviços de terceiros
 */

const BLOCKED_DOMAINS = [
  // Facebook/Meta (todos os domínios possíveis)
  'facebook.com', 'fbcdn.net', 'connect.facebook.net', 'pixel.facebook.com',
  'www.facebook.com', 'static.xx.fbcdn.net', 'm.facebook.com', 'graph.facebook.com',
  'scontent.xx.fbcdn.net', 'external.xx.fbcdn.net',
  
  // Google Analytics/Ads (todos os serviços)
  'google-analytics.com', 'googletagmanager.com', 'doubleclick.net',
  'googleadservices.com', 'googlesyndication.com', 'analytics.google.com',
  'tagmanager.google.com', 'www.googletagmanager.com', 'stats.g.doubleclick.net',
  'pagead2.googlesyndication.com', 'tpc.googlesyndication.com',
  
  // Outros serviços de tracking
  'ads.linkedin.com', 'bat.bing.com', 'clarity.ms', 'c.bing.com',
  'hotjar.com', 'fullstory.com', 'mixpanel.com', 'segment.com',
  'intercom.io', 'zendesk.com', 'crisp.chat', 'drift.com',
  
  // CDNs de tracking
  'cdn.segment.com', 'cdn.mxpnl.com', 'api.segment.io',
  'analytics.tiktok.com', 'analytics.twitter.com'
];

const BLOCKED_KEYWORDS = [
  'pixel', 'tracking', 'analytics', 'gtag', 'fbq', '_gaq', 'dataLayer',
  'beacon', 'track', 'event', 'conversion', 'retargeting', 'remarketing'
];

const BLOCKED_SCRIPTS = [
  'gtag', 'fbevents', 'analytics', 'gtm', 'hotjar', 'clarity', 'segment'
];

export function initializeSuperBlocker() {
  if (typeof window === 'undefined') return;

  // 1. Bloquear criação de elementos de forma ultra agressiva
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName: string, options?: ElementCreationOptions) {
    const element = originalCreateElement.call(this, tagName, options);
    
    if (tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'iframe') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name: string, value: string) {
        if (name === 'src') {
          if (BLOCKED_DOMAINS.some(domain => value.includes(domain)) ||
              BLOCKED_KEYWORDS.some(keyword => value.toLowerCase().includes(keyword))) {
            console.log('🚫 [SUPER_BLOCK] Elemento bloqueado:', value.substring(0, 50) + '...');
            return;
          }
        }
        originalSetAttribute.call(this, name, value);
      };
      
      // Bloquear também innerHTML que contenha scripts
      const originalSetInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML')?.set;
      if (originalSetInnerHTML) {
        Object.defineProperty(element, 'innerHTML', {
          set: function(value: string) {
            if (BLOCKED_KEYWORDS.some(keyword => value.toLowerCase().includes(keyword))) {
              console.log('🚫 [SUPER_BLOCK] innerHTML bloqueado');
              return;
            }
            originalSetInnerHTML.call(this, value);
          },
          get: function() {
            return this._innerHTML || '';
          }
        });
      }
    }
    
    return element;
  } as any;

  // 2. Bloquear appendChild de forma mais segura
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function<T extends Node>(newChild: T): T {
    if (newChild.nodeType === Node.ELEMENT_NODE && newChild instanceof Element) {
      const src = newChild.getAttribute('src');
      const href = newChild.getAttribute('href');
      
      if ((src && (BLOCKED_DOMAINS.some(domain => src.includes(domain)) ||
                   BLOCKED_KEYWORDS.some(keyword => src.toLowerCase().includes(keyword)))) ||
          (href && (BLOCKED_DOMAINS.some(domain => href.includes(domain)) ||
                    BLOCKED_KEYWORDS.some(keyword => href.toLowerCase().includes(keyword))))) {
        console.log('🚫 [SUPER_BLOCK] appendChild bloqueado:', (src || href || '').substring(0, 50) + '...');
        return newChild;
      }
    }
    return originalAppendChild.call(this, newChild);
  };

  // 3. Bloquear insertBefore de forma mais segura
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function<T extends Node>(newChild: T, refChild: Node | null): T {
    if (newChild.nodeType === Node.ELEMENT_NODE && newChild instanceof Element) {
      const src = newChild.getAttribute('src');
      const href = newChild.getAttribute('href');
      
      if ((src && (BLOCKED_DOMAINS.some(domain => src.includes(domain)) ||
                   BLOCKED_KEYWORDS.some(keyword => src.toLowerCase().includes(keyword)))) ||
          (href && (BLOCKED_DOMAINS.some(domain => href.includes(domain)) ||
                    BLOCKED_KEYWORDS.some(keyword => href.toLowerCase().includes(keyword))))) {
        console.log('🚫 [SUPER_BLOCK] insertBefore bloqueado:', (src || href || '').substring(0, 50) + '...');
        return newChild;
      }
    }
    return originalInsertBefore.call(this, newChild, refChild);
  };

  // 4. Interceptar Image de forma ultra agressiva
  const OriginalImage = window.Image;
  window.Image = class extends OriginalImage {
    private _src: string = '';
    
    constructor(width?: number, height?: number) {
      super(width, height);
    }
    
    set src(value: string) {
      if (BLOCKED_DOMAINS.some(domain => value.includes(domain)) ||
          BLOCKED_KEYWORDS.some(keyword => value.toLowerCase().includes(keyword))) {
        console.log('🚫 [SUPER_BLOCK] Image src bloqueado:', value.substring(0, 50) + '...');
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

  // 5. Bloquear fetch de forma ultra agressiva
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input.toString();
    
    if (BLOCKED_DOMAINS.some(domain => url.includes(domain)) ||
        BLOCKED_KEYWORDS.some(keyword => url.toLowerCase().includes(keyword))) {
      console.log('🚫 [SUPER_BLOCK] Fetch bloqueado:', url.substring(0, 50) + '...');
      return Promise.reject(new Error('Blocked by super blocker'));
    }
    
    return originalFetch(input, init);
  };

  // 6. Bloquear XMLHttpRequest de forma ultra agressiva
  const OriginalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = class extends OriginalXHR {
    open(method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null) {
      const urlStr = url.toString();
      
      if (BLOCKED_DOMAINS.some(domain => urlStr.includes(domain)) ||
          BLOCKED_KEYWORDS.some(keyword => urlStr.toLowerCase().includes(keyword))) {
        console.log('🚫 [SUPER_BLOCK] XHR bloqueado:', urlStr.substring(0, 50) + '...');
        throw new Error('Blocked by super blocker');
      }
      
      return super.open(method, url, async, user, password);
    }
  } as any;

  // 7. Neutralizar TODOS os objetos globais de tracking
  const trackingObjects = [
    'gtag', 'ga', 'gaq', '_gaq', 'dataLayer', 'google_tag_manager', 'gtm',
    'fbq', '_fbq', 'FB', 'twq', 'snaptr', 'rdt', 'lintrk', 'clarity',
    'mixpanel', 'analytics', 'segment', 'heap', 'amplitude', 'hotjar',
    'FullStory', 'LogRocket', 'Sentry', 'Rollbar'
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
          },
          set() {
            console.log(`🚫 [SUPER_BLOCK] ${obj} set bloqueado`);
            return true;
          }
        }),
        writable: false,
        configurable: false
      });
    } catch (e) {
      // Silencioso - alguns objetos podem já estar definidos
    }
  });

  // 8. Bloquear eval de scripts maliciosos
  const originalEval = window.eval;
  window.eval = function(code: string) {
    if (BLOCKED_KEYWORDS.some(keyword => code.toLowerCase().includes(keyword))) {
      console.log('🚫 [SUPER_BLOCK] Eval bloqueado');
      return;
    }
    return originalEval(code);
  };

  // 9. Interceptar addEventListener para eventos de tracking
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type: string, listener: any, options?: any) {
    const blockedEvents = ['beforeunload', 'unload', 'pagehide', 'visibilitychange'];
    if (blockedEvents.includes(type.toLowerCase())) {
      // Verificar se o listener contém código de tracking
      const listenerStr = listener.toString();
      if (BLOCKED_KEYWORDS.some(keyword => listenerStr.toLowerCase().includes(keyword))) {
        console.log(`🚫 [SUPER_BLOCK] Event listener ${type} bloqueado`);
        return;
      }
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  console.log('🛡️ Super bloqueador ULTRA ativado - Proteção máxima');
}
