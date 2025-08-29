import React from 'react';

export const PanelDownloadControls = () => {
  return (
    <div className="ps-row" style={{ gap: 8, marginTop: 12 }}>
      <span className="ps-section-title">DOWNLOAD PANEL:</span>
      <select className="ps-select">
        <option>PANEL 1</option>
        <option>PANEL 2</option>
        <option>PANEL 3</option>
        <option>PANEL 4</option>
      </select>
      <button className="ps-button">DOWNLOAD PANEL</button>
      <button className="ps-button primary">DOWNLOAD ALL</button>
    </div>
  );
};


