
/**
 * Sistema avançado de limpeza e filtros de console
 */
export function cleanupConsole() {
  if (typeof window === 'undefined') return;

  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  // Lista abrangente de filtros para diferentes tipos de erro
  const errorFilters = {
    permissions: [
      'unrecognized feature',
      'permissions policy',
      'vr', 'ambient-light-sensor', 'battery',
      'join-ad-interest-group', 'interest-cohort',
      'attribution-reporting', 'browsing-topics',
      'cross-origin iframes', 'same-origin iframes nested'
    ],
    facebook: [
      'facebook.com', 'fbcdn.net', 'connect.facebook.net',
      'the resource https://www.facebook.com',
      'tr?id=', 'ev=pageview', 'facebook pixel'
    ],
    preload: [
      'was preloaded using link preload but not used',
      'preload', 'prefetch', 'dns-prefetch'
    ],
    network: [
      'notallowederror', 'networkerror when attempting',
      'failed to fetch', 'cors error'
    ],
    general: [
      'will not be enabled by default',
      'joinadinterestgroup',
      'third-party'
    ]
  };

  // Combina todos os filtros em uma lista única
  const allFilters = Object.values(errorFilters).flat();

  const shouldFilter = (message: string): boolean => {
    if (!message || typeof message !== 'string') return false;
    
    const lowerMessage = message.toLowerCase();
    return allFilters.some(filter => lowerMessage.includes(filter.toLowerCase()));
  };

  const processArgs = (args: any[]): string => {
    return args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'object') return JSON.stringify(arg);
      return String(arg);
    }).join(' ');
  };

  // Substituição do console.error
  console.error = function(...args: any[]) {
    const message = processArgs(args);
    if (shouldFilter(message)) {
      return; // Bloqueia completamente
    }
    originalError.apply(console, args);
  };

  // Substituição do console.warn
  console.warn = function(...args: any[]) {
    const message = processArgs(args);
    if (shouldFilter(message)) {
      return; // Bloqueia completamente
    }
    originalWarn.apply(console, args);
  };

  // Substituição do console.log (apenas para filtrar logs de terceiros)
  console.log = function(...args: any[]) {
    const message = processArgs(args);
    if (shouldFilter(message)) {
      return; // Bloqueia completamente
    }
    originalLog.apply(console, args);
  };

  // Log de confirmação
  console.log('🧹 Sistema de limpeza de console ativado - Filtros aprimorados aplicados');
}
