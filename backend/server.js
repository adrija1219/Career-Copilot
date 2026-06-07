require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
// FIX: Import the official Mistral SDK client
const { Mistral } = require('@mistralai/mistralai');

const app = express();

// Enable CORS so React (localhost:3000) can call this server (localhost:5000)
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// ── Mistral client Initialization ───────────────────────────────────────────
// Reads automatically from process.env.MISTRAL_API_KEY
const mistralClient = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// ── MongoDB connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://adrija:greenify2026@cluster0.aqtpyc5.mongodb.net/greenify?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define the JobSession model 
const JobSessionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  analysisResult: {
    matchScore:    Number,
    missingSkills: [String],
    roadmap:       [String],
  },
});
const JobSession = mongoose.model('JobSession', JobSessionSchema);

// ── Routes ───────────────────────────────────────────────────────────────────

// GET /api/sessions — fetch all past analysis sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await JobSession.find().sort({ date: -1 });
    res.json(sessions);
  } catch (err) {
    console.error('GET /api/sessions error:', err);
    res.status(500).json({ error: 'Failed to fetch sessions.' });
  }
});

// POST /api/analyze-job — analyze tabs against resume with Mistral AI
app.post('/api/analyze-job', async (req, res) => {
  try {
    const { jobTabs, userResume } = req.body;

    if (!jobTabs || !userResume) {
      return res.status(400).json({ error: 'jobTabs and userResume are required.' });
    }

    if (!process.env.MISTRAL_API_KEY) {
      console.error("❌ Missing MISTRAL_API_KEY in backend environment configuration!");
      return res.status(500).json({ error: 'Mistral API key is missing on the server.' });
    }

    // Define the core instructional prompt expectations
    const systemPrompt = `You are a career coach AI. Analyze the provided job-related tab data against the candidate's resume.
    Evaluate the overall alignment, identify explicit gaps in tech stack or experience, and draft a structured upskilling path.
    
    You MUST respond with a valid JSON object matching this schema exactly:
    {
      "matchPercentage": 75,
      "missingSkills": ["skill1", "skill2"],
      "learningRoadmap": ["step1", "step2", "step3"]
    }`;

    const userPrompt = `RESUME CONTENT:\n${userResume}\n\nEXTRACTED JOB TABS DATA:\n${JSON.stringify(jobTabs)}`;

    console.log("📡 Submitting context data payload to Mistral AI...");

    // Execute completion call using mistral-large-latest
    const response = await mistralClient.chat.complete({
      model: "mistral-large-latest", 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      // FORCES Mistral to respond back with clean, stringified JSON only
      responseFormat: { type: "json_object" }
    });

    const rawText = response.choices[0].message.content;
    console.log("🤖 Structured Output Received from Mistral:", rawText);

    // Safely parse the direct structural object string
    const analysis = JSON.parse(rawText);

    // Persist session documentation metrics directly to MongoDB
    await JobSession.create({
      analysisResult: {
        matchScore:    analysis.matchPercentage,
        missingSkills: analysis.missingSkills,
        roadmap:       analysis.learningRoadmap,
      },
    });

    // Send original parsed object back to matching frontend expectations
    res.json(analysis);

  } catch (err) {
    console.error('POST /api/analyze-job pipeline failure:', err);
    res.status(500).json({ error: 'Analysis execution failed. Check your Mistral configuration and logs.' });
  }
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));