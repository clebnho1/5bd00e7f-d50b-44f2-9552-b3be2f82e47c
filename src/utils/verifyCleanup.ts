
/**
 * Verifica se ainda existem referências ao Firebase no projeto
 */
export function verifyFirebaseCleanup() {
  const warnings: string[] = [];

  // Verifica localStorage
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.toLowerCase().includes('firebase')) {
        warnings.push(`LocalStorage key found: ${key}`);
      }
    });
  } catch (e) {
    warnings.push('Error checking localStorage');
  }

  // Verifica sessionStorage
  try {
    Object.keys(sessionStorage).forEach(key => {
      if (key.toLowerCase().includes('firebase')) {
        warnings.push(`SessionStorage key found: ${key}`);
      }
    });
  } catch (e) {
    warnings.push('Error checking sessionStorage');
  }

  // Verifica se há algum objeto global do Firebase
  if (typeof window !== 'undefined') {
    // @ts-ignore
    if (window.firebase) {
      warnings.push('Global firebase object found');
    }
    // @ts-ignore
    if (window.Firebase) {
      warnings.push('Global Firebase object found');
    }
    // @ts-ignore
    if (window.firestore) {
      warnings.push('Global firestore object found');
    }
    // @ts-ignore
    if (window.__FIREBASE_DEFAULTS__) {
      warnings.push('Firebase defaults found');
    }
  }

  // Verifica se há requests/WebSockets ativos para Firebase
  if (typeof window !== 'undefined' && window.performance) {
    try {
      const entries = window.performance.getEntriesByType('resource');
      entries.forEach((entry: any) => {
        if (entry.name && (entry.name.includes('firebase') || entry.name.includes('firestore'))) {
          warnings.push(`Active Firebase resource: ${entry.name}`);
        }
      });
    } catch (e) {
      console.warn('Could not check performance entries');
    }
  }

  if (warnings.length > 0) {
    console.warn('🚨 Firebase cleanup warnings:', warnings);
    return false;
  }

  console.log('✅ Firebase cleanup verification passed - completely clean!');
  return true;
}

// Executa verificação após um pequeno delay
setTimeout(() => {
  verifyFirebaseCleanup();
}, 1000);
