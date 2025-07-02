import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getGeminiStructuredHistory } from '../lib'; // Assumes Gemini logic is exported here

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const storage = admin.storage();

/**
 * Callable Cloud Function to parse uploaded resume files into structured history using Gemini.
 *
 * @param data.userId - The user ID whose files to parse
 * @param data.filePaths - (Optional) Array of file paths in Firebase Storage. If not provided, fetches all for user.
 * @returns Structured history JSON
 */
export const parseResumeToStructuredHistory = functions.https.onCall(async (data: any, context) => {
    console.log('Received data:', data);
    const userId = data.userId;
    const filePaths = data.filePaths;
    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'userId is required');
    }

    // Get file paths if not provided
    let files: string[] = filePaths;
    if (!files) {
        // List all files in user's upload folder (e.g., resumes/{userId}/)
        const [allFiles] = await storage.bucket().getFiles({ prefix: `resumes/${userId}/` });
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

    // Call Gemini to parse corpus into structured history
    const prompt = `Parse the following resume/biography corpus into structured JSON with these fields: Contact Information, Career Objectives, Skills, Job History, Education. Merge duplicates and clean up inconsistencies.\n\nCorpus:\n${corpus}`;
    // @ts-ignore: Gemini logic is JS-only or lacks types
    const structuredHistory = await getGeminiStructuredHistory(prompt);

    // Return the structured data
    return structuredHistory;
});
