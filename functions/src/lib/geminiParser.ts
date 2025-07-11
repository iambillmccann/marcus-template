import { GoogleGenerativeAI } from '@google/generative-ai';
import * as functions from 'firebase-functions';

// Initialize Google AI - using Firebase Functions config
const config = functions.config();
const apiKey = config.gemini?.api_key || process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export interface ContactInformation {
    contactInformation: {
        fullName: string;
        email: string[];
        phones: string[];
    };
}

export async function parseContactInformation(corpus: string): Promise<ContactInformation> {
    console.log('Using Google AI Gemini parser...');

    // Check if API key is available
    if (!apiKey) {
        console.warn('Gemini API key not found in Firebase config or environment, falling back to mock parser');
        return mockParseContactInformation(corpus);
    }

    console.log('API key found, proceeding with Gemini...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an AI assistant that extracts contact information from resume/biography documents.

Parse the following corpus of documents and extract ONLY contact information. Return a JSON object with the exact structure shown below. Prevent duplicate entries in email and phone arrays.

REQUIRED JSON STRUCTURE:
{
  "contactInformation": {
    "fullName": "<string representing the user's name>",
    "email": ["<unique email addresses only>"],
    "phones": ["<unique phone numbers only>"]
  }
}

IMPORTANT RULES:
1. Return ONLY valid JSON - no additional text or explanations
2. Remove duplicates from email and phone arrays
3. If no name is found, use empty string for fullName
4. If no emails are found, use empty array []
5. If no phones are found, use empty array []
6. Normalize phone numbers to a consistent format
7. Ensure email addresses are valid format

CORPUS TO PARSE:
${corpus}

JSON OUTPUT:`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('Gemini raw response:', text);

        // Try to parse the JSON response
        try {
            // Clean up the response - remove markdown code blocks if present
            let cleanText = text.trim();
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }

            const parsedData = JSON.parse(cleanText.trim());

            // Validate the structure
            if (!parsedData.contactInformation) {
                throw new Error('Invalid response structure - missing contactInformation');
            }

            const contact = parsedData.contactInformation;

            // Ensure required fields exist and are correct types
            const result: ContactInformation = {
                contactInformation: {
                    fullName: typeof contact.fullName === 'string' ? contact.fullName : '',
                    email: Array.isArray(contact.email) ? contact.email : [],
                    phones: Array.isArray(contact.phones) ? contact.phones : []
                }
            };

            console.log('Gemini parsing complete:', JSON.stringify(result, null, 2));
            return result;

        } catch (parseError) {
            console.error('Failed to parse Gemini JSON response:', text);
            console.warn('Falling back to mock parser due to JSON parse error');
            return mockParseContactInformation(corpus);
        }

    } catch (error) {
        console.error('Gemini API error:', error);
        console.warn('Falling back to mock parser due to API error');
        return mockParseContactInformation(corpus);
    }
}

// Fallback mock implementation
function mockParseContactInformation(corpus: string): ContactInformation {
    console.log('Using mock Gemini parser for testing...');

    // Extract basic contact info using simple text parsing
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;

    const emails = Array.from(new Set(corpus.match(emailRegex) || []));
    const phoneMatches = corpus.match(phoneRegex) || [];
    const phones = Array.from(new Set(phoneMatches));

    // Simple name extraction - look for common resume patterns
    let fullName = '';
    const lines = corpus.split('\n');
    for (const line of lines.slice(0, 50)) { // Check first 50 lines
        const trimmed = line.trim();
        if (trimmed.length > 5 && trimmed.length < 50 &&
            /^[A-Z][a-z]+ [A-Z][a-z]+/.test(trimmed) &&
            !trimmed.includes('@') && !trimmed.includes('DOCUMENT') &&
            !trimmed.includes('EXPERIENCE') && !trimmed.includes('EDUCATION')) {
            fullName = trimmed;
            break;
        }
    }

    const result: ContactInformation = {
        contactInformation: {
            fullName: fullName || '',
            email: emails,
            phones: phones
        }
    };

    console.log('Mock parsing result:', JSON.stringify(result, null, 2));
    return result;
}
