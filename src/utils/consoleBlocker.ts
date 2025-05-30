
/**
 * Sistema de bloqueio de console otimizado e focado
 */

const ERROR_PATTERNS = [
  'permissions policy',
  'unrecognized feature',
  'facebook.com',
  'google-analytics.com',
  'googletagmanager.com',
  'preload',
  'cors error',
  'net::err',
  'content security policy'
];

let isActive = false;
let originalConsole: any = {};

export function initializeConsoleBlocker() {
  if (typeof window === 'undefined' || isActive) return;
  
  isActive = true;
  
  originalConsole = {
    error: console.error,
    warn: console.warn,
    log: console.log
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
        return;
      }
      if (message.match(/^[🎯🔄🛡️🚫🧹⏳🚀🔍]/)) {
        originalFn.apply(console, args);
      }
    };
  };

  console.error = createBlockingFunction(originalConsole.error);
  console.warn = createBlockingFunction(originalConsole.warn);
  console.log = createBlockingFunction(originalConsole.log);

  console.log('🧹 Console bloqueador ativado');
}

export function restoreConsole() {
  if (typeof window === 'undefined' || !isActive) return;
  
  Object.assign(console, originalConsole);
  isActive = false;
  console.log('🔧 Console restaurado');
}
