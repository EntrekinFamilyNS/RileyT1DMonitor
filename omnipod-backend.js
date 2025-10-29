// server.js - Simple Express backend for Omnipod data
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory storage (for demo - use a database for production)
let latestData = {
  glucose: null,
  trend: 'stable',
  iob: null,
  timestamp: null,
  history: [],
  boluses: []
};

// Endpoint to receive data from iOS Shortcut
app.post('/api/data', (req, res) => {
  const { glucose, trend, iob, bolus } = req.body;
  
  const timestamp = new Date();
  
  // Update current readings
  if (glucose !== undefined) latestData.glucose = glucose;
  if (trend !== undefined) latestData.trend = trend;
  if (iob !== undefined) latestData.iob = iob;
  latestData.timestamp = timestamp;
  
  // Add to history (keep last 288 readings = 24 hours at 5 min intervals)
  latestData.history.push({
    glucose: glucose,
    timestamp: timestamp.getTime(),
    time: timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  });
  
  if (latestData.history.length > 288) {
    latestData.history.shift();
  }
  
  // Track bolus events
  if (bolus && bolus.amount > 0) {
    latestData.boluses.push({
      amount: bolus.amount,
      timestamp: timestamp.getTime(),
      time: timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      glucose: glucose
    });
    
    // Keep last 20 boluses
    if (latestData.boluses.length > 20) {
      latestData.boluses.shift();
    }
  }
  
  console.log('Data received:', { glucose, trend, iob, bolus, timestamp });
  res.json({ success: true, timestamp });
});

// Endpoint for dashboard to fetch data
app.get('/api/data', (req, res) => {
  res.json(latestData);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', lastUpdate: latestData.timestamp });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});