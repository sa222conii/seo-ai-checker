import * as admin from 'firebase-admin';

// Initialize Firebase Admin only if we have credentials
// This prevents build errors when environment variables are missing during build time
if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: privateKey.replace(/\\n/g, '\n'),
                }),
            });
        } catch (error) {
            console.error('Firebase Admin initialization error:', error);
        }
    } else {
        // Log warning but don't crash during build
        if (process.env.NODE_ENV !== 'production') {
            console.warn('Firebase Admin credentials missing. Skipping initialization.');
        }
    }
}

export const verifyIdToken = async (token: string) => {
    if (!admin.apps.length) {
        console.error('Firebase Admin not initialized');
        return null;
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying ID token:', error);
        return null;
    }
};
