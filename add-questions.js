const mongoose = require('mongoose');
const Question = require('./models/Question');

// Test questions data
const testQuestions = [
    {
        question: "What is your go-to comfort food?",
        options: ["Pizza", "Ice Cream", "Noodles", "Soup"]
    },
    {
        question: "Which of these places would you love to visit the most?",
        options: ["Beach", "Mountains", "City", "Countryside"]
    },
    {
        question: "What is your favorite season of the year?",
        options: ["Spring", "Summer", "Autumn", "Winter"]
    },
    {
        question: "Which type of movies do you prefer?",
        options: ["Comedy", "Action", "Drama", "Horror"]
    },
    {
        question: "What kind of music do you enjoy the most?",
        options: ["Rock", "Classical", "Electronic", "Pop"]
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