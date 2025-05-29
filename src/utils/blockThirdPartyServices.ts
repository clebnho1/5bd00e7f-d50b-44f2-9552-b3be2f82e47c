
/**
 * Bloqueia serviços de terceiros desnecessários que causam warnings
 */
export function blockThirdPartyServices() {
  if (typeof window === 'undefined') return;

  // Bloqueia Facebook Pixel
  const originalImage = window.Image;
  window.Image = class extends originalImage {
    constructor(width?: number, height?: number) {
      super(width, height);
      
      // Intercepta tentativas de carregar pixel do Facebook
      const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')?.set;
      if (originalSrcSetter) {
        Object.defineProperty(this, 'src', {
          set: function(value: string) {
            if (value && (value.includes('facebook.com') || value.includes('fbcdn.net'))) {
              console.log('🚫 Blocked Facebook pixel:', value);
              return;
            }
            originalSrcSetter.call(this, value);
          },
          get: function() {
            return this.getAttribute('src') || '';
          }
        });
      }
    }
  } as any;

  // Bloqueia preload de recursos desnecessários
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Remove preload de Facebook
          if (element.tagName === 'LINK' && element.getAttribute('rel') === 'preload') {
            const href = element.getAttribute('href');
            if (href && href.includes('facebook.com')) {
              element.remove();
              console.log('🚫 Removed Facebook preload');
            }
          }
        }
      });
    });
  });

  observer.observe(document.head, { childList: true, subtree: true });

  console.log('🛡️ Third-party services blocked');
}

// Executa imediatamente
blockThirdPartyServices();
