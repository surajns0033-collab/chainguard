import React, { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const generateData = () => Array.from({ length: 20 }, (_, i) => ({
  time: i,
  cpu: 30 + Math.random() * 40,
  net: 10 + Math.random() * 80
}));

export const SystemStats: React.FC = () => {
  const [data, setData] = useState(generateData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: prev[prev.length - 1].time + 1,
          cpu: 30 + Math.random() * 40,
          net: 10 + Math.random() * 80
        });
        return newData;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex-1 relative">
        <div className="absolute top-0 left-0 text-[10px] text-hud-text/50 z-10">CPU LOAD</div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <YAxis domain={[0, 100]} hide />
            <Line type="monotone" dataKey="cpu" stroke="#22d3ee" strokeWidth={1} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 relative">
        <div className="absolute top-0 left-0 text-[10px] text-hud-text/50 z-10">NET I/O</div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <YAxis domain={[0, 100]} hide />
            <Line type="step" dataKey="net" stroke="#67e8f9" strokeWidth={1} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs flex justify-between border-t border-hud-border pt-1 mt-1">
        <span>MEM: 42%</span>
        <span>SEC: NOMINAL</span>
        <span className="text-hud-success">UPLINK: OK</span>
      </div>
    </div>
  );
};
