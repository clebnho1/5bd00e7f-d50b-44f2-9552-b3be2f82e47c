
/**
 * Remove todas as referências do Firebase do localStorage, sessionStorage e memória
 */
export function cleanupFirebaseData() {
  if (typeof window === 'undefined') return;

  // Lista abrangente de chaves Firebase conhecidas
  const firebaseKeys = [
    'firebase:authUser',
    'firebase:host',
    'firebase:previous_websocket_failure',
    'firebase:persistance',
    'firebase:location',
    'firebase:auth_user',
    'firebase:device_uuid',
    'firebase:heartbeat',
    'firebase:installations',
    'firebase:messaging',
    'firebase:remote-config',
    'firebase:analytics',
    'firebase:performance',
    'firebase:database',
    'firebase:firestore',
    'firebase:storage',
    'firebase:functions',
    'firebaseLocalStorageDb',
    'firebaseLocalStorage',
    'firebase-installations-database',
    'firebase-messaging-database',
    'firebase-heartbeat-database',
    'firebase-analytics-database'
  ];

  // Remove chaves específicas do Firebase
  firebaseKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn(`Error removing ${key}:`, e);
    }
  });

  // Remove qualquer chave que contenha 'firebase' no nome (case insensitive)
  try {
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
  } catch (e) {
    console.warn('Error during Firebase cleanup:', e);
  }

  // Remove objetos globais do Firebase
  if (typeof window !== 'undefined') {
    // @ts-ignore
    if (window.firebase) {
      // @ts-ignore
      delete window.firebase;
    }
    // @ts-ignore
    if (window.Firebase) {
      // @ts-ignore
      delete window.Firebase;
    }
    // @ts-ignore
    if (window.firestore) {
      // @ts-ignore
      delete window.firestore;
    }
    // @ts-ignore
    if (window.__FIREBASE_DEFAULTS__) {
      // @ts-ignore
      delete window.__FIREBASE_DEFAULTS__;
    }
  }

  // Limpa IndexedDB relacionada ao Firebase
  if ('indexedDB' in window) {
    try {
      const deleteDB = (dbName: string) => {
        const deleteReq = indexedDB.deleteDatabase(dbName);
        deleteReq.onerror = () => console.warn(`Failed to delete ${dbName}`);
      };
      
      // Bancos conhecidos do Firebase
      deleteDB('firebaseLocalStorageDb');
      deleteDB('firebase-installations-database');
      deleteDB('firebase-messaging-database');
      deleteDB('firebase-heartbeat-database');
      deleteDB('firebase-analytics-database');
    } catch (e) {
      console.warn('Error cleaning IndexedDB:', e);
    }
  }

  console.log('🧹 Firebase cleanup completed - all traces removed');
}

// Bloqueia qualquer tentativa de inicialização do Firebase
export function blockFirebaseInitialization() {
  if (typeof window === 'undefined') return;

  // @ts-ignore
  window.firebase = undefined;
  // @ts-ignore
  window.Firebase = undefined;
  
  // Sobrescreve qualquer tentativa de importar Firebase
  if (typeof define === 'function') {
    const originalDefine = define;
    // @ts-ignore
    window.define = function(deps: any, factory: any) {
      if (Array.isArray(deps)) {
        deps = deps.filter((dep: string) => !dep.includes('firebase'));
      }
      return originalDefine(deps, factory);
    };
  }
}

// Executa a limpeza imediatamente
cleanupFirebaseData();
blockFirebaseInitialization();
