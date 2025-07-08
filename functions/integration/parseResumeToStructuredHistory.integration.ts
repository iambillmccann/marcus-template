import { initializeApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';

// Minimal Firebase config for emulator use only
const firebaseConfig = {
    apiKey: 'fake',
    authDomain: 'fake',
    projectId: 'ai-resume-writer-46403', // Replace with your actual projectId if different
    appId: 'fake'
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Point to the local emulator
connectFunctionsEmulator(functions, 'localhost', 5001);

async function runIntegrationTest() {
    const parseResumeToStructuredHistory = httpsCallable(functions, 'parseResumeToStructuredHistory');
    try {
        const result = await parseResumeToStructuredHistory({ userId: 'h8jKZcK81VekRCJYXa8Gk6RhOnp1' });
        console.log('Function result:', result.data);
    } catch (err) {
        console.error('Function error:', err);
    }
}

runIntegrationTest();
