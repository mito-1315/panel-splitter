import React, { useState } from 'react';
import { themeNames } from '../constants/themes';

export const ThemeDownloadControls = () => {
  const [selectedTheme, setSelectedTheme] = useState(themeNames[0]);

  const handleDownloadTheme = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/download/${encodeURIComponent(selectedTheme)}`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      console.log(blob)
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTheme}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download theme data');
    }
  };

  const handleDownloadAll = async () => {
    //console.log('Downloading all themes');
    
      //console.log('in')
      fetch('http://localhost:5000/api/download/all').then(res=>res.blob().then(blob=>{
        const url = window.URL.createObjectURL(blob);
        const link=document.createElement('a');
        link.href=url;
        link.download='all.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        link.remove();
        window.URL.revokeObjectURL(url);
      }).catch(err=>{
        alert(`Failed to download all themes data : ${err.message}`);
      }
      ));
      //if (!res.ok) throw new Error('Download failed');
      /*console.log(res)
      const blob = await res.blob();
      console.log(blob)
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);*/
  };

  return (
    <div className="ps-row" style={{ gap: 16, margin: '8px 0 12px' }}>
      <div className="ps-row" style={{ gap: 8 }}>
        <span className="ps-section-title">DOWNLOAD THEME:</span>
        <select
          className="ps-select"
          value={selectedTheme}
          onChange={e => setSelectedTheme(e.target.value)}
        >
          {themeNames.map((name, idx) => (
            <option key={idx} value={name}>{name}</option>
          ))}
        </select>
        <button className="ps-button" onClick={handleDownloadTheme}>DOWNLOAD THEME</button>
      </div>
      <button className="ps-button primary" onClick={handleDownloadAll}>DOWNLOAD ALL</button>
    </div>
  );
};


