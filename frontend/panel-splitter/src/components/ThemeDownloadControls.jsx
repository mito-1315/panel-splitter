import React from 'react';
import { themeNames } from '../constants/themes';

export const ThemeDownloadControls = () => {
  return (
    <div className="ps-row" style={{ gap: 16, margin: '8px 0 12px' }}>
      <div className="ps-row" style={{ gap: 8 }}>
        <span className="ps-section-title">DOWNLOAD THEME:</span>
        <select className="ps-select">
          {themeNames.map((name, idx) => (
            <option key={idx}>{name}</option>
          ))}
        </select>
        <button className="ps-button">DOWNLOAD THEME</button>
      </div>
      <button className="ps-button primary">DOWNLOAD ALL</button>
    </div>
  );
};


