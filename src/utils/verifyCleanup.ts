
/**
 * Verifica se ainda existem referências ao Firebase no projeto
 */
export function verifyFirebaseCleanup() {
  const warnings: string[] = [];

  // Verifica localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.toLowerCase().includes('firebase')) {
      warnings.push(`LocalStorage key found: ${key}`);
    }
  });

  // Verifica sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    if (key.toLowerCase().includes('firebase')) {
      warnings.push(`SessionStorage key found: ${key}`);
    }
  });

  // Verifica se há algum objeto global do Firebase
  if (typeof window !== 'undefined') {
    // @ts-ignore
    if (window.firebase) {
      warnings.push('Global firebase object found');
    }
  }

  if (warnings.length > 0) {
    console.warn('Firebase cleanup warnings:', warnings);
    return false;
  }

  console.log('✅ Firebase cleanup verification passed');
  return true;
}
