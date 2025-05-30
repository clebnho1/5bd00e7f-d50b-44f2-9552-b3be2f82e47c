
/**
 * Sistema de limpeza do DOM
 */

export function initializeDOMCleaner() {
  if (typeof window === 'undefined') return;

  const cleanDOM = () => {
    // Remover scripts externos conhecidos
    const scripts = document.querySelectorAll('script[src*="facebook"], script[src*="google-analytics"], script[src*="gtag"]');
    scripts.forEach(script => script.remove());

    // Remover elementos de tracking
    const trackingElements = document.querySelectorAll('[id*="fb-"], [id*="google-"], [class*="gtag-"]');
    trackingElements.forEach(element => element.remove());
  };

  // Limpar imediatamente
  cleanDOM();

  // Observer para novos elementos
  const observer = new MutationObserver(() => {
    cleanDOM();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('🧹 DOM cleaner ativado');
}
