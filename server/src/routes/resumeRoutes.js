const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../utils/upload');
const Resume = require('../models/Resume');
const { parsePDF } = require('../services/pdfParser');

const router = express.Router();

// Upload and parse resume
router.post('/upload', auth, upload.single('resume'), async (req, res, next) => {
  try {
    const { parsed, originalText } = await parsePDF(req.file.buffer);
    const resume = await Resume.create({
      userId: req.user.id,
      fileName: req.file.originalname,
      originalText,
      parsed,
    });
    res.status(201).json(resume);
  } catch (err) {
    next(err);
  }
});

// Get all resumes for user
router.get('/', auth, async (req, res) => {
  const resumes = await Resume.find({ userId: req.user.id }).select('-originalText');
  res.json(resumes);
});

// Get single resume
router.get('/:id', auth, async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
  if (!resume) return res.status(404).json({ message: 'Resume not found' });
  res.json(resume);
});

// Delete resume
router.delete('/:id', auth, async (req, res) => {
  await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ message: 'Deleted' });
});

// Update photo
router.patch('/:id/photo', auth, async (req, res, next) => {
  try {
    const { photo } = req.body;
    if (!photo) return res.status(400).json({ message: 'No photo provided' });
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    resume.parsed = { ...resume.parsed, photo };
    resume.markModified('parsed');
    await resume.save();
    res.json({ photo: resume.parsed.photo });
  } catch (err) { next(err); }
});

// Save edited tailored version
router.patch('/:id/version/:versionId', auth, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    const version = resume.tailoredVersions.id(req.params.versionId);
    if (!version) return res.status(404).json({ message: 'Version not found' });
    version.tailored = req.body.tailored;
    resume.markModified('tailoredVersions');
    await resume.save();
    res.json({ message: 'Saved', tailored: version.tailored });
  } catch (err) { next(err); }
});

module.exports = router;
