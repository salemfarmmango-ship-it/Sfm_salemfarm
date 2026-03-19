import * as admin from 'firebase-admin';

const serviceAccount = {
    project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
    try {
        // [New Fix for cPanel]: Use the JSON file directly since the env string is too long/complex for the shell export
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'sfmo-5be58-d22782db0cd3.json';
        
        if (serviceAccount.project_id && serviceAccount.client_email && serviceAccount.private_key) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount as any),
            });
        } else if (serviceAccountPath) {
             // Fallback to local JSON file
             admin.initializeApp({
                credential: admin.credential.cert(serviceAccountPath),
            });
        }
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}

export const adminMessaging = admin.apps.length > 0 ? admin.messaging() : null;
