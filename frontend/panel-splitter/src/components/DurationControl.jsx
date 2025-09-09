import React, { useState, useEffect } from 'react';
import { PORT } from '../constants/port.js';

export const DurationControl = () => {
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [duration, setDuration] = useState(10);
  const [hasExistingCells, setHasExistingCells] = useState(false);

  useEffect(() => {
    const fetchDurationConfig = async () => {
      try {
        const response = await fetch(`http://localhost:${PORT}/api/duration` || 'https://panel-splitter-1.onrender.com/api/duration');
        if (response.ok) {
          const config = await response.json();
          setStartTime(config.startTime);
          setEndTime(config.endTime);
          setDuration(config.duration);
        }
      } catch (error) {
        console.error('Error fetching duration config:', error);
      }
    };

    const fetchPanelDuration = async () => {
      try {
        const response = await fetch(`http://localhost:${PORT}/api/panels` || 'https://panel-splitter-1.onrender.com/api/panels');
        if (response.ok) {
          const panelsData = await response.json();
          if (panelsData && panelsData.length > 0) {
            setDuration(panelsData[0].duration);
            setHasExistingCells(true);
          } else {
            setHasExistingCells(false);
          }
        }
      } catch (error) {
        console.error('Error fetching panels:', error);
      }
    };

    fetchDurationConfig();
    fetchPanelDuration();

    // Listen for panel changes to update the disabled state
    const handlePanelUpdate = () => {
      fetchPanelDuration();
    };

    window.addEventListener('panelTableUpdated', handlePanelUpdate);

    return () => {
      window.removeEventListener('panelTableUpdated', handlePanelUpdate);
    };
  }, []);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:${PORT}/api/duration` || 'https://panel-splitter-1.onrender.com/api/duration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startTime, endTime, duration })
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
        disabled={hasExistingCells}
      />
      
      <span className="ps-section-title">End Time:</span>
      <input 
        type="time" 
        className="ps-input" 
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        disabled={hasExistingCells}
      />
      
      <span className="ps-section-title">Duration per Idea Pitch:</span>
      <input 
        className="ps-input" 
        style={{ width: 64 }} 
        type="number"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        disabled={hasExistingCells}
      />
      <span className="ps-section-title">minutes</span>
      
      <button 
        className="ps-button primary" 
        onClick={handleSubmit}
        disabled={hasExistingCells}
        style={{
          opacity: hasExistingCells ? 0.5 : 1,
          cursor: hasExistingCells ? 'not-allowed' : 'pointer'
        }}
        title={hasExistingCells ? 'Clear panel table to change schedule' : 'Set Schedule'}
      >
        Set Schedule
      </button>
      
      {hasExistingCells && (
        <span style={{ fontSize: '11px', color: 'var(--error)', marginLeft: '8px' }}>
          Clear panel table to modify schedule
        </span>
      )}
    </div>
  );
};


