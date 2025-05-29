
/**
 * Remove todas as referências do Firebase do localStorage
 */
export function cleanupFirebaseData() {
  if (typeof window === 'undefined') return;

  const keysToRemove = [
    'firebase:authUser',
    'firebase:host',
    'firebase:previous_websocket_failure',
    'firebase:persistance',
    'firebase:location',
    'firebase:auth_user',
    'firebase:device_uuid'
  ];

  // Remove chaves específicas do Firebase
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  // Remove qualquer chave que contenha 'firebase' no nome
  Object.keys(localStorage).forEach(key => {
    if (key.toLowerCase().includes('firebase')) {
      localStorage.removeItem(key);
    }
  });

  Object.keys(sessionStorage).forEach(key => {
    if (key.toLowerCase().includes('firebase')) {
      sessionStorage.removeItem(key);
    }
  });

  console.log('Firebase cleanup completed');
}

// Executa a limpeza uma vez quando o módulo é carregado
cleanupFirebaseData();
