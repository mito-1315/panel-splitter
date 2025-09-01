import React, { useState, useEffect } from 'react';
import { themeNames } from '../constants/themes';

export const TeamTable = () => {
  const [teamTable, setTeamTable] = useState(
    Array.from({ length: 20 }, () => Array(14).fill(null))
  );
  const [loading, setLoading] = useState(true);
  const [usedTeams, setUsedTeams] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedCells, setSelectedCells] = useState(new Set());

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

  const handleCellClick = (row, col) => {
    if (!selectMode || !teamTable[row][col]) return;
    
    const cellKey = `${row}-${col}`;
    const newSelectedCells = new Set(selectedCells);
    
    if (newSelectedCells.has(cellKey)) {
      newSelectedCells.delete(cellKey);
    } else {
      newSelectedCells.add(cellKey);
    }
    
    setSelectedCells(newSelectedCells);
  };

  const handleHandDragStart = (e) => {
    if (selectedCells.size === 0) return;
    
    const selectedTeams = Array.from(selectedCells).map(cellKey => {
      const [row, col] = cellKey.split('-').map(Number);
      return teamTable[row][col];
    }).filter(Boolean);
    
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'column',
      content: selectedTeams
    }));
  };

  const clearSelection = () => {
    setSelectedCells(new Set());
  };

  const totalCells = themeNames.length * 20; // Assuming 20 rows
  const inUseTeams = usedTeams.length;

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
    <div className="ps-card" style={{ 
      width: 'calc(50vw - 6px)', 
      height: '70vh', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div className="ps-section-title" style={{ flexShrink: 0 }}>TEAM TABLE</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className={`ps-button ${selectMode ? 'primary' : ''}`}
            onClick={() => {
              setSelectMode(!selectMode);
              if (selectMode) clearSelection();
            }}
            style={{ fontSize: '10px', padding: '4px 8px' }}
          >
            {selectMode ? 'Cancel' : 'Select'}
          </button>
          {selectMode && selectedCells.size > 0 && (
            <button
              className="ps-button"
              draggable
              onDragStart={handleHandDragStart}
              style={{ 
                fontSize: '10px', 
                padding: '4px 8px',
                cursor: 'grab',
                background: 'var(--accent)'
              }}
              title="Drag to create column"
            >
              ✋ Drag ({selectedCells.size})
            </button>
          )}
        </div>
      </div>
      <div className="stats-bar" style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        margin: '4px 0',
        fontSize: '11px',
        padding: '6px 12px'
      }}>
        <span>Total: <strong>{totalCells}</strong></span>
        <span>In Use: <strong>{inUseTeams}</strong></span>
        {selectMode && <span>Selected: <strong>{selectedCells.size}</strong></span>}
      </div>
      <div style={{ overflow: 'auto', flex: 1 }}>
        <table className="ps-table" style={{ 
          tableLayout: 'fixed', 
          minWidth: '2100px',
          borderCollapse: 'collapse'
        }}>
          <thead style={{ position: 'sticky', top: 0, background: 'var(--panel)', zIndex: 1 }}>
            <tr>
              {themeNames.map((theme, index) => (
                <th key={index} style={{ width: '150px', height: '50px' }}>
                  {theme}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamTable.map((rowData, r) => (
              <tr key={r}>
                {rowData.map((cell, i) => {
                  const isUsed = cell && usedTeams.includes(cell.uniqueId);
                  const isSelected = selectedCells.has(`${r}-${i}`);
                  return (
                    <td
                      key={i}
                      style={{ 
                        width: '150px', 
                        height: '50px', 
                        fontSize: '12px', 
                        padding: '8px',
                        opacity: isUsed ? 0.5 : 1,
                        cursor: selectMode ? 'pointer' : (isUsed ? 'not-allowed' : (cell ? 'grab' : 'default')),
                        backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                        border: isSelected ? '2px solid var(--accent-hover)' : '1px solid var(--border)'
                      }}
                      draggable={!selectMode && !!cell && !isUsed}
                      onDragStart={(e) => !selectMode && handleDragStart(e, r, i)}
                      onClick={() => handleCellClick(r, i)}
                    >
                      {cell ? (
                        <div>
                          <div className="team-cell">{cell.teamName}</div>
                          <div className="team-id">{cell.uniqueId}</div>
                          {isUsed && (
                            <div className="in-use-indicator">In Use</div>
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


