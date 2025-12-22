import * as admin from 'firebase-admin';

let app: admin.app.App;

export function initAdmin() {
  if (app) return app;

  if (admin.apps.length > 0) {
    app = admin.apps[0]!;
    return app;
  }

  // When deployed to App Hosting, the service account is automatically discovered.
  // When running locally, you need to set the GOOGLE_APPLICATION_CREDENTIALS
  // environment variable.
  const credential = admin.credential.applicationDefault();
  
  app = admin.initializeApp({ credential });
  
  return app;
}
