const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let latestData = {
  glucose: null,
  trend: 'stable',
  iob: null,
  timestamp: null,
  history: [],
  boluses: []
};

app.post('/api/data', (req, res) => {
  const { glucose, trend, iob, bolus } = req.body;
  const timestamp = new Date();
  
  if (glucose !== undefined) latestData.glucose = glucose;
  if (trend !== undefined) latestData.trend = trend;
  if (iob !== undefined) latestData.iob = iob;
  latestData.timestamp = timestamp;
  
  latestData.history.push({
    glucose: glucose,
    timestamp: timestamp.getTime(),
    time: timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  });
  
  if (latestData.history.length > 288) latestData.history.shift();
  
  if (bolus && bolus.amount > 0) {
    latestData.boluses.push({
      amount: bolus.amount,
      timestamp: timestamp.getTime(),
      time: timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      glucose: glucose
    });
    if (latestData.boluses.length > 20) latestData.boluses.shift();
  }
  
  res.json({ success: true, timestamp });
});

app.get('/api/data', (req, res) => {
  res.json(latestData);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', lastUpdate: latestData.timestamp });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
