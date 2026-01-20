import * as admin from 'firebase-admin';

const serviceAccount = {
    project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
    if (serviceAccount.project_id && serviceAccount.client_email && serviceAccount.private_key) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount as any),
            });
        } catch (error) {
            console.error('Firebase admin initialization error', error);
        }
    } else {
        console.warn('Firebase Admin credentials missing. Notifications might not work.');
    }
}

export const adminMessaging = admin.apps.length > 0 ? admin.messaging() : null;
