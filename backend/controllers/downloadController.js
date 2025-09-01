import { themeTeamFetch } from '../service/themeDisplayService.js';
import AdmZip from 'adm-zip';

// Helper to convert array of objects to CSV string
function arrayToCsv(data) {
  if (!Array.isArray(data) || data.length === 0) return '';
  const header = Object.keys(data[0]);
  const rows = data.map(row => header.map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(','));
  return header.join(',') + '\n' + rows.join('\n');
}

export async function downloadTheme(req, res) {
  const theme = req.params.theme;
  try {
    const data = await themeTeamFetch(theme);
    const csv = arrayToCsv(data);
    if (theme === 'all') {
          const themes = [
          "MedTech / BioTech / HealthTech",
          "Travel & Tourism",
          "Transportation & Logistics",
          "Agriculture",
          "Disaster Management",
          "Smart Education",
          "Clean & Green Technology",
          "Smart Automation",
          "Blockchain & Cybersecurity",
          "Miscellaneous",
          "Renewable / Sustainable Energy",
          "Robotics and Drones",
          "Heritage & Culture",
          "Fitness & Sports"
        ];
        let allCsv = '';
        const headerdata = await themeTeamFetch("MedTech / BioTech / HealthTech");
        const header = Object.keys(headerdata[0]);
        allCsv += header.join(',');
        for (const theme of themes) {
          const data = await themeTeamFetch(theme);
          if (data && data.length > 0) {
            const rows = data.map(row => header.map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(','));
            const csv = rows.join('\n');
            allCsv += '\n'+ csv;
          }
        }
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="all.csv"`);
        res.write(allCsv);
        res.end();
      } 
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${theme}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function downloadAllThemes(req, res) {
  try {
    const themes = [
      "MedTech / BioTech / HealthTech",
      "Travel & Tourism",
      "Transportation & Logistics",
      "Agriculture",
      "Disaster Management",
      "Smart Education",
      "Clean & Green Technology",
      "Smart Automation",
      "Blockchain & Cybersecurity",
      "Miscellaneous",
      "Renewable / Sustainable Energy",
      "Robotics and Drones",
      "Heritage & Culture",
      "Fitness & Sports"
    ];
    let allCsv = '';
    const headerdata = await themeTeamFetch("MedTech / BioTech / HealthTech");
    const header = Object.keys(headerdata[0]);
    allCsv += header.join(',');
    for (const theme of themes) {
      const data = await themeTeamFetch(theme);
      if (data && data.length > 0) {
        const rows = data.map(row => header.map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(','));
        const csv = rows.join('\n');
        allCsv += '\n'+ csv;
      }
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="all.csv"`);
    res.write(allCsv);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function downloadAll() {
  try {
    const themes = [
      "MedTech / BioTech / HealthTech",
      "Travel & Tourism",
      "Transportation & Logistics",
      "Agriculture",
      "Disaster Management",
      "Smart Education",
      "Clean & Green Technology",
      "Smart Automation",
      "Blockchain & Cybersecurity",
      "Miscellaneous",
      "Renewable / Sustainable Energy",
      "Robotics and Drones",
      "Heritage & Culture",
      "Fitness & Sports"
    ];
    let allCsv = '';
    const headerdata = await themeTeamFetch("MedTech / BioTech / HealthTech");
    const header = Object.keys(headerdata[0]);
    allCsv += header.join(',');
    for (const theme of themes) {
      const data = await themeTeamFetch(theme);
      if (data && data.length > 0) {
        const rows = data.map(row => header.map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(','));
        const csv = rows.join('\n');
        allCsv += '\n'+ csv;
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}