import React from 'react';

const headers = ['THEME 1','THEME 2','THEME 3','THEME 4','THEME 5','THEME 6'];

export const ThemeGrid = () => {
  return (
    <div className="ps-card" style={{ marginBottom: 12 }}>
      <div className="ps-grid">
        {headers.map((h) => (
          <div key={h} className="cell">
            <div style={{ padding: 6, borderBottom: '1px solid var(--border)' }}>{h}</div>
          </div>
        ))}
      </div>
    </div>
  );
};


