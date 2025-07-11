import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as mammoth from 'mammoth'; // Added for .docx extraction
import pdfParse from 'pdf-parse'; // Added for .pdf extraction
import { parseContactInformation } from './lib'; // Gemini logic for parsing contact info

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
 * Callable Cloud Function to parse uploaded resume files into structured contact information using Gemini AI.
 *
 * This function:
 * 1. Retrieves uploaded files from Firebase Storage (supports .txt, .docx, .pdf)
 * 2. Combines them into a single corpus with document boundaries
 * 3. Uses Gemini AI to extract contact information in a structured JSON format
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

    // Download and combine file contents, handling .docx, .pdf, and .txt
    let corpus = '';
    for (const filePath of files) {
        const file = storage.bucket().file(filePath);
        const [contents] = await file.download();

        // Add document boundary marker
        corpus += `\n--- DOCUMENT START: ${filePath} ---\n`;

        if (filePath.endsWith('.docx')) {
            try {
                const result = await mammoth.extractRawText({ buffer: contents });
                corpus += result.value + '\n';
            } catch (err) {
                console.error(`Failed to extract .docx: ${filePath}`, err);
                corpus += `[ERROR: Failed to extract DOCX content from ${filePath}]\n`;
            }
        } else if (filePath.endsWith('.pdf')) {
            try {
                const result = await pdfParse(contents);
                corpus += result.text + '\n';
            } catch (err) {
                console.error(`Failed to extract .pdf: ${filePath}`, err);
                corpus += `[ERROR: Failed to extract PDF content from ${filePath}]\n`;
            }
        } else {
            corpus += contents.toString('utf-8') + '\n';
        }

        // Add document boundary end marker
        corpus += `--- DOCUMENT END: ${filePath} ---\n\n`;
    }

    // Parse the corpus using Gemini AI to extract contact information
    console.log('Calling Gemini to parse contact information...');
    console.log('Corpus length:', corpus.length);
    console.log('Corpus preview (first 500 chars):', corpus.substring(0, 500));

    try {
        const contactInfo = await parseContactInformation(corpus);
        console.log('Gemini parsing complete:', JSON.stringify(contactInfo, null, 2));

        // Return the structured contact information
        return contactInfo;
    } catch (error) {
        console.error('Gemini parsing failed:', error);
        // Return both corpus and error for debugging
        return {
            error: `Gemini parsing failed: ${error}`,
            corpus: corpus.substring(0, 1000) + '...' // Truncated for debugging
        };
    }
});
