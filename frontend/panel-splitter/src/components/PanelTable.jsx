import React from 'react';

const hours = ['8.00','8.10','8.20','8.30','8.40'];

export const PanelTable = () => {
  return (
    <div className="ps-card">
      <div className="ps-section-title">PANEL TABLE</div>
      <table className="ps-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}>+</th>
            <th>PANEL 1</th>
            <th>PANEL 2</th>
            <th>PANEL 3</th>
            <th>PANEL 4</th>
          </tr>
        </thead>
        <tbody>
          {hours.map(h => (
            <tr key={h}>
              <td>{h}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ps-row" style={{ gap: 8, marginTop: 8 }}>
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
    </div>
  );
};


