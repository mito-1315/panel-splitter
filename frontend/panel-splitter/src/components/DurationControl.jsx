import React, { useState } from 'react';

export const DurationControl = () => {
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [duration, setDuration] = useState(10);

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/duration' || 'https://panel-splitter-1.onrender.com/api/duration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime,
          endTime,
          duration
        })
      });
      
      if (response.ok) {
        // Dispatch event to update PanelTable
        window.dispatchEvent(new CustomEvent('durationUpdated'));
      } else {
        const errorData = await response.json();
        console.error('Failed to save duration configuration:', errorData.error);
      }
    } catch (error) {
      console.error('Error saving duration configuration:', error);
    }
  };

  return (
    <div className="ps-row" style={{ alignItems: 'center', gap: 8, margin: '8px 0 12px', flexWrap: 'wrap' }}>
      <span className="ps-section-title">Start Time:</span>
      <input 
        type="time" 
        className="ps-input" 
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />
      
      <span className="ps-section-title">End Time:</span>
      <input 
        type="time" 
        className="ps-input" 
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
      />
      
      <span className="ps-section-title">Duration per Idea Pitch:</span>
      <input 
        className="ps-input" 
        style={{ width: 64 }} 
        type="number"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
      />
      <span className="ps-section-title">minutes</span>
      
      <button className="ps-button primary" onClick={handleSubmit}>
        Set Schedule
      </button>
    </div>
  );
};


