import React, { useState, useEffect, useCallback } from 'react';
import { PORT } from '../constants/port.js';
import { PanelAutomation } from './PanelAutomation.jsx';

export const PanelTable = () => {
  const [panelTable, setPanelTable] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [numPanels, setNumPanels] = useState(4);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [duration, setDuration] = useState(10); // Add duration state
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);

  const generateTimeSlots = useCallback((startTime, endTime, duration) => {
    const slots = [];
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    
    let current = new Date(start);
    
    while (current < end) {
      const hours = current.getHours();
      const minutes = current.getMinutes();
      const displayHours = hours % 12 || 12;
      const timeString = `${displayHours}:${String(minutes).padStart(2, '0')}`;
      slots.push(timeString);
      current.setMinutes(current.getMinutes() + duration);
    }
    
    return slots;
  }, []);

  const fetchPanels = async (slots) => {
    try {
      const response = await fetch(`http://localhost:${PORT}/api/panels` || 'https://panel-splitter-1.onrender.com/api/panels');
      if (response.ok) {
        const panelsData = await response.json();
        
        if (panelsData && panelsData.length > 0) {
          // Set duration from first panel data
          setDuration(panelsData[0].duration);
          
          // Find maximum panel number to set initial numPanels
          const maxPanel = Math.max(...panelsData.map(panel => panel.panel));
          if (maxPanel > numPanels) {
            setNumPanels(maxPanel);
          }
          
          // Create new panel table with existing data
          const newTable = Array.from({ length: slots.length }, () => Array(Math.max(numPanels, maxPanel)).fill(null));
          const usedTeamIds = [];
          
          panelsData.forEach(panel => {
            const timeIndex = slots.indexOf(panel.time);
            const panelIndex = panel.panel - 1; // Convert to 0-based index
            
            if (timeIndex !== -1 && panelIndex >= 0 && panelIndex < Math.max(numPanels, maxPanel)) {
              const uniqueId = `${panel.teamsDataId}-${panel.teamId}`;
              const cellData = {
                teamName: panel.teamName,
                uniqueId: uniqueId,
                teamId: panel.teamId,
                problemStatementId: panel.problemStatementId,
                theme: panel.theme
              };
              
              newTable[timeIndex][panelIndex] = cellData;
              usedTeamIds.push(uniqueId);
            }
          });
          
          setPanelTable(newTable);
          
          // Notify other components about used teams
          usedTeamIds.forEach(uniqueId => {
            window.dispatchEvent(new CustomEvent('teamUsed', { 
              detail: { uniqueId } 
            }));
          });
        }
      }
    } catch (error) {
      console.error('Error fetching panels:', error);
    }
  };

  const fetchDurationConfig = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:${PORT}/api/duration` || 'https://panel-splitter-1.onrender.com/api/duration');
      if (response.ok) {
        const config = await response.json();
        setDuration(config.duration); // Store duration for save functionality
        const slots = generateTimeSlots(config.startTime, config.endTime, config.duration);
        setTimeSlots(slots);
        
        // Only reset panel table structure, don't fetch panels here
        setPanelTable(prev => {
          const newTable = Array.from({ length: slots.length }, (_, rowIndex) => {
            const existingRow = prev[rowIndex] || [];
            return Array.from({ length: numPanels }, (_, colIndex) => 
              existingRow[colIndex] || null
            );
          });
          return newTable;
        });
      }
    } catch (error) {
      console.error('Error fetching duration config:', error);
      // Fallback to default time slots
      const defaultSlots = ['8:00', '8:10', '8:20', '8:30', '8:40'];
      setTimeSlots(defaultSlots);
      setPanelTable(prev => {
        const newTable = Array.from({ length: defaultSlots.length }, (_, rowIndex) => {
          const existingRow = prev[rowIndex] || [];
          return Array.from({ length: numPanels }, (_, colIndex) => 
            existingRow[colIndex] || null
          );
        });
        return newTable;
      });
    }
  }, [numPanels, generateTimeSlots]);

  useEffect(() => {
    // Initial load: fetch duration config and panels
    const initialLoad = async () => {
      await fetchDurationConfig();
      // Only fetch panels on initial load
      const slots = timeSlots.length > 0 ? timeSlots : ['8:00', '8:10', '8:20', '8:30', '8:40'];
      await fetchPanels(slots);
    };

    initialLoad();

    const handleDurationUpdate = () => {
      fetchDurationConfig(); // Only fetch duration config, not panels
    };

    const handleClearAllPanels = () => {
      // Clear the panel table completely
      setPanelTable(prev => {
        const newTable = Array.from({ length: timeSlots.length || prev.length }, () => Array(numPanels).fill(null));
        return newTable;
      });
      
      // Clear selection if in select mode
      setSelectedCells(new Set());
    };

    const handleDeleteAllCells = () => {
    // Use the same functionality as the Delete All button
      deleteAllCells();
    };

    const handleAutomationComplete = async () => {
      // Refresh panel data after automation
      const slots = generateTimeSlots('09:00', '17:00', duration);
      await fetchPanels(slots);
    };

    window.addEventListener('durationUpdated', handleDurationUpdate);
    window.addEventListener('clearAllPanels', handleClearAllPanels);
    window.addEventListener('deleteAllCells', handleDeleteAllCells);
    window.addEventListener('automationComplete', handleAutomationComplete);

    return () => {
      window.removeEventListener('durationUpdated', handleDurationUpdate);
      window.removeEventListener('clearAllPanels', handleClearAllPanels);
      window.removeEventListener('deleteAllCells', handleDeleteAllCells);
      window.removeEventListener('automationComplete', handleAutomationComplete);
    };
  }, [fetchDurationConfig, timeSlots.length, numPanels]);

  const handleDragStart = (e, row, col) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'panel',
      row,
      col,
      content: panelTable[row][col]
    }));
  };

  const handleDrop = (e, row, col) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const newTable = [...panelTable];
    
    if (data.type === 'column') {
      // Handle column drop - place teams vertically starting from the drop position
      data.content.forEach((team, index) => {
        const targetRow = row + index;
        
        // Extend table if needed
        while (targetRow >= newTable.length) {
          newTable.push(Array(numPanels).fill(null));
        }
        
        // If there's existing content, shift it
        if (newTable[targetRow][col] !== null) {
          let insertRow = targetRow;
          while (insertRow < newTable.length && newTable[insertRow][col] !== null) {
            insertRow++;
          }
          
          if (insertRow >= newTable.length) {
            newTable.push(Array(numPanels).fill(null));
          }
          
          for (let i = insertRow; i > targetRow; i--) {
            newTable[i][col] = newTable[i - 1][col];
          }
        }
        
        newTable[targetRow][col] = team;
        
        // Notify TeamTable that teams are now used
        if (team) {
          window.dispatchEvent(new CustomEvent('teamUsed', { 
            detail: { uniqueId: team.uniqueId } 
          }));
        }
      });
    } else {
      // Handle single cell drop (existing logic)
      if (newTable[row][col] !== null) {
        let insertRow = row;
        while (insertRow < newTable.length && newTable[insertRow][col] !== null) {
          insertRow++;
        }
        
        if (insertRow < newTable.length) {
          for (let i = insertRow; i > row; i--) {
            newTable[i][col] = newTable[i - 1][col];
          }
        } else {
          const newRow = Array(numPanels).fill(null);
          newTable.push(newRow);
          for (let i = newTable.length - 1; i > row; i--) {
            newTable[i][col] = newTable[i - 1][col];
          }
        }
      }
      
      newTable[row][col] = data.content;
      
      if (data.type === 'panel') {
        newTable[data.row][data.col] = null; // Move: clear source
      }
      
      if (data.content && data.type === 'team') {
        window.dispatchEvent(new CustomEvent('teamUsed', { 
          detail: { uniqueId: data.content.uniqueId } 
        }));
      }
    }
    
    setPanelTable(newTable);
  };

  const handleCellClick = (row, col) => {
    if (!selectMode || !panelTable[row][col]) return;
    
    const cellKey = `${row}-${col}`;
    const newSelectedCells = new Set(selectedCells);
    
    if (newSelectedCells.has(cellKey)) {
      newSelectedCells.delete(cellKey);
    } else {
      newSelectedCells.add(cellKey);
    }
    
    setSelectedCells(newSelectedCells);
  };

  const deleteSelectedCells = () => {
    const newTable = [...panelTable];
    
    selectedCells.forEach(cellKey => {
      const [row, col] = cellKey.split('-').map(Number);
      const removedTeam = newTable[row][col];
      newTable[row][col] = null;
      
      // Notify TeamTable that team is no longer used
      if (removedTeam) {
        window.dispatchEvent(new CustomEvent('teamRemoved', { 
          detail: { uniqueId: removedTeam.uniqueId } 
        }));
      }
    });
    
    setPanelTable(newTable);
    setSelectedCells(new Set());
  };

  const deleteAllCells = () => {
    // Get all occupied cells to notify TeamTable
    const occupiedCells = [];
    panelTable.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell && cell.uniqueId) {
          occupiedCells.push(cell.uniqueId);
        }
      });
    });

    // Clear the entire panel table
    setPanelTable(prev => {
      const newTable = Array.from({ length: prev.length }, () => Array(numPanels).fill(null));
      return newTable;
    });

    // Clear selection if in select mode
    setSelectedCells(new Set());

    // Notify TeamTable that all teams are no longer used
    occupiedCells.forEach(uniqueId => {
      window.dispatchEvent(new CustomEvent('teamRemoved', { 
        detail: { uniqueId } 
      }));
    });

    // Notify DurationControl that panel table is empty
    window.dispatchEvent(new CustomEvent('panelTableUpdated'));
  };

  const clearSelection = () => {
    setSelectedCells(new Set());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const addPanel = () => {
    setNumPanels(prev => {
      const newNum = prev + 1;
      // Dispatch event to notify other components of the change
      window.dispatchEvent(new CustomEvent('numPanelsChanged', { 
        detail: { numPanels: newNum } 
      }));
      return newNum;
    });
    setPanelTable(prev => prev.map(row => [...row, null]));
  };

  const removeTeam = (row, col) => {
    const newTable = [...panelTable];
    const removedTeam = newTable[row][col];
    newTable[row][col] = null;
    setPanelTable(newTable);

    // Notify TeamTable that a team is no longer used
    if (removedTeam) {
      window.dispatchEvent(new CustomEvent('teamRemoved', { 
        detail: { uniqueId: removedTeam.uniqueId } 
      }));
    }
  };

  // Add collision detection function
  const detectCollisions = () => {
    const collisions = new Set();
    
    panelTable.forEach((row, rowIndex) => {
      const teamIds = {};
      row.forEach((cell, colIndex) => {
        if (cell && cell.uniqueId) {
          const parts = cell.uniqueId.split('-');
          if (parts.length >= 2) {
            const teamId = parts[1]; // Extract teamId from uniqueId
            
            if (teamIds[teamId] !== undefined) {
              // Mark both cells as collisions
              collisions.add(`${rowIndex}-${teamIds[teamId]}`);
              collisions.add(`${rowIndex}-${colIndex}`);
            } else {
              teamIds[teamId] = colIndex;
            }
          }
        }
      });
    });
    return collisions;
  };

  const savePanels = async () => {
    try {
      const meets = [];
      
      // Iterate through all cells in the panel table
      panelTable.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell && cell.uniqueId) {
            meets.push({
              time: timeSlots[rowIndex] || '',
              uniqueId: cell.uniqueId,
              panel: colIndex + 1
            });
          }
        });
      });
      
      const saveData = {
        duration: duration,
        meets: meets
      };

      console.log('Saving panel data:', saveData);

      const response = await fetch(`http://localhost:${PORT}/api/savePanels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData)
      });

      if (response.ok) {
        console.log('Panel data saved successfully');
        // Show success notification
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
        
        // Notify DurationControl that panel table has data
        window.dispatchEvent(new CustomEvent('panelTableUpdated'));
      } else {
        console.error('Failed to save panel data');
      }
    } catch (error) {
      console.error('Error saving panel data:', error);
    }
  };

  const collisions = detectCollisions();
  const collisionCount = collisions.size;

  const totalCells = numPanels * timeSlots.length;
  const occupiedCells = panelTable.flat().filter(cell => cell !== null).length;

  return (
    <div className="ps-card" style={{ 
      width: 'calc(50vw - 6px)', 
      height: '70vh', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div className="ps-section-title" style={{ flexShrink: 0 }}>PANEL TABLE</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className={`ps-button ${showSaveSuccess ? 'success' : 'primary'}`}
            onClick={savePanels}
            style={{ 
              fontSize: '10px', 
              padding: '4px 8px',
              background: showSaveSuccess ? '#28a745' : undefined,
              color: showSaveSuccess ? 'white' : undefined
            }}
          >
            {showSaveSuccess ? '✓ SAVED' : 'SAVE'}
          </button>
          <button 
            className="ps-button"
            onClick={() => setShowAutomationModal(true)}
            style={{ 
              fontSize: '10px', 
              padding: '4px 8px',
              background: '#28a745',
              color: 'white'
            }}
          >
            🤖 AUTO
          </button>
          <button 
            className="ps-button"
            onClick={deleteAllCells}
            style={{ 
              fontSize: '10px', 
              padding: '4px 8px',
              background: 'var(--error)',
              color: 'white'
            }}
          >
            Delete All
          </button>
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
              onClick={deleteSelectedCells}
              style={{ 
                fontSize: '10px', 
                padding: '4px 8px',
                background: 'var(--error)',
                color: 'white'
              }}
            >
              Delete ({selectedCells.size})
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
        <span>Occupied: <strong>{occupiedCells}</strong></span>
        {selectMode && <span>Selected: <strong>{selectedCells.size}</strong></span>}
      </div>
      {collisionCount > 0 && (
        <div className="collision-warning" style={{ margin: '4px 0', padding: '6px 12px', fontSize: '12px' }}>
          ⚠️ Warning: {collisionCount/2} collision(s) detected
        </div>
      )}
      <div style={{ overflow: 'auto', flex: 1 }}>
        <table className="ps-table" style={{ 
          tableLayout: 'fixed', 
          minWidth: `${150 * numPanels + 60}px`,
          borderCollapse: 'collapse'
        }}>
          <thead style={{ position: 'sticky', top: 0, background: 'var(--panel)', zIndex: 1 }}>
            <tr>
              <th style={{ 
                width: '60px', 
                height: '50px', 
                position: 'sticky', 
                left: 0, 
                background: 'var(--panel)', 
                zIndex: 2
              }}>
                <button className="add-panel-button" onClick={addPanel}>
                  +
                </button>
              </th>
              {Array.from({ length: numPanels }, (_, i) => (
                <th key={i} style={{ width: '150px', height: '50px' }}>
                  PANEL {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {panelTable.map((rowData, r) => (
              <tr key={r}>
                <td style={{ 
                  width: '60px', 
                  height: '50px', 
                  fontWeight: 'bold', 
                  position: 'sticky', 
                  left: 0, 
                  background: 'var(--panel)', 
                  zIndex: 1,
                  textAlign: 'center'
                }}>
                  {timeSlots[r] || ''}
                </td>
                {rowData.map((cell, i) => {
                  const hasCollision = collisions.has(`${r}-${i}`);
                  const isSelected = selectedCells.has(`${r}-${i}`);
                  return (
                    <td
                      key={i}
                      style={{ 
                        width: '150px', 
                        height: '50px', 
                        fontSize: '12px', 
                        padding: '8px', 
                        position: 'relative',
                        backgroundColor: isSelected ? 'var(--accent)' : (hasCollision ? 'var(--error-bg)' : 'transparent'),
                        borderColor: isSelected ? 'var(--accent-hover)' : (hasCollision ? 'var(--error)' : 'var(--border)'),
                        borderWidth: (isSelected || hasCollision) ? '2px' : '1px',
                        cursor: selectMode ? 'pointer' : 'default'
                      }}
                      draggable={!selectMode && !!cell}
                      onDragStart={(e) => !selectMode && handleDragStart(e, r, i)}
                      onDrop={(e) => !selectMode && handleDrop(e, r, i)}
                      onDragOver={!selectMode ? handleDragOver : undefined}
                      onClick={() => handleCellClick(r, i)}
                    >
                      {cell ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div>
                              <div className="team-cell">{cell.teamName}</div>
                              <div className="team-id">{cell.uniqueId}</div>
                            </div>
                            {!selectMode && (
                              <button className="remove-button" onClick={() => removeTeam(r, i)}>
                                ×
                              </button>
                            )}
                          </div>
                          {hasCollision && (
                            <div className="collision-indicator">
                              COLLISION
                            </div>
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
      
      {/* Panel Automation Modal */}
      <PanelAutomation 
        showModal={showAutomationModal}
        setShowModal={setShowAutomationModal}
        onAutomationComplete={() => {
          // Refresh panel data after automation
          const slots = generateTimeSlots('09:00', '17:00', duration);
          fetchPanels(slots);
        }}
      />
    </div>
  );
};


