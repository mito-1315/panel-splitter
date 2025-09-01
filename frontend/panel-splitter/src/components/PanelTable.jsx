import React, { useState, useEffect } from 'react';

export const PanelTable = () => {
  const [panelTable, setPanelTable] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    // Fetch duration configuration and generate time slots
    const fetchDurationConfig = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/duration');
        if (response.ok) {
          const config = await response.json();
          const slots = generateTimeSlots(config.startTime, config.endTime, config.duration);
          setTimeSlots(slots);
          setPanelTable(Array.from({ length: slots.length }, () => Array(4).fill(null)));
        }
      } catch (error) {
        console.error('Error fetching duration config:', error);
        // Fallback to default time slots
        const defaultSlots = ['8:00', '8:10', '8:20', '8:30', '8:40'];
        setTimeSlots(defaultSlots);
        setPanelTable(Array.from({ length: defaultSlots.length }, () => Array(4).fill(null)));
      }
    };

    fetchDurationConfig();
  }, []);

  const generateTimeSlots = (startTime, endTime, duration) => {
    const slots = [];
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    
    let current = new Date(start);
    
    while (current < end) {
      const timeString = current.toTimeString().slice(0, 5);
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
        const newRow = Array(4).fill(null);
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
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="ps-card" style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div className="ps-section-title" style={{ flexShrink: 0 }}>PANEL TABLE</div>
      <div style={{ overflow: 'auto', flex: 1 }}>
        <table className="ps-table">
          <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
            <tr>
              <th style={{ width: '200px', height: '50px' }}>TIME</th>
              <th style={{ width: '200px', height: '50px' }}>PANEL 1</th>
              <th style={{ width: '200px', height: '50px' }}>PANEL 2</th>
              <th style={{ width: '200px', height: '50px' }}>PANEL 3</th>
              <th style={{ width: '200px', height: '50px' }}>PANEL 4</th>
            </tr>
          </thead>
          <tbody>
            {panelTable.map((rowData, r) => (
              <tr key={r}>
                <td style={{ width: '200px', height: '50px', fontWeight: 'bold' }}>
                  {timeSlots[r] || ''}
                </td>
                {rowData.map((cell, i) => (
                  <td
                    key={i}
                    style={{ width: '200px', height: '50px', fontSize: '12px', padding: '4px' }}
                    draggable={!!cell}
                    onDragStart={(e) => handleDragStart(e, r, i)}
                    onDrop={(e) => handleDrop(e, r, i)}
                    onDragOver={handleDragOver}
                  >
                    {cell ? (
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{cell.teamName}</div>
                        <div style={{ fontSize: '10px', color: '#666' }}>{cell.uniqueId}</div>
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


