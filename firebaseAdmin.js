import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

// Initialize Firebase Admin SDK
// You need to generate a private key file from your Firebase Console
// Project Settings > Service accounts > Generate new private key
// Save it as 'serviceAccountKey.json' in this directory (c:\sustainai\backend\serviceAccountKey.json).

const serviceAccountPath = new URL('./serviceAccountKey.json', import.meta.url);

let isInitialized = false;

// Export so authMiddleware can check before attempting full verification
export const isFirebaseAdminReady = () => isInitialized;


async function initFirebaseAdmin() {
    try {
        const serviceAccount = JSON.parse(
            await readFile(serviceAccountPath, 'utf8')
        );

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        isInitialized = true;
        console.log("Firebase Admin Initialized Successfully");
    } catch (error) {
        console.error("Error initializing Firebase Admin:", error.message);
        console.error("Detailed Error: Ensure 'serviceAccountKey.json' is present in c:\\sustainai\\backend\\");
        // We don't crash the process, but auth middleware will fail if this didn't work.
    }
}

// Start initialization
initFirebaseAdmin();

export const verifyToken = async (token) => {
    if (!isInitialized) {
        throw new Error("Firebase Admin not initialized. Check server logs for missing serviceAccountKey.json");
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        throw error;
    }
};

export default admin;
