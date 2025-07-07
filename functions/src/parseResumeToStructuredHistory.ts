import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// import { getGeminiStructuredHistory } from '../lib'; // Gemini logic commented out for now

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const storage = admin.storage();

/**
 * Helper to extract payload from Firebase callable function data.
 * Handles both emulator and production SDK quirks.
 */
function extractPayload(data: any) {
    // Emulator sometimes wraps payload in a 'data' property
    if (data && typeof data === 'object') {
        if ('userId' in data || 'filePaths' in data) {
            return data;
        }
        if ('data' in data && (typeof data.data === 'object')) {
            return data.data;
        }
    }
    return {};
}

/**
 * Callable Cloud Function to parse uploaded resume files into a single corpus string.
 *
 * NOTE: The Firebase emulator and SDK may wrap the payload differently.
 * - In production, the payload is { userId, ... }.
 * - In the emulator, the payload may be { data: { userId, ... } }.
 * This function uses a helper to extract the payload robustly for both environments.
 */
export const parseResumeToStructuredHistory = functions.https.onCall(async (data: any, context) => {
    // Avoid circular structure in logs
    console.log('Raw received data (keys):', Object.keys(data));
    if (data.data) {
        console.log('Raw received data.data:', JSON.stringify(data.data, null, 2));
    }
    const payload = extractPayload(data);
    console.log('Extracted payload:', JSON.stringify(payload, null, 2));
    const userId = payload.userId;
    const filePaths = payload.filePaths;
    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'userId is required');
    }

    // Get file paths if not provided
    let files: string[] = filePaths;
    if (!files) {
        // List all files in user's upload folder (e.g., uploads/{userId}/)
        const [allFiles] = await storage.bucket().getFiles({ prefix: `uploads/${userId}/` });
        files = allFiles.map(f => f.name);
        if (!files.length) {
            throw new functions.https.HttpsError('not-found', 'No files found for user');
        }
    }

    // Download and combine file contents
    let corpus = '';
    for (const filePath of files) {
        const file = storage.bucket().file(filePath);
        const [contents] = await file.download();
        corpus += contents.toString('utf-8') + '\n';
    }

    // For now, just return the corpus for verification
    return { corpus };
});
