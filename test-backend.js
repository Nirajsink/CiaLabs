const axios = require('axios');

// Base URL of your backend
const BASE_URL = 'http://localhost:5000/api';

// Generate a unique email using timestamp
const uniqueEmail = `test${Date.now()}@example.com`;

async function testBackend() {
    try {
        console.log('Starting backend tests...\n');
        console.log('Using email:', uniqueEmail);

        // First, let's fetch the questions
        console.log('Fetching questions...');
        let questions;
        try {
            const questionsResponse = await axios.get(`${BASE_URL}/questions`);
            console.log('Questions fetched:', questionsResponse.data);
            questions = questionsResponse.data;
            
            if (!questions || questions.length === 0) {
                console.log('No questions found in the database. Please add some questions first.');
                console.log('Run "node add-questions.js" in your backend folder to add questions.');
                return;
            }
        } catch (error) {
            console.error('Error fetching questions:', error.message);
            return;
        }

        // Prepare answers with actual question IDs
        const answers = questions.map(question => ({
            question: question._id,
            answer: question.options[0] // Using first option as answer for testing
        }));

        // Register user with answers
        console.log('\nTest 1: Register User with Answers');
        let userId;
        try {
            const registerResponse = await axios.post(`${BASE_URL}/register`, {
                email: uniqueEmail,
                answers: answers
            });
            console.log('Register Response:', registerResponse.data);
            userId = registerResponse.data.userId;
        } catch (error) {
            console.error('Register Error:', error.response?.data || error.message);
            return;
        }
        console.log('----------------------------------------\n');

        // Generate QR Code
        console.log('Test 2: Generate QR Code');
        let qrData;
        try {
            const qrResponse = await axios.post(`${BASE_URL}/generate-qr`, {
                userId: userId
            });
            console.log('QR Code generated successfully');
            console.log('QR Code expires at:', new Date(qrResponse.data.expiresAt).toLocaleTimeString());
            console.log('Time left:', Math.floor(qrResponse.data.timeLeft / 1000), 'seconds');
            
            // For testing purposes, we'll use the same questions but shuffled
            // In a real scenario, the QR code would be scanned and decoded by the client
            qrData = {
                questions: questions.map(q => ({
                    question: q.question,
                    options: [...q.options].sort(() => Math.random() - 0.5), // Shuffle options
                    questionId: q._id.toString()
                })).sort(() => Math.random() - 0.5), // Shuffle questions
                timestamp: Date.now(),
                userId: userId
            };
        } catch (error) {
            console.error('QR Code Error:', error.response?.data || error.message);
            return;
        }
        console.log('----------------------------------------\n');

        // Simulate someone scanning the QR and submitting answers
        console.log('Test 3: Check Answers');
        try {
            // Extract question IDs from QR data
            const questionIds = qrData.questions.map(q => q.questionId);
            
            // Submit answers (using second option for each question)
            const checkAnswersResponse = await axios.post(`${BASE_URL}/check-answers`, {
                userId: userId,
                answers: qrData.questions.map(q => q.options[1]), // Using second option as answers
                timestamp: qrData.timestamp,
                questionIds: questionIds
            });
            console.log('Check Answers Response:', checkAnswersResponse.data);
        } catch (error) {
            console.error('Check Answers Error:', error.response?.data || error.message);
            return;
        }
        console.log('----------------------------------------\n');

        console.log('All tests completed successfully!');

    } catch (error) {
        console.error('General Error:', error);
    }
}

// Run the tests
testBackend(); 