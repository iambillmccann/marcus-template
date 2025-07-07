/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import * as functions from "firebase-functions";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

export const reverseString = functions.https.onCall((data: any, context) => {
    // Support both callable SDK and direct HTTP POST (like Postman)
    const input: string = (data && data.text) || (data && data.data && data.data.text);
    if (typeof input !== "string") {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `Input must be a string. Received: ${JSON.stringify(input)}`
        );
    }
    const reversed = input.split("").reverse().join("");
    const isPalindrome = input === reversed;
    return {
        reversed,
        ...(isPalindrome && { message: "Hey look, a palindrome!" })
    };
});

export { parseResumeToStructuredHistory } from './parseResumeToStructuredHistory';
