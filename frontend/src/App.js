import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      const res = await axios.get('http://localhost:5000/api/sessions');
      setSessions(res.data);
      setLoading(false);
    };
    fetchSessions();
  }, []);

  return (
    <div className="dashboard" style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1>🚀 Career Copilot Dashboard</h1>
      
      {loading ? <p>Loading your career insights...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
          {sessions.map(session => (
            <div key={session._id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>Analysis Session</h3>
                <span style={scoreBadge(session.analysisResult.matchScore)}>
                  {session.analysisResult.matchScore}% Match
                </span>
              </div>

              <h4>Missing Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {session.analysisResult.missingSkills.map(skill => (
                  <span key={skill} style={skillTag}>{skill}</span>
                ))}
              </div>

              <h4>Learning Roadmap</h4>
              <ul style={{ paddingLeft: '20px' }}>
                {session.analysisResult.roadmap.map((step, i) => (
                  <li key={i} style={{ marginBottom: '8px' }}>{step}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Simple inline styles (Ideally use Tailwind)
const cardStyle = { background: '#fff', border: '1px solid #ddd', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const skillTag = { background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' };
const scoreBadge = (score) => ({
  background: score > 70 ? '#dcfce7' : '#fef9c3',
  color: score > 70 ? '#166534' : '#854d0e',
  padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold'
});

export default App;
