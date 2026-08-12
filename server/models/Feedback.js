const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  service: { type: String, required: true },
  rating: { type: Number, required: true },
  feedback: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
