import React, { useState, useEffect } from 'react';
import { themeNames } from '../constants/themes';

export const TeamTable = () => {
  const [teamTable, setTeamTable] = useState(
    Array.from({ length: 20 }, () => Array(14).fill(null))
  );
  const [loading, setLoading] = useState(true);
  const [usedTeams, setUsedTeams] = useState([]);

  useEffect(() => {
    const fetchTeamData = async () => {
      const newTable = Array.from({ length: 20 }, () => Array(14).fill(null));
      
      for (let themeIndex = 0; themeIndex < themeNames.length; themeIndex++) {
        const themeName = themeNames[themeIndex];
        try {
          const response = await fetch(`http://localhost:5000/api/team/${encodeURIComponent(themeName)}`);
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              // Populate teams from API response
              if (data.teams) {
                data.teams.forEach((team, teamIndex) => {
                  if (teamIndex < 20) {
                    newTable[teamIndex][themeIndex] = team;
                  }
                });
              }
            } else {
              console.error(`Invalid response type for theme: ${themeName}`);
            }
          } else {
            console.error(`Failed to fetch teams for theme: ${themeName}, Status: ${response.status}`);
          }
        } catch (error) {
          console.error(`Error fetching teams for theme ${themeName}:`, error);
        }
      }
      
      setTeamTable(newTable);
      setLoading(false);
    };

    fetchTeamData();

    // Load used teams from localStorage
    const loadUsedTeams = () => {
      const used = JSON.parse(localStorage.getItem('usedTeams') || '[]');
      setUsedTeams(used);
    };

    loadUsedTeams();

    // Listen for custom events when teams are used/removed
    const handleTeamUsed = (e) => {
      setUsedTeams(prev => [...prev, e.detail.uniqueId]);
    };

    const handleTeamRemoved = (e) => {
      setUsedTeams(prev => prev.filter(id => id !== e.detail.uniqueId));
    };

    window.addEventListener('teamUsed', handleTeamUsed);
    window.addEventListener('teamRemoved', handleTeamRemoved);

    return () => {
      window.removeEventListener('teamUsed', handleTeamUsed);
      window.removeEventListener('teamRemoved', handleTeamRemoved);
    };
  }, []);

  const handleDragStart = (e, row, col) => {
    const cell = teamTable[row][col];
    if (!cell || usedTeams.includes(cell.uniqueId)) {
      e.preventDefault();
      return;
    }
    
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'team',
      row,
      col,
      content: cell
    }));
  };

  if (loading) {
    return (
      <div className="ps-card" style={{ width: '50vw', height: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div className="ps-section-title" style={{ flexShrink: 0 }}>TEAM TABLE</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          Loading teams...
        </div>
      </div>
    );
  }

  return (
    <div className="ps-card" style={{ width: '50vw', height: '80vh', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <div className="ps-section-title" style={{ flexShrink: 0 }}>TEAM TABLE</div>
      <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
        <table className="ps-table" style={{ tableLayout: 'fixed', minWidth: '2100px' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
            <tr>
              {themeNames.map((theme, index) => (
                <th key={index} style={{ width: '150px', height: '50px' }}>{theme}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamTable.map((rowData, r) => (
              <tr key={r}>
                {rowData.map((cell, i) => {
                  const isUsed = cell && usedTeams.includes(cell.uniqueId);
                  return (
                    <td
                      key={i}
                      style={{ 
                        width: '150px', 
                        height: '50px', 
                        fontSize: '12px', 
                        padding: '4px',
                        opacity: isUsed ? 0.5 : 1,
                        cursor: isUsed ? 'not-allowed' : (cell ? 'grab' : 'default')
                      }}
                      draggable={!!cell && !isUsed}
                      onDragStart={(e) => handleDragStart(e, r, i)}
                    >
                      {cell ? (
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{cell.teamName}</div>
                          <div style={{ fontSize: '10px', color: '#666' }}>{cell.uniqueId}</div>
                          {isUsed && (
                            <div style={{ fontSize: '8px', color: 'red', fontStyle: 'italic' }}>In Use</div>
                          )}
                        </div>
                      ) : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


