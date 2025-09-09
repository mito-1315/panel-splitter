import React, { useRef, useState } from 'react';
import { PORT } from '../constants/port.js';

export const UploadSection = () => {
  const inputRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | success | error
  const [fileName, setFileName] = useState('');

  const openPicker = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.click();
    }
  };

  const validateCsv = (text) => {
    if (!text) return false;
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return false;
    // Basic heuristic: CSV should have at least one comma in header
    return lines[0].includes(',');
  };

  const onFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await file.text();
      const ok = validateCsv(text);
      
      if (ok) {
        // Create a FormData object to send the file to the backend
        const formData = new FormData();
        formData.append('file', file);
        
        // Make a POST request to the backend at port 5000
        const response = await fetch(`http://localhost:${PORT}/upload` || 'https://panel-splitter-1.onrender.com/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setStatus('error');
    }
  };

  return (
    <div className="ps-card" style={{ marginBottom: 12 }}>
      <div className="ps-row" style={{ justifyContent: 'space-between' }}>
        <span className="ps-section-title">LOAD TEAMS DATA (csv)</span>
        <div className="ps-row" style={{ gap: 8 }}>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={onFileChange}
            style={{ display: 'none' }}
          />
          <button className="ps-button" onClick={openPicker}>UPLOAD</button>
          {status === 'success' && <span title={fileName} style={{ color: '#7bd88f' }}>✓</span>}
          {status === 'error' && <span title={fileName} style={{ color: '#ff6b6b' }}>✕</span>}
        </div>
      </div>
    </div>
  );
};


