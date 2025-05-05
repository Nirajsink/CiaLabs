const mongoose = require('mongoose');
const Question = require('./models/Question');

// Test questions data
const testQuestions = [
    {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"]
    },
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"]
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"]
    }
];

console.log('Attempting to connect to MongoDB...');

// MongoDB connection
mongoose.connect('mongodb+srv://CiaLabs:Craniax101@cialabs.xrd42go.mongodb.net/cia-db?retryWrites=true&w=majority&appName=CiaLabs')
  .then(async () => {
    console.log('MongoDB connected successfully!');
    
    try {
        // Clear existing questions
        await Question.deleteMany({});
        console.log('Cleared existing questions');
        
        // Insert new questions
        const insertedQuestions = await Question.insertMany(testQuestions);
        console.log(`Successfully added ${insertedQuestions.length} questions`);
        console.log('Questions:', JSON.stringify(insertedQuestions, null, 2));
    } catch (error) {
        console.error('Error adding questions:', error);
    } finally {
        mongoose.connection.close();
        console.log('\nDatabase connection closed.');
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  }); 