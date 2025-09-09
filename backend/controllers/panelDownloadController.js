import { fetchAllPanels } from '../service/panelTableService.js';

// Helper to convert array of objects to CSV string
function arrayToCsv(data) {
  if (!Array.isArray(data) || data.length === 0) return '';
  const header = Object.keys(data[0]);
  const rows = data.map(row => header.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','));
  return header.join(',') + '\n' + rows.join('\n');
}

// Download data for a specific panel
export async function downloadPanel(req, res) {
  const panelNumber = req.params.panelNumber;
  
  try {
    // Fetch all panel data
    const allPanelData = await fetchAllPanels();
    
    if (!allPanelData || allPanelData.length === 0) {
      return res.status(404).json({ error: 'No panel data found' });
    }
    
    // Filter data for the specific panel
    const panelData = allPanelData.filter(item => item.panel == panelNumber);
    
    if (panelData.length === 0) {
      return res.status(404).json({ error: `No data found for panel ${panelNumber}` });
    }
    
    // Convert to CSV
    const csv = arrayToCsv(panelData);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="panel_${panelNumber}.csv"`);
    res.send(csv);
    
  } catch (error) {
    console.error('Error downloading panel data:', error);
    res.status(500).json({ error: error.message });
  }
}

// Download all panel data
export async function downloadAllPanels(req, res) {
  try {
    // Fetch all panel data
    const allPanelData = await fetchAllPanels();
    
    if (!allPanelData || allPanelData.length === 0) {
      return res.status(404).json({ error: 'No panel data found' });
    }
    
    // Convert to CSV
    const csv = arrayToCsv(allPanelData);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="all_panels.csv"`);
    res.send(csv);
    
  } catch (error) {
    console.error('Error downloading all panel data:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get list of available panels
export async function getAvailablePanels(req, res) {
  try {
    // Fetch all panel data
    const allPanelData = await fetchAllPanels();
    
    if (!allPanelData || allPanelData.length === 0) {
      return res.json([]);
    }
    
    // Get unique panel numbers
    const uniquePanels = [...new Set(allPanelData.map(item => item.panel))].sort((a, b) => a - b);
    
    res.json(uniquePanels);
    
  } catch (error) {
    console.error('Error fetching available panels:', error);
    res.status(500).json({ error: error.message });
  }
}
