
/**
 * Limpa warnings e erros desnecessários do console
 */
export function cleanupConsole() {
  if (typeof window === 'undefined') return;

  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  // Lista expandida de mensagens para filtrar
  const filterMessages = [
    'Unrecognized feature:',
    'vr',
    'ambient-light-sensor',
    'battery',
    'join-ad-interest-group',
    'interest-cohort',
    'attribution-reporting',
    'browsing-topics',
    'Permissions Policy',
    'was preloaded using link preload but not used',
    'facebook.com',
    'fbcdn.net',
    'connect.facebook.net',
    'The resource https://www.facebook.com',
    'NotAllowedError',
    'will not be enabled by default',
    'cross-origin iframes',
    'same-origin iframes nested',
    'joinAdInterestGroup',
    'tr?id=',
    'ev=PageView'
  ];

  const shouldFilter = (message: string) => {
    return filterMessages.some(filter => message.toLowerCase().includes(filter.toLowerCase()));
  };

  console.error = function(...args: any[]) {
    const message = args.join(' ');
    if (shouldFilter(message)) {
      return;
    }
    originalError.apply(console, args);
  };

  console.warn = function(...args: any[]) {
    const message = args.join(' ');
    if (shouldFilter(message)) {
      return;
    }
    originalWarn.apply(console, args);
  };

  console.log = function(...args: any[]) {
    const message = args.join(' ');
    if (shouldFilter(message)) {
      return;
    }
    originalLog.apply(console, args);
  };

  console.log('🧹 Console cleanup ativado - Erros de terceiros filtrados');
}
