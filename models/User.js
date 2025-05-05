const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    answer: { type: String, required: true }
  }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
