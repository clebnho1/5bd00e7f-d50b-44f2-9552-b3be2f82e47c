
/**
 * Sistema agressivo de limpeza de todos os erros de console
 */

// Lista completa de todos os padrões de erro conhecidos
const ERROR_PATTERNS = [
  // Permissions Policy
  'unrecognized feature',
  'permissions policy',
  'will not be enabled by default',
  'cross-origin iframes',
  'same-origin iframes',
  
  // Facebook/Meta
  'facebook.com',
  'fbcdn.net',
  'connect.facebook.net',
  'pixel.facebook.com',
  'tr?id=',
  'ev=pageview',
  'facebook pixel',
  
  // Google/Analytics
  'google-analytics.com',
  'googletagmanager.com',
  'doubleclick.net',
  'googleadservices.com',
  'googlesyndication.com',
  
  // Preload/Network
  'was preloaded using link preload but not used',
  'preload',
  'prefetch',
  'dns-prefetch',
  'failed to fetch',
  'cors error',
  'networkerror',
  
  // Ad/Tracking
  'joinadinterestgroup',
  'join-ad-interest-group',
  'interest-cohort',
  'attribution-reporting',
  'browsing-topics',
  'ambient-light-sensor',
  'battery',
  'vr'
];

let isCleanupActive = false;

export function initializeAggressiveCleanup() {
  if (typeof window === 'undefined' || isCleanupActive) return;
  
  isCleanupActive = true;
  
  // Backup das funções originais
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;
  const originalInfo = console.info;

  const shouldBlock = (message: string): boolean => {
    if (!message || typeof message !== 'string') return false;
    const lowerMessage = message.toLowerCase();
    return ERROR_PATTERNS.some(pattern => lowerMessage.includes(pattern.toLowerCase()));
  };

  const processMessage = (args: any[]): string => {
    return args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  };

  // Interceptar console.error
  console.error = function(...args: any[]) {
    const message = processMessage(args);
    if (shouldBlock(message)) return;
    originalError.apply(console, args);
  };

  // Interceptar console.warn
  console.warn = function(...args: any[]) {
    const message = processMessage(args);
    if (shouldBlock(message)) return;
    originalWarn.apply(console, args);
  };

  // Interceptar console.log
  console.log = function(...args: any[]) {
    const message = processMessage(args);
    if (shouldBlock(message)) return;
    originalLog.apply(console, args);
  };

  // Interceptar console.info
  console.info = function(...args: any[]) {
    const message = processMessage(args);
    if (shouldBlock(message)) return;
    originalInfo.apply(console, args);
  };

  console.log('🧹 Sistema agressivo de limpeza ativado');
}

// Bloquear window.onerror
if (typeof window !== 'undefined') {
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    const msg = String(message || '');
    if (ERROR_PATTERNS.some(pattern => msg.toLowerCase().includes(pattern.toLowerCase()))) {
      return true; // Bloqueia o erro
    }
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };
}
