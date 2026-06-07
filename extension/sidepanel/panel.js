
// panel.js — Career Copilot Side Panel Logic

document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const status      = document.getElementById('status');       
  const loader      = document.getElementById('loader');
  const btn         = document.getElementById('analyzeBtn');
  const resultCard  = document.getElementById('resultCard');
  const matchScore  = document.getElementById('matchScore');
  const results     = document.getElementById('results');      
  const roadmap     = document.getElementById('roadmapShort');
  
  // FIX: Dynamically read from your new resume input text area box
  const resumeInput = document.getElementById('resumeText');
  const userResumeText = resumeInput ? resumeInput.value.trim() : "";

  // 1. Client-side Input Validation
  if (!userResumeText) {
    alert("Please paste your resume or type your technical skills into the text box first!");
    return;
  }

  // 2. Wipe clean old state completely to prevent stale data display loops
  btn.disabled          = true;
  status.innerText      = 'Aggregating tabs…';
  loader.style.display  = 'block';
  resultCard.style.display = 'none';
  
  // Reset inner container text/elements
  matchScore.textContent = '--%';
  results.innerHTML      = '';
  roadmap.innerHTML      = '';

  try {
    // 3. Ask background.js to scrape all open tabs in active window
    console.log("Requesting background worker to parse tab data payloads...");
    const response = await chrome.runtime.sendMessage({ type: 'START_AGGREGATION' });
    const tabsData = response?.data ?? [];

    if (tabsData.length === 0) {
      throw new Error("No active web tab content could be collected. Open a real page and try again.");
    }

    status.innerText = 'Sending to Mistral AI backend…';
    console.log("Transmitting structured JSON array bundle to localhost server...");

    // 4. Send scraped tab content + dynamic resume down to Express backend endpoint
    const res = await fetch('http://localhost:5000/api/analyze-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobTabs: tabsData,         // Matches your backend expectations
        userResume: userResumeText // Sends the actual dynamic text string!
      })
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    const data = await res.json();
    console.log("Server verification payload processed successfully:", data);

    // 5. Render fresh data streams directly to the layout elements
    matchScore.textContent = `${data.matchPercentage ?? '--'}%`;

    // Render Missing Skills Tags
    if (data.missingSkills && data.missingSkills.length > 0) {
      data.missingSkills.forEach(skill => {
        const tag = document.createElement('span');
        tag.className   = 'skill-tag';
        tag.textContent = skill;
        results.appendChild(tag);
      });
    } else {
      results.innerHTML = '<span style="color: #059669; font-size: 13px; font-weight: 500;">🎉 Perfect profile match!</span>';
    }

    // Render Learning Roadmap List Items
    if (data.learningRoadmap && data.learningRoadmap.length > 0) {
      data.learningRoadmap.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        roadmap.appendChild(li);
      });
    } else {
      roadmap.innerHTML = '<li>No learning steps required. Go apply right away!</li>';
    }

    // Unhide the result block container cleanly
    resultCard.style.display = 'block';
    status.innerText = '✅ Analysis complete!';

  } catch (err) {
    console.error('Career Copilot connection pipeline exception:', err);
    if (err.message.includes('fetch')) {
      status.innerText = '❌ Error: Backend server is not running on port 5000.';
    } else {
      status.innerText = `❌ Error: ${err.message}`;
    }
  } finally {
    loader.style.display  = 'none';
    btn.disabled          = false;
  }
});