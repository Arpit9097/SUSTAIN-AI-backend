import { verifyToken, isFirebaseAdminReady } from "../firebaseAdmin.js";

export const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1];

        if (isFirebaseAdminReady()) {
            // Full Firebase Admin token verification (most secure)
            const decodedToken = await verifyToken(token);
            req.user = decodedToken;
        } else {
            // Graceful fallback: basic JWT structure check
            // (Firebase Admin not configured — serviceAccountKey.json missing)
            const parts = token.split(".");
            if (parts.length !== 3) {
                return res.status(401).json({ error: "Unauthorized: Malformed token" });
            }
            // Decode payload (no signature verification in fallback mode)
            const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
            // Check expiry
            if (payload.exp && Date.now() / 1000 > payload.exp) {
                return res.status(401).json({ error: "Unauthorized: Token expired" });
            }
            req.user = payload;
            console.warn("[authMiddleware] ⚠️  Running in fallback mode — add serviceAccountKey.json for full token verification");
        }

        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized: Invalid token", details: error.message });
    }
};
