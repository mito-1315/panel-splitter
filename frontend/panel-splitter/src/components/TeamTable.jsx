import React from 'react';

export const TeamTable = () => {
  return (
    <div className="ps-card">
      <div className="ps-section-title">TEAM TABLE</div>
      <table className="ps-table">
        <thead>
          <tr>
            <th>THEME 1</th>
            <th>THEME 2</th>
            <th>THEME 3</th>
            <th>THEME 4</th>
            <th>THEME 5</th>
            <th>THEME 6</th>
          </tr>
        </thead>
        <tbody>
          {[0,1,2,3,4].map((r) => (
            <tr key={r}>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


