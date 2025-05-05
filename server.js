// server.js
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const Question = require('./models/Question');
const qrcode = require('qrcode');
const cors = require('cors');

const app = express();

// Middleware to parse JSON and handle CORS
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb+srv://CiaLabs:Craniax101@cialabs.xrd42go.mongodb.net/cia-db?retryWrites=true&w=majority')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Helper function to shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Route to register a user with their answers
app.post('/api/register', async (req, res) => {
  const { email, answers } = req.body;
  console.log('Register route hit');

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      email,
      answers,
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to generate QR code
app.post('/api/generate-qr', async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId).populate('answers.question');
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const timestamp = Date.now();
    
    // Shuffle the questions and their options
    const shuffledQuestions = shuffleArray(user.answers.map(answer => ({
      question: answer.question.question,
      options: shuffleArray([...answer.question.options]), // Shuffle options too
      questionId: answer.question._id.toString() // Add question ID for answer checking
    })));

    const qrData = {
      questions: shuffledQuestions,
      userId: userId,
      timestamp: timestamp,
      expiresAt: timestamp + 30000 // 30 seconds from now
    };

    const qrCode = await qrcode.toDataURL(JSON.stringify(qrData));
    res.json({ 
      qrCode, 
      expiresAt: qrData.expiresAt,
      timeLeft: 30000 // Time left in milliseconds
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating QR code' });
  }
});

// Endpoint to check answers
app.post('/api/check-answers', async (req, res) => {
  const { userId, answers, timestamp, questionIds } = req.body;

  try {
    // Check if QR code is expired
    const currentTime = Date.now();
    if (currentTime - timestamp > 30000) {
      return res.status(400).json({ 
        message: 'QR code has expired. Please generate a new one.',
        expired: true
      });
    }

    const user = await User.findById(userId).populate('answers.question');
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Create a map of question IDs to correct answers
    const correctAnswersMap = {};
    user.answers.forEach(answer => {
      correctAnswersMap[answer.question._id.toString()] = answer.answer;
    });

    let score = 0;
    const results = answers.map((userAnswer, index) => {
      const questionId = questionIds[index];
      const correctAnswer = correctAnswersMap[questionId];
      const isCorrect = userAnswer === correctAnswer;
      if (isCorrect) score++;
      return {
        question: user.answers.find(a => a.question._id.toString() === questionId).question.question,
        userAnswer,
        correctAnswer,
        isCorrect
      };
    });

    res.json({
      score,
      totalQuestions: answers.length,
      percentage: (score / answers.length) * 100,
      results,
      timeLeft: Math.max(0, 30000 - (currentTime - timestamp))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking answers' });
  }
});

// Route to get all questions
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find({});
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
