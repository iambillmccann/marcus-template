import functionsTest from 'firebase-functions-test';
import { parseResumeToStructuredHistory } from '../parseResumeToStructuredHistory';

const testEnv = functionsTest();

describe('parseResumeToStructuredHistory', () => {
    afterAll(() => {
        testEnv.cleanup();
    });

    it('should throw if userId is missing', async () => {
        const wrapped = testEnv.wrap(parseResumeToStructuredHistory);
        await expect(wrapped({} as any)).rejects.toThrow(/userId is required/i);
    });

    // Add more tests for valid/invalid input, Gemini integration, etc.
});