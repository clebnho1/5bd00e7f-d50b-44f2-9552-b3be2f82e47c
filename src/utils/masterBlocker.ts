
/**
 * Sistema master que coordena todos os bloqueadores
 */

import { initializeConsoleBlocker } from './consoleBlocker';
import { initializeNetworkBlocker } from './networkBlocker';
import { initializeDOMCleaner } from './domCleaner';

export function initializeMasterBlocker() {
  if (typeof window === 'undefined') return;

  console.log('🚀 Inicializando sistema master de bloqueio');

  // Inicializar todos os sistemas
  initializeConsoleBlocker();
  initializeNetworkBlocker();
  initializeDOMCleaner();

  // Bloquear window.onerror
  window.onerror = function(message) {
    const msg = String(message || '');
    const blockedPatterns = ['permissions policy', 'facebook', 'google-analytics'];
    
    if (blockedPatterns.some(pattern => msg.toLowerCase().includes(pattern))) {
      return true;
    }
    return true;
  };

  // Bloquear unhandledrejection
  window.addEventListener('unhandledrejection', function(event) {
    const message = String(event.reason || '');
    const blockedPatterns = ['permissions policy', 'facebook', 'google-analytics'];
    
    if (blockedPatterns.some(pattern => message.toLowerCase().includes(pattern))) {
      event.preventDefault();
    }
  });

  console.log('🛡️ Sistema master de bloqueio ativado - Proteção completa');
}
