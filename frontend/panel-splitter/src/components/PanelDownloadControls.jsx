import React, { useState, useEffect } from 'react';
import { PORT } from '../constants/port.js';

export const PanelDownloadControls = ({ numPanels: initialNumPanels = 4 }) => {
  const [numPanels, setNumPanels] = useState(initialNumPanels);
  const [selectedPanel, setSelectedPanel] = useState(1);

  useEffect(() => {
    const handleNumPanelsChange = (event) => {
      setNumPanels(event.detail.numPanels);
    };

    window.addEventListener('numPanelsChanged', handleNumPanelsChange);

    return () => {
      window.removeEventListener('numPanelsChanged', handleNumPanelsChange);
    };
  }, []);

  const downloadPanel = async (panelNumber) => {
    try {
      const response = await fetch(`http://localhost:${PORT}/api/panel/download/${panelNumber}` || `https://panel-splitter-1.onrender.com/api/panel/download/${panelNumber}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `panel_${panelNumber}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to download panel:', response.status);
        alert('Failed to download panel. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading panel:', error);
      alert('Error downloading panel. Please check your connection.');
    }
  };

  const downloadAllPanels = async () => {
    try {
      const response = await fetch(`http://localhost:${PORT}/api/panel/download/all` || `https://panel-splitter-1.onrender.com/api/panel/download/all`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'all_panels.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to download all panels:', response.status);
        alert('Failed to download all panels. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading all panels:', error);
      alert('Error downloading all panels. Please check your connection.');
    }
  };

  const handlePanelSelect = (event) => {
    setSelectedPanel(parseInt(event.target.value));
  };

  const handleDownloadPanel = () => {
    downloadPanel(selectedPanel);
  };

  const handleDownloadAll = () => {
    downloadAllPanels();
  };

  return (
    <div className="ps-row" style={{ gap: 8, marginTop: 12 }}>
      <span className="ps-section-title">DOWNLOAD PANEL:</span>
      <select className="ps-select" onChange={handlePanelSelect} value={selectedPanel}>
        {Array.from({ length: numPanels }, (_, i) => (
          <option key={i + 1} value={i + 1}>PANEL {i + 1}</option>
        ))}
      </select>
      <button className="ps-button" onClick={handleDownloadPanel}>DOWNLOAD PANEL</button>
      <button className="ps-button primary" onClick={handleDownloadAll}>DOWNLOAD ALL</button>
    </div>
  );
};


