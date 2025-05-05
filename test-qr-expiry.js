const axios = require('axios');

// Base URL of your backend
const BASE_URL = 'http://localhost:5000/api';

async function testQRExpiry() {
    try {
        console.log('Testing QR code expiration and regeneration...\n');

        // First, fetch the questions
        console.log('1. Fetching questions...');
        const questionsResponse = await axios.get(`${BASE_URL}/questions`);
        const questions = questionsResponse.data;
        console.log('Questions fetched:', questions);
        console.log('----------------------------------------\n');

        // Register a test user with the actual question IDs
        console.log('2. Registering test user...');
        const registerResponse = await axios.post(`${BASE_URL}/register`, {
            email: `test${Date.now()}@example.com`,
            answers: questions.map(question => ({
                question: question._id,
                answer: question.options[0] // Using first option as answer
            }))
        });
        const userId = registerResponse.data.userId;
        console.log('User registered with ID:', userId);
        console.log('----------------------------------------\n');

        // Generate first QR code
        console.log('3. Generating first QR code...');
        const qrResponse1 = await axios.post(`${BASE_URL}/generate-qr`, { userId });
        console.log('First QR code generated at:', new Date().toLocaleTimeString());
        console.log('First QR code expires at:', new Date(qrResponse1.data.expiresAt).toLocaleTimeString());
        console.log('Time left:', Math.floor(qrResponse1.data.timeLeft / 1000), 'seconds');
        console.log('----------------------------------------\n');

        // Wait for 35 seconds (longer than QR expiration)
        console.log('4. Waiting for 35 seconds (longer than QR expiration)...');
        await new Promise(resolve => setTimeout(resolve, 35000));
        console.log('----------------------------------------\n');

        // Try to submit answers with expired QR code
        console.log('5. Trying to submit answers with expired QR code...');
        try {
            await axios.post(`${BASE_URL}/check-answers`, {
                userId: userId,
                answers: questions.map(q => q.options[0]), // Using first option as answers
                timestamp: qrResponse1.data.expiresAt - 30000, // Original timestamp
                questionIds: questions.map(q => q._id)
            });
        } catch (error) {
            console.log('Expected error (QR code expired):', error.response?.data?.message);
        }
        console.log('----------------------------------------\n');

        // Generate new QR code
        console.log('6. Generating new QR code...');
        const qrResponse2 = await axios.post(`${BASE_URL}/generate-qr`, { userId });
        console.log('New QR code generated at:', new Date().toLocaleTimeString());
        console.log('New QR code expires at:', new Date(qrResponse2.data.expiresAt).toLocaleTimeString());
        console.log('Time left:', Math.floor(qrResponse2.data.timeLeft / 1000), 'seconds');
        console.log('----------------------------------------\n');

        // Submit answers with new QR code
        console.log('7. Submitting answers with new QR code...');
        const checkResponse = await axios.post(`${BASE_URL}/check-answers`, {
            userId: userId,
            answers: questions.map(q => q.options[0]), // Using first option as answers
            timestamp: qrResponse2.data.expiresAt - 30000,
            questionIds: questions.map(q => q._id)
        });
        console.log('Answers submitted successfully!');
        console.log('Results:', checkResponse.data);
        console.log('----------------------------------------\n');

        console.log('Test completed successfully!');

    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) {
            console.error('Error details:', error.response.data);
        }
    }
}

// Run the test
testQRExpiry(); 