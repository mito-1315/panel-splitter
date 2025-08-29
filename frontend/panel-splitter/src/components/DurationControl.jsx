import React from 'react';

export const DurationControl = () => {
  return (
    <div className="ps-row" style={{ alignItems: 'center', gap: 8, margin: '8px 0 12px' }}>
      <span className="ps-section-title">Duration per Idea Pitch :</span>
      <input className="ps-input" style={{ width: 64 }} defaultValue={10} />
      <span className="ps-section-title">minutes</span>
    </div>
  );
};


