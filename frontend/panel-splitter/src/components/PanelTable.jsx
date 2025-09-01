import React, { useState, useEffect } from 'react';

export const PanelTable = () => {
  const [panelTable, setPanelTable] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [numPanels, setNumPanels] = useState(4);

  const fetchDurationConfig = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/duration');
      if (response.ok) {
        const config = await response.json();
        const slots = generateTimeSlots(config.startTime, config.endTime, config.duration);
        setTimeSlots(slots);
        
        // Only reset panel table if time slots changed, preserve existing data
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
  };

  useEffect(() => {
    fetchDurationConfig();

    const handleDurationUpdate = () => {
      fetchDurationConfig();
    };

    window.addEventListener('durationUpdated', handleDurationUpdate);

    return () => {
      window.removeEventListener('durationUpdated', handleDurationUpdate);
    };
  }, [numPanels]); // Add numPanels to dependencies to refetch when panels change

  const generateTimeSlots = (startTime, endTime, duration) => {
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
  };

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
    
    // If there's existing content, shift it and following elements down
    if (newTable[row][col] !== null) {
      // Find the next available slot in the column
      let insertRow = row;
      while (insertRow < newTable.length && newTable[insertRow][col] !== null) {
        insertRow++;
      }
      
      // If we found a slot, shift elements down
      if (insertRow < newTable.length) {
        for (let i = insertRow; i > row; i--) {
          newTable[i][col] = newTable[i - 1][col];
        }
      } else {
        // No space available, extend the table
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
    
    setPanelTable(newTable);

    // Notify TeamTable that a team is now used
    if (data.content && data.type === 'team') {
      window.dispatchEvent(new CustomEvent('teamUsed', { 
        detail: { uniqueId: data.content.uniqueId } 
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const addPanel = () => {
    setNumPanels(prev => prev + 1);
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

  return (
    <div className="ps-card" style={{ width: '50vw', height: '80vh', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <div className="ps-section-title" style={{ flexShrink: 0 }}>PANEL TABLE</div>
      <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
        <table className="ps-table" style={{ tableLayout: 'fixed', minWidth: `${150 * numPanels + 60}px` }}>
          <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
            <tr>
              <th style={{ width: '60px', height: '50px', position: 'sticky', left: 0, background: 'white', zIndex: 2 }}>
                <button 
                  onClick={addPanel}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#007bff',
                    color: 'black',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
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
                <td style={{ width: '60px', height: '50px', fontWeight: 'bold', position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>
                  {timeSlots[r] || ''}
                </td>
                {rowData.map((cell, i) => (
                  <td
                    key={i}
                    style={{ width: '150px', height: '50px', fontSize: '12px', padding: '4px', position: 'relative' }}
                    draggable={!!cell}
                    onDragStart={(e) => handleDragStart(e, r, i)}
                    onDrop={(e) => handleDrop(e, r, i)}
                    onDragOver={handleDragOver}
                  >
                    {cell ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{cell.teamName}</div>
                          <div style={{ fontSize: '10px', color: '#666' }}>{cell.uniqueId}</div>
                        </div>
                        <button
                          onClick={() => removeTeam(r, i)}
                          style={{
                            background: 'red',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


