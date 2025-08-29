import React from 'react';

export const UploadSection = () => {
  return (
    <div className="ps-card" style={{ marginBottom: 12 }}>
      <div className="ps-row" style={{ justifyContent: 'space-between' }}>
        <span className="ps-section-title">LOAD TEAMS DATA (csv)</span>
        <div className="ps-row" style={{ gap: 8 }}>
          <button className="ps-button">UPLOAD</button>
          <span style={{ color: '#7bd88f' }}>✓</span>
        </div>
      </div>
    </div>
  );
};


