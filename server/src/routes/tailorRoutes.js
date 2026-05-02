const express = require('express');
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');
const { tailorResume } = require('../services/aiService');
const { scrapeJD } = require('../services/jdScraper');

const router = express.Router();

router.post('/', auth, async (req, res, next) => {
  try {
    const { resumeId, jobDescriptionUrl, jobDescriptionText, companyType = 'tech startup' } = req.body;

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    let jobDescription = jobDescriptionText;
    if (!jobDescription && jobDescriptionUrl) {
      jobDescription = await scrapeJD(jobDescriptionUrl);
    }
    if (!jobDescription) return res.status(400).json({ message: 'Provide jobDescriptionText or jobDescriptionUrl' });

    const { tailored, keywordsMatched, analysis } = await tailorResume({
      parsedResume: resume.parsed,
      jobDescription,
      companyType,
    });

    resume.tailoredVersions.push({
      jobTitle: tailored.experience?.[0]?.title || 'Tailored',
      companyType,
      jobDescription: jobDescription.slice(0, 500),
      tailored,
      keywordsMatched,
      analysis,
    });
    resume.markModified('tailoredVersions');
    await resume.save();

    res.json({
      original: resume.parsed,
      tailored: { ...tailored, photo: resume.parsed.photo },
      keywordsMatched,
      analysis,
      versionId: resume.tailoredVersions.at(-1)._id,
    });
  } catch (err) {
    next(err);
  }
});

// Re-tailor using an edited/custom resume as the base
router.post('/retailor', auth, async (req, res, next) => {
  try {
    const { resumeId, baseResume, jobDescriptionText, companyType = 'tech startup' } = req.body;

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    if (!jobDescriptionText) return res.status(400).json({ message: 'jobDescriptionText is required' });
    if (!baseResume) return res.status(400).json({ message: 'baseResume is required' });

    const { tailored, keywordsMatched, analysis } = await tailorResume({
      parsedResume: baseResume,
      jobDescription: jobDescriptionText,
      companyType,
    });

    resume.tailoredVersions.push({
      jobTitle: tailored.experience?.[0]?.title || 'Re-Tailored',
      companyType,
      jobDescription: jobDescriptionText.slice(0, 500),
      tailored,
      keywordsMatched,
      analysis,
    });
    resume.markModified('tailoredVersions');
    await resume.save();

    res.json({
      original: baseResume,
      tailored: { ...tailored, photo: resume.parsed.photo },
      keywordsMatched,
      analysis,
      versionId: resume.tailoredVersions.at(-1)._id,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
