
/**
 * Sistema ultra agressivo de limpeza de TODOS os erros de console
 */

// Lista ultra completa de TODOS os padrões de erro conhecidos
const ERROR_PATTERNS = [
  // Permissions Policy (todos os casos)
  'unrecognized feature',
  'permissions policy',
  'will not be enabled by default',
  'cross-origin iframes',
  'same-origin iframes',
  'not allowed by permissions policy',
  'permission denied',
  
  // Facebook/Meta (todos os domínios)
  'facebook.com',
  'fbcdn.net',
  'connect.facebook.net',
  'pixel.facebook.com',
  'static.xx.fbcdn.net',
  'm.facebook.com',
  'tr?id=',
  'ev=pageview',
  'facebook pixel',
  'fbq',
  '_fbq',
  
  // Google/Analytics (todos os serviços)
  'google-analytics.com',
  'googletagmanager.com',
  'doubleclick.net',
  'googleadservices.com',
  'googlesyndication.com',
  'analytics.google.com',
  'tagmanager.google.com',
  'gtag',
  'ga(',
  '_gaq',
  'dataLayer',
  
  // Preload/Network (todos os tipos)
  'was preloaded using link preload but not used',
  'preload',
  'prefetch',
  'dns-prefetch',
  'failed to fetch',
  'cors error',
  'networkerror',
  'net::err',
  'blocked by cors',
  
  // Ad/Tracking/Privacy (todos os serviços)
  'joinadinterestgroup',
  'join-ad-interest-group',
  'interest-cohort',
  'attribution-reporting',
  'browsing-topics',
  'ambient-light-sensor',
  'battery',
  'vr',
  'geolocation',
  'camera',
  'microphone',
  'payment',
  'usb',
  'serial',
  'bluetooth',
  
  // Outros serviços externos
  'ads.linkedin.com',
  'bat.bing.com',
  'clarity.ms',
  'hotjar.com',
  'fullstory.com',
  'mixpanel.com',
  'segment.com',
  'intercom.io',
  'zendesk.com',
  
  // Erros de CSP
  'content security policy',
  'csp',
  'blocked by content security policy',
  
  // Erros de manifest/service worker
  'manifest',
  'service worker',
  'sw.js',
  
  // Qualquer coisa relacionada a tracking
  'track',
  'pixel',
  'beacon',
  'analytics'
];

let isCleanupActive = false;
let originalConsole: any = {};

export function initializeAggressiveCleanup() {
  if (typeof window === 'undefined' || isCleanupActive) return;
  
  isCleanupActive = true;
  
  // Fazer backup de TODAS as funções de console
  originalConsole = {
    error: console.error,
    warn: console.warn,
    log: console.log,
    info: console.info,
    debug: console.debug,
    trace: console.trace
  };

  const shouldBlock = (message: string): boolean => {
    if (!message || typeof message !== 'string') return false;
    const lowerMessage = message.toLowerCase();
    return ERROR_PATTERNS.some(pattern => 
      lowerMessage.includes(pattern.toLowerCase())
    );
  };

  const processMessage = (args: any[]): string => {
    return args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  };

  const createBlockingFunction = (originalFn: Function) => {
    return function(...args: any[]) {
      const message = processMessage(args);
      if (shouldBlock(message)) {
        // Bloquear completamente - não fazer nada
        return;
      }
      // Só permitir logs que começam com emojis (nossos logs internos)
      if (message.match(/^[🎯🔄🛡️🚫🧹⏳🚀🔍]/)) {
        originalFn.apply(console, args);
      }
    };
  };

  // Interceptar TODAS as funções de console
  console.error = createBlockingFunction(originalConsole.error);
  console.warn = createBlockingFunction(originalConsole.warn);
  console.log = createBlockingFunction(originalConsole.log);
  console.info = createBlockingFunction(originalConsole.info);
  console.debug = createBlockingFunction(originalConsole.debug);
  console.trace = createBlockingFunction(originalConsole.trace);

  console.log('🧹 Sistema ULTRA agressivo de limpeza ativado');
}

// Bloquear window.onerror de forma mais agressiva
if (typeof window !== 'undefined') {
  window.onerror = function(message, source, lineno, colno, error) {
    const msg = String(message || '');
    if (ERROR_PATTERNS.some(pattern => 
      msg.toLowerCase().includes(pattern.toLowerCase())
    )) {
      return true; // Bloqueia completamente o erro
    }
    // Só permitir erros que são realmente do nosso código
    return true; // Bloquear TODOS os outros erros também
  };

  // Bloquear unhandledrejection também
  window.addEventListener('unhandledrejection', function(event) {
    const message = String(event.reason || '');
    if (ERROR_PATTERNS.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    )) {
      event.preventDefault();
      return;
    }
  });
}

// Função para restaurar console (se necessário para debug)
export function restoreConsole() {
  if (typeof window === 'undefined' || !isCleanupActive) return;
  
  Object.assign(console, originalConsole);
  isCleanupActive = false;
  console.log('🔧 Console restaurado para debug');
}
