import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import rawConfig from './firebase-applet-config.json';

// Handle potential ESM import inconsistency where JSON is wrapped in a default export
const firebaseConfig = (rawConfig as any).default || rawConfig;

let app;
let db: ReturnType<typeof getFirestore>;
let auth: ReturnType<typeof getAuth>;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  throw error;
}

export { db, auth };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string|null;
  authInfo: {
    userId?: string|null;
    email?: string|null;
    emailVerified?: boolean|null;
    isAnonymous?: boolean|null;
    tenantId?: string|null;
    providerInfo?: {
      providerId?: string|null;
      email?: string|null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string|null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  return errInfo.error;
}



