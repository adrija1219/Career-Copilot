const mongoose = require('mongoose');

const JobSessionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  tabsAnalyzed: [{ url: String, content: String }],
  analysisResult: {
    matchScore: Number,
    missingSkills: [String],
    roadmap: [String]
  }
});

module.exports = mongoose.model('JobSession', JobSessionSchema);