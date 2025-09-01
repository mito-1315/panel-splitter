import React from 'react';
import { themeNames } from '../constants/themes';

export const ThemeGrid = () => {
  const [active, setActive] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [sheet, setSheet] = React.useState({ header: [], rows: [] });
  const fileRef = React.useRef(null);
  const headers = React.useMemo(() => themeNames.map((name, idx) => name || `THEME ${idx + 1}`), []);

  // Simple 10x6 sheet to mimic an excel-like grid
  const defaultRows = 12; // excluding header row
  const defaultCols = 6;

  const csvToMatrix = (text) => {
    if (!text) return { header: [], rows: [] };
    const lines = text.split(/\r?\n/);
    const out = [];
    for (const line of lines) {
      if (line.trim() === '') continue;
      const row = [];
      let cur = '';
      let q = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (q) {
          if (ch === '"') {
            if (line[i + 1] === '"') { cur += '"'; i++; }
            else { q = false; }
          } else { cur += ch; }
        } else {
          if (ch === ',') { row.push(cur); cur = ''; }
          else if (ch === '"') { q = true; }
          else { cur += ch; }
        }
      }
      row.push(cur);
      out.push(row);
    }
    if (out.length === 0) return { header: [], rows: [] };
    return { header: out[0], rows: out.slice(1) };
  };

  const fetchThemeCsv = async (themeIdx) => {
    const themeName = headers[themeIdx];
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:5000/api/themes/${encodeURIComponent(themeName)}` || `https://panel-splitter-1.onrender.com/api/themes/${encodeURIComponent(themeName)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Convert data to { header, rows } if needed
      let matrix;
      if (json.converted) {
        matrix = json.converted;
      } else if (Array.isArray(json.data) && json.data.length > 0) {
        const header = Object.keys(json.data[0]);
        const rows = json.data.map(row => header.map(h => row[h]));
        matrix = { header, rows };
      } else {
        matrix = { header: [], rows: [] };
      }
      setSheet(matrix);
    } catch (e) {
      setError('Failed to load CSV from backend. You can upload a CSV below.');
      setSheet({ header: [], rows: [] });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchThemeCsv(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const containerStyle = {
    marginBottom: 12,
    border: '1px solid var(--border)',
    borderRadius: 8,
    overflow: 'hidden',
    background: 'var(--panel)'
  };

  const tabsStyle = {
    display: 'flex',
    gap: 8,
    padding: 8,
    borderBottom: '1px solid var(--border)',
    background: '#111216',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    overflowX: 'auto',
    whiteSpace: 'nowrap'
  };

  const buttonStyle = (isActive) => ({
    padding: '8px 12px',
    borderRadius: 6,
    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
    color: isActive ? 'var(--accent)' : 'var(--text)',
    background: 'transparent',
    cursor: 'pointer',
    flex: '0 0 auto'
  });

  const sheetWrapper = {
    height: 360,
    overflow: 'auto', // enables both horizontal and vertical scrolling
    background: 'var(--panel)'
  };

  const tableStyle = {
    width: 'max-content', // expands to content width for horizontal scroll
    borderCollapse: 'collapse'
  };

  const thtd = {
    border: '1px solid var(--border)',
    padding: '6px 8px',
    textAlign: 'left',
    minWidth: 140,
    height: 28
  };

  const colCount = sheet.header.length > 0 ? sheet.header.length : defaultCols;
  const rowCount = sheet.rows.length > 0 ? sheet.rows.length : defaultRows;

  return (
    <div className="ps-card" style={containerStyle}>
      <div style={tabsStyle}>
        {headers.map((h, idx) => (
          <button key={h} onClick={() => setActive(idx)} style={buttonStyle(idx === active)}>
            {h}
          </button>
        ))}
      </div>
      <div className="ps-row" style={{ gap: 8, padding: 8, borderBottom: '1px solid var(--border)' }}>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: 'none' }}
          onChange={async (e) => {
            const f = e.target.files && e.target.files[0];
            if (!f) return;
            try {
              const text = await f.text();
              const matrix = csvToMatrix(text);
              setSheet(matrix);
              setError('');
            } catch (err) {
              setError('Failed to read CSV file');
            }
          }}
        />
        <button className="ps-button" onClick={() => fileRef.current && (fileRef.current.value = '', fileRef.current.click())}>
          UPLOAD CSV
        </button>
        <span className="ps-section-title">or auto-fetch from backend on tab change</span>
      </div>
      <div style={sheetWrapper}>
        {loading && <div style={{ padding: 8, color: 'var(--muted)' }}>Loading…</div>}
        {!loading && error && <div style={{ padding: 8, color: '#ff6b6b' }}>{error}</div>}
        <table style={tableStyle}>
          <thead>
            <tr>
              {sheet.header.length > 0
                ? sheet.header.map((name, c) => (
                    <th key={`h-${c}`} style={thtd}>{name || `Col ${c + 1}`}</th>
                  ))
                : Array.from({ length: colCount }).map((_, c) => (
                    <th key={`h-${c}`} style={thtd}>{`Col ${c + 1}`}</th>
                  ))}
            </tr>
          </thead>
          <tbody>
            {sheet.rows.length > 0
              ? sheet.rows.map((cells, r) => (
                  <tr key={`r-${r}`}>
                    {Array.from({ length: colCount }).map((_, c) => (
                      <td key={`c-${r}-${c}`} style={thtd}>{cells[c] ?? ''}</td>
                    ))}
                  </tr>
                ))
              : Array.from({ length: rowCount }).map((_, r) => (
                  <tr key={`r-${r}`}>
                    {Array.from({ length: colCount }).map((_, c) => (
                      <td key={`c-${r}-${c}`} style={thtd}></td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


