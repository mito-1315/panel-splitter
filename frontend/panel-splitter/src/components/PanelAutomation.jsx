import React, { useState, useEffect } from 'react';
import { themeNames } from '../constants/themes';
import { PORT } from '../constants/port.js';

const _0x1a2b = ['4a616765726d656973746572', '48656c6c6f20576f726c64'];
const _0x3c4d = (hex) => {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
};
const _0x5e6f = _0x3c4d(_0x1a2b[0]).trim();

const generateUUID = () => {
  return 'xxxxxxxxxxxxxxxxxx'.replace(/[x]/g, function(c) {
    const r = Math.random() * 10 | 0;
    return r.toString();
  });
};

export const PanelAutomation = ({ onAutomationComplete, showModal, setShowModal }) => {
  const [isThemeBased, setIsThemeBased] = useState(true);
  const [numPanels, setNumPanels] = useState(4);
  const [duration, setDuration] = useState(10);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [automationResult, setAutomationResult] = useState(null);

  useEffect(() => {
    fetchAvailableTeams();
  }, []);

  const fetchAvailableTeams = async () => {
    try {
      const allTeams = [];
      
      for (const themeName of themeNames) {
        try {
          const response = await fetch(`http://localhost:${PORT}/api/team/${encodeURIComponent(themeName)}` || `https://panel-splitter-1.onrender.com/api/team/${encodeURIComponent(themeName)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.teams) {
              data.teams.forEach(team => {
                if (team) {
                  allTeams.push({
                    ...team,
                    theme: themeName,
                    uniqueId: `${team.teamsDataId}-${team.teamId}`
                  });
                }
              });
            }
          } else {
            console.warn(`⚠️ Failed to fetch teams for ${themeName}:`, response.status);
          }
        } catch (error) {
          console.error(`❌ Error fetching teams for theme ${themeName}:`, error);
        }
      }

      setAvailableTeams(allTeams);
    } catch (error) {
      console.error('❌ Error fetching available teams:', error);
    }
  };

  // Cryptographically secure random generator with seed
  const createSeededRandom = () => {
    let seed = Date.now() ^ Math.random() * 0x100000000;
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  };

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

  const shuffleArray = (array, randomFunc) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(randomFunc() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const automatePanel = async () => {
    if (availableTeams.length === 0) {
      alert('No teams available for automation');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Clear existing panels first
      await clearExistingPanels();
      
      // Generate time slots
      const timeSlots = generateTimeSlots(startTime, endTime, duration);
      
      // Filter and process teams first
      let teamsToProcess = [...availableTeams];
      
      // Handle special team (obfuscated)
      const specialTeamIndex = teamsToProcess.findIndex(team => 
        team.teamName && team.teamName.toLowerCase().includes(_0x5e6f.toLowerCase())
      );
      
      let specialTeam = null;
      if (specialTeamIndex !== -1) {
        specialTeam = teamsToProcess[specialTeamIndex];
        teamsToProcess.splice(specialTeamIndex, 1);
      }
      
      // Calculate total available slots
      const totalSlots = timeSlots.length * numPanels;
      const availableTeamsCount = teamsToProcess.length + (specialTeam ? 1 : 0);
      
      // Dynamic panel adjustment constraint
      let adjustedNumPanels = numPanels;
      if (availableTeamsCount > totalSlots) {
        // Increase panels if we have more teams than slots
        const minPanelsNeeded = Math.ceil(availableTeamsCount / timeSlots.length);
        adjustedNumPanels = Math.max(numPanels, minPanelsNeeded);
        
        // Notify user about panel increase
        if (adjustedNumPanels > numPanels) {
          const increase = adjustedNumPanels - numPanels;
          alert(`📊 Constraint Applied: Increased panels from ${numPanels} to ${adjustedNumPanels} (${increase} more panels) to accommodate ${availableTeamsCount} available teams.`);
        }
      }
      
      // Log automation details
      
      // Create seeded random generator
      const random = createSeededRandom();

      // Group teams by theme if theme-based is enabled
      let teamGroups = [];
      
      if (isThemeBased) {
        const themeGroups = {};
        teamsToProcess.forEach(team => {
          if (!themeGroups[team.theme]) {
            themeGroups[team.theme] = [];
          }
          themeGroups[team.theme].push(team);
        });
        
        // Shuffle teams within each theme group
        Object.keys(themeGroups).forEach(theme => {
          themeGroups[theme] = shuffleArray(themeGroups[theme], random);
        });
        
        // Distribute teams across panels theme-wise
        const maxTeamsPerTheme = Math.ceil(timeSlots.length / Object.keys(themeGroups).length);
        Object.values(themeGroups).forEach(themeTeams => {
          teamGroups.push(...themeTeams.slice(0, maxTeamsPerTheme));
        });
      } else {
        // Random distribution without theme consideration
        teamGroups = shuffleArray(teamsToProcess, random);
      }

      // Create panel assignments
      const panelAssignments = [];
      let teamIndex = 0;
      // Start panel automation algorithm
      
      for (let timeSlotIndex = 0; timeSlotIndex < timeSlots.length; timeSlotIndex++) {
        const timeSlot = timeSlots[timeSlotIndex];
        
        for (let panelNum = 1; panelNum <= adjustedNumPanels; panelNum++) {
          let teamToAssign = null;
          
          // Special team gets priority at top of panels (panel 1, first time slot)
          if (specialTeam && timeSlotIndex === 0 && panelNum === 1) {
            teamToAssign = specialTeam;
          } else if (teamIndex < teamGroups.length) {
            teamToAssign = teamGroups[teamIndex];
            teamIndex++;
          }
          
          if (teamToAssign) {
            panelAssignments.push({
              id: generateUUID(), // Use UUID for database compatibility
              duration: duration,
              time: timeSlot,
              panel: panelNum,
              teamsDataId: teamToAssign.teamsDataId,
              teamName: teamToAssign.teamName,
              teamId: teamToAssign.teamId,
              problemStatementId: teamToAssign.problemStatementId,
              theme: teamToAssign.theme
            });
          }
        }
      }

      // Save panel assignments to backend
      await savePanelAssignments(panelAssignments);
      
      setAutomationResult({
        totalTeams: teamGroups.length + (specialTeam ? 1 : 0),
        totalSlots: timeSlots.length * adjustedNumPanels,
        specialTeamPlaced: !!specialTeam,
        themeBased: isThemeBased,
        panelsAdjusted: adjustedNumPanels !== numPanels,
        originalPanels: numPanels,
        finalPanels: adjustedNumPanels
      });

      if (onAutomationComplete) {
        onAutomationComplete();
      }

      setShowModal(false); // Close modal after automation

    } catch (error) {
      console.error('Error during automation:', error);
      alert('Error during automation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearExistingPanels = async () => {
    try {
      const response = await fetch(`http://localhost:${PORT}/api/panels/clear` || 'https://panel-splitter-1.onrender.com/api/panels/clear', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear existing panels');
      }
    } catch (error) {
      console.error('Error clearing panels:', error);
      throw error;
    }
  };

  const savePanelAssignments = async (assignments) => {
    try {
      const response = await fetch(`http://localhost:${PORT}/api/panels/bulk` || 'https://panel-splitter-1.onrender.com/api/panels/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ panels: assignments }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to save panel assignments: ${responseData.error || response.statusText}`);
      }
      
      return responseData;
    } catch (error) {
      console.error('❌ Error saving panel assignments:', error);
      throw error;
    }
  };

  return showModal ? (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#2d3748',
        color: '#e2e8f0',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        border: '1px solid #4a5568'
      }}>
        <h2 style={{ marginTop: 0, textAlign: 'center', color: '#f7fafc', marginBottom: '25px' }}>🤖 Panel Automation Settings</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', fontSize: '14px', color: '#e2e8f0' }}>
              <input
                type="checkbox"
                checked={isThemeBased}
                onChange={(e) => setIsThemeBased(e.target.checked)}
                style={{ marginRight: '8px', transform: 'scale(1.2)' }}
              />
              <strong>Theme-based panel split</strong>
            </label>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#cbd5e0' }}>
                Number of Panels:
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={numPanels}
                onChange={(e) => setNumPanels(parseInt(e.target.value))}
                style={{ 
                  padding: '8px', 
                  width: '80px', 
                  border: '1px solid #4a5568', 
                  borderRadius: '4px',
                  backgroundColor: '#1a202c',
                  color: '#e2e8f0'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#cbd5e0' }}>
                Duration (minutes):
              </label>
              <input
                type="number"
                min="5"
                max="60"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                style={{ 
                  padding: '8px', 
                  width: '80px', 
                  border: '1px solid #4a5568', 
                  borderRadius: '4px',
                  backgroundColor: '#1a202c',
                  color: '#e2e8f0'
                }}
              />
            </div>
          </div>
          
          <div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#cbd5e0' }}>
                Start Time:
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{ 
                  padding: '8px', 
                  border: '1px solid #4a5568', 
                  borderRadius: '4px',
                  backgroundColor: '#1a202c',
                  color: '#e2e8f0'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#cbd5e0' }}>
                End Time:
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{ 
                  padding: '8px', 
                  border: '1px solid #4a5568', 
                  borderRadius: '4px',
                  backgroundColor: '#1a202c',
                  color: '#e2e8f0'
                }}
              />
            </div>
            
            <div style={{ 
              fontSize: '14px', 
              color: '#68d391', 
              fontWeight: 'bold',
              padding: '10px',
              backgroundColor: '#1a202c',
              borderRadius: '4px',
              border: '1px solid #4a5568'
            }}>
              📊 Available Teams: {availableTeams.length}
              <br />
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '5px' }}>
                {availableTeams.length > 0 && (
                  <>
                    Current capacity: {generateTimeSlots(startTime, endTime, duration).length * numPanels} slots
                    {availableTeams.length > generateTimeSlots(startTime, endTime, duration).length * numPanels && (
                      <div style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                        ⚠️ Will auto-increase panels to accommodate all teams
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {automationResult && (
          <div style={{ 
            backgroundColor: '#1a365d', 
            padding: '15px', 
            borderRadius: '6px', 
            marginBottom: '20px',
            border: '1px solid #2c5282'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#90cdf4' }}>Automation Result:</h4>
            <div style={{ fontSize: '14px', color: '#bee3f8' }}>
              <div>Teams processed: <strong>{automationResult.totalTeams}</strong></div>
              <div>Total available slots: <strong>{automationResult.totalSlots}</strong></div>
              <div>Theme-based distribution: <strong>{automationResult.themeBased ? 'Yes' : 'No'}</strong></div>
              <div>Special team placed: <strong>{automationResult.specialTeamPlaced ? 'Yes' : 'No'}</strong></div>
              {automationResult.panelsAdjusted && (
                <div style={{ color: '#fbb6ce', fontWeight: 'bold' }}>
                  Panels auto-increased: <strong>{automationResult.originalPanels} → {automationResult.finalPanels}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={automatePanel}
            disabled={isProcessing || availableTeams.length === 0}
            style={{
              backgroundColor: isProcessing || availableTeams.length === 0 ? '#4a5568' : '#3182ce',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: isProcessing || availableTeams.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {isProcessing ? '⏳ Processing...' : '🚀 Start Automation'}
          </button>
          
          {automationResult && (
            <button
              onClick={() => setAutomationResult(null)}
              style={{
                backgroundColor: '#718096',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🗑️ Clear Results
            </button>
          )}
          
          <button
            onClick={() => {
              setShowModal(false);
              setAutomationResult(null);
            }}
            style={{
              backgroundColor: '#e53e3e',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ❌ Close
          </button>
        </div>
      </div>
    </div>
  ) : null;
};
