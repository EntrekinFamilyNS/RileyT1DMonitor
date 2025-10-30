import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus, Droplet, Syringe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Scatter } from 'recharts';

export default function OmnipodDashboard() {
  const [currentBG, setCurrentBG] = useState(142);
  const [trend, setTrend] = useState('stable');
  const [iob, setIOB] = useState(2.3);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [bgData, setBgData] = useState([]);
  const [bolusEvents, setBolusEvents] = useState([]);

  // Simulate data updates every 5 minutes
  useEffect(() => {
    generateInitialData();
    const interval = setInterval(() => {
      updateData();
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const generateInitialData = () => {
    const now = new Date();
    const data = [];
    const boluses = [];
    
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now - i * 300000); // 5 min intervals
      const bg = 100 + Math.random() * 100 + Math.sin(i / 3) * 30;
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        glucose: Math.round(bg),
        timestamp: time.getTime()
      });
      
      // Add some meal boluses
      if (i === 18 || i === 10 || i === 4) {
        boluses.push({
          time: time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          amount: (Math.random() * 4 + 2).toFixed(1),
          timestamp: time.getTime(),
          glucose: Math.round(bg)
        });
      }
    }
    
    setBgData(data);
    setBolusEvents(boluses);
    setCurrentBG(data[data.length - 1].glucose);
  };

  const updateData = () => {
    setLastUpdate(new Date());
    const newBG = 100 + Math.random() * 80;
    setCurrentBG(Math.round(newBG));
    
    const trends = ['rising', 'falling', 'stable'];
    setTrend(trends[Math.floor(Math.random() * trends.length)]);
    
    setIOB((Math.random() * 3).toFixed(1));
  };

  const getTrendIcon = () => {
    switch(trend) {
      case 'rising': return <TrendingUp className="w-8 h-8 text-orange-500" />;
      case 'falling': return <TrendingDown className="w-8 h-8 text-blue-500" />;
      default: return <Minus className="w-8 h-8 text-gray-500" />;
    }
  };

  const getBGColor = () => {
    if (currentBG < 70) return 'text-red-600';
    if (currentBG > 180) return 'text-orange-600';
    return 'text-green-600';
  };

  const getBGStatus = () => {
    if (currentBG < 70) return 'LOW';
    if (currentBG > 180) return 'HIGH';
    return 'IN RANGE';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Activity className="w-8 h-8 text-indigo-600" />
              Omnipod 5 Monitor
            </h1>
            <div className="text-sm text-gray-500">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>

          {/* Current Readings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Blood Glucose */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border-2 border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-indigo-700 uppercase">Blood Glucose</span>
                {getTrendIcon()}
              </div>
              <div className={`text-5xl font-bold ${getBGColor()} mb-1`}>
                {currentBG}
              </div>
              <div className="text-sm text-gray-600">mg/dL - {getBGStatus()}</div>
            </div>

            {/* Insulin on Board */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-purple-700 uppercase">Insulin on Board</span>
                <Droplet className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-5xl font-bold text-purple-700 mb-1">
                {iob}
              </div>
              <div className="text-sm text-gray-600">units active</div>
            </div>

            {/* Recent Boluses */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border-2 border-pink-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-pink-700 uppercase">Last Bolus</span>
                <Syringe className="w-8 h-8 text-pink-600" />
              </div>
              <div className="text-5xl font-bold text-pink-700 mb-1">
                {bolusEvents.length > 0 ? bolusEvents[bolusEvents.length - 1].amount : '0'}
              </div>
              <div className="text-sm text-gray-600">
                {bolusEvents.length > 0 ? bolusEvents[bolusEvents.length - 1].time : 'No recent bolus'}
              </div>
            </div>
          </div>

          {/* Graph */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">24-Hour Glucose Trend</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={bgData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  domain={[0, 300]}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Low', fill: '#ef4444', fontSize: 12 }} />
                <ReferenceLine y={180} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'High', fill: '#f97316', fontSize: 12 }} />
                <Line 
                  type="monotone" 
                  dataKey="glucose" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Scatter 
                  data={bolusEvents} 
                  dataKey="glucose"
                  fill="#ec4899"
                  shape={(props) => {
                    const { cx, cy } = props;
                    return (
                      <g>
                        <circle cx={cx} cy={cy} r={8} fill="#ec4899" />
                        <text x={cx} y={cy - 15} textAnchor="middle" fill="#ec4899" fontSize="12" fontWeight="bold">
                          💉
                        </text>
                      </g>
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                <span>Glucose Level</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💉</span>
                <span>Meal Bolus</span>
              </div>
            </div>
          </div>

          {/* Bolus History */}
          <div className="mt-6 bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Bolus Events</h2>
            <div className="space-y-2">
              {bolusEvents.slice().reverse().map((bolus, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-pink-50 rounded-lg border border-pink-200">
                  <div className="flex items-center gap-3">
                    <Syringe className="w-5 h-5 text-pink-600" />
                    <span className="font-semibold text-gray-800">{bolus.amount} units</span>
                  </div>
                  <span className="text-sm text-gray-600">{bolus.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3">📱 Next Steps to Connect Your Data</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Deploy the backend API (instructions coming next)</li>
            <li>Create an iOS Shortcut to send data from Apple Health</li>
            <li>Set up automation to run every 5 minutes</li>
            <li>Replace the demo data with your real endpoint</li>
          </ol>
        </div>
      </div>
    </div>
  );
}