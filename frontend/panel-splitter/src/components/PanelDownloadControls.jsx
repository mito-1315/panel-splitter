import React, { useState, useEffect } from 'react';

export const PanelDownloadControls = ({ numPanels: initialNumPanels = 4 }) => {
  const [numPanels, setNumPanels] = useState(initialNumPanels);

  useEffect(() => {
    const handleNumPanelsChange = (event) => {
      setNumPanels(event.detail.numPanels);
    };

    window.addEventListener('numPanelsChanged', handleNumPanelsChange);

    return () => {
      window.removeEventListener('numPanelsChanged', handleNumPanelsChange);
    };
  }, []);

  return (
    <div className="ps-row" style={{ gap: 8, marginTop: 12 }}>
      <span className="ps-section-title">DOWNLOAD PANEL:</span>
      <select className="ps-select">
        {Array.from({ length: numPanels }, (_, i) => (
          <option key={i}>PANEL {i + 1}</option>
        ))}
      </select>
      <button className="ps-button">DOWNLOAD PANEL</button>
      <button className="ps-button primary">DOWNLOAD ALL</button>
    </div>
  );
};


