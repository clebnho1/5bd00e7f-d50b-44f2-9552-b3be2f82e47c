
/**
 * Limpa warnings e erros desnecessários do console
 */
export function cleanupConsole() {
  if (typeof window === 'undefined') return;

  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  // Lista de mensagens para filtrar
  const filterMessages = [
    'Unrecognized feature:',
    'vr',
    'ambient-light-sensor',
    'battery',
    'join-ad-interest-group',
    'Permissions Policy',
    'was preloaded using link preload but not used',
    'facebook.com',
    'fbcdn.net',
    'The resource https://www.facebook.com',
    'NotAllowedError'
  ];

  const shouldFilter = (message: string) => {
    return filterMessages.some(filter => message.includes(filter));
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

  console.log('🧹 Console cleanup ativado');
}
