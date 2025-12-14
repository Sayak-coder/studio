'use client';

import { firebaseApp } from './config';
import { ReactNode } from 'react';

// This is a workaround for a bug in Next.js where the Firebase app is
// initialized multiple times.
let app: any;
if (!app) {
  app = firebaseApp;
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
