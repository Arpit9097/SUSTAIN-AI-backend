import admin from "firebase-admin";

let isInitialized = false;

export const isFirebaseAdminReady = () => isInitialized;

try {

  admin.initializeApp({

    credential: admin.credential.cert({

      projectId: process.env.FIREBASE_PROJECT_ID,

      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,

      privateKey:
        process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),

    }),

  });

  isInitialized = true;

  console.log("Firebase Admin Initialized Successfully");

} catch (error) {

  console.error("Firebase Admin Init Error:", error);

}

export const verifyToken = async (token) => {

  if (!isInitialized) {

    throw new Error(
      "Firebase Admin not initialized"
    );

  }

  try {

    const decodedToken =
      await admin.auth().verifyIdToken(token);

    return decodedToken;

  } catch (error) {

    throw error;

  }

};

export default admin;