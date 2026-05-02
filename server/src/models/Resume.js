const mongoose = require('mongoose');

const bulletSchema = new mongoose.Schema({
  text: String,
}, { _id: false, strict: false });

const experienceSchema = new mongoose.Schema({
  company: String,
  title: String,
  location: String,
  duration: String,
  bullets: [bulletSchema],
}, { _id: false });

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  field: String,
  year: String,
}, { _id: false });

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: String,
  originalText: String,
  parsed: { type: mongoose.Schema.Types.Mixed, default: {} },
  tailoredVersions: [{
    jobTitle: String,
    companyType: String,
    jobDescription: String,
    tailored: mongoose.Schema.Types.Mixed,
    keywordsMatched: [String],
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
