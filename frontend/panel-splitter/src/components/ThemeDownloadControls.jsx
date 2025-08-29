import React from 'react';

export const ThemeDownloadControls = () => {
  return (
    <div className="ps-row" style={{ gap: 16, margin: '8px 0 12px' }}>
      <div className="ps-row" style={{ gap: 8 }}>
        <span className="ps-section-title">DOWNLOAD THEME:</span>
        <select className="ps-select">
          <option>THEME 1</option>
          <option>THEME 2</option>
          <option>THEME 3</option>
          <option>THEME 4</option>
          <option>THEME 5</option>
          <option>THEME 6</option>
        </select>
        <button className="ps-button">DOWNLOAD THEME</button>
      </div>
      <button className="ps-button primary">DOWNLOAD ALL</button>
    </div>
  );
};


