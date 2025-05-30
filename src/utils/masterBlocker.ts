
/**
 * Sistema master que coordena todos os bloqueadores
 */

import { initializeConsoleBlocker } from './consoleBlocker';
import { initializeNetworkBlocker } from './networkBlocker';
import { initializeDOMCleaner } from './domCleaner';

let isInitialized = false;

export function initializeMasterBlocker() {
  if (typeof window === 'undefined' || isInitialized) {
    return;
  }

  isInitialized = true;
  console.log('🚀 Inicializando sistema master de bloqueio');

  // Inicializar todos os sistemas
  initializeConsoleBlocker();
  initializeNetworkBlocker();
  initializeDOMCleaner();

  // Bloquear window.onerror para evitar spam de erros
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    const msg = String(message || '');
    const blockedPatterns = [
      'permissions policy', 
      'join-ad-interest-group',
      'unrecognized feature',
      'x-frame-options',
      'cloudflareinsights',
      'beacon.min.js'
    ];
    
    if (blockedPatterns.some(pattern => msg.toLowerCase().includes(pattern))) {
      return true; // Bloquear erro
    }
    
    // Permitir erros importantes
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  // Bloquear unhandledrejection para evitar spam
  window.addEventListener('unhandledrejection', function(event) {
    const message = String(event.reason || '');
    const blockedPatterns = [
      'permissions policy', 
      'join-ad-interest-group',
      'cloudflareinsights',
      'beacon'
    ];
    
    if (blockedPatterns.some(pattern => message.toLowerCase().includes(pattern))) {
      event.preventDefault();
    }
  });

  console.log('🛡️ Sistema master de bloqueio ativado - Proteção completa');
}
