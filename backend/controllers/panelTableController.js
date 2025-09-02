import { fetchTeamsData, deleteAllRows, savePanelData, fetchAllPanels } from '../service/panelTableService.js';

let durationConfig = {
  startTime: '08:00',
  endTime: '17:00',
  duration: 10
};

export async function saveDurationConfig(req, res) {
  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Request body is required. Ensure body parser middleware is set up.' });
    }
    
    const { startTime, endTime, duration } = req.body;
    
    if (!startTime || !endTime || !duration) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    durationConfig = { startTime, endTime, duration };
    
    res.json({ message: 'Duration configuration saved successfully', config: durationConfig });
  } catch (error) {
    console.error('Error saving duration config:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getDurationConfig(req, res) {
  try {
    res.json(durationConfig);
  } catch (error) {
    console.error('Error getting duration config:', error);
    res.status(500).json({ error: error.message });
  }
}

/*export async function savePanels(req, res) {
  let panelData = req.body;
  try {
    if (!panelData || !panelData.meets || !Array.isArray(panelData.meets)) {
      return res.status(400).json({ error: 'Invalid request body. "meets" array is required.' });
    }
    // Here you can process and save the panelData to your database if needed

  } catch (error) {
    console.error('Error saving panels:', error);
    return res.status(500).json({ error: error.message });
  }
}*/

export async function savePanels(req, res) {
  let panelData = req.body;
  try {
    if (!panelData || !panelData.meets || !Array.isArray(panelData.meets)) {
      return res.status(400).json({ error: 'Invalid request body. "meets" array is required.' });
    }
    //console.log('Panel data received:', panelData);
    deleteAllRows()

    let duration = parseInt(panelData.duration);
    let meets = panelData.meets;
    for (let i=0;i<meets.length;i++) {
      let id=i+1;
      let meet = meets[i];
      let time = meet.time;
      let uniqueId = meet.uniqueId;
      let panel = parseInt(meet.panel);
      
      let teamsDataId = parseInt(uniqueId.split('-')[0]);
      let teams = await fetchTeamsData(teamsDataId);
      let teamName = teams.teamName;
      let teamId = teams.teamId;
      let problemStatementId = teams.problemStatementId;
      let theme = teams.theme;
      
      await savePanelData(id, duration, time, panel, teamsDataId, teamName, teamId, problemStatementId, theme);
    }
    return res.json({ message: 'Panels saved successfully' });
  } catch (error) {
    console.log('Error saving panels:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function fetchPanels(req, res) {
  try {
    let panels = await fetchAllPanels();
    //console.log('Fetched panels:', panels);
    return res.json(panels);
  } catch (error) {
    console.log('Error fetching panels:', error);
    return res.status(500).json({ error: error.message });
  }
}

const request={
    "duration": 10,
    "meets": [
        {
            "time": "8:00",
            "uniqueId": "55-3982",
            "panel": 1
        },
        {
            "time": "8:10",
            "uniqueId": "291-1729",
            "panel": 1
        },
        {
            "time": "8:10",
            "uniqueId": "138-9214",
            "panel": 2
        },
        {
            "time": "8:10",
            "uniqueId": "388-3960",
            "panel": 4
        },
        {
            "time": "8:10",
            "uniqueId": "59-5708",
            "panel": 5
        },
        {
            "time": "8:20",
            "uniqueId": "290-4393",
            "panel": 1
        },
        {
            "time": "8:20",
            "uniqueId": "16-7759",
            "panel": 3
        },
        {
            "time": "8:20",
            "uniqueId": "148-1763",
            "panel": 4
        },
        {
            "time": "8:20",
            "uniqueId": "2-5829",
            "panel": 5
        },
        {
            "time": "8:30",
            "uniqueId": "411-2100",
            "panel": 1
        },
        {
            "time": "8:30",
            "uniqueId": "136-3899",
            "panel": 3
        },
        {
            "time": "8:30",
            "uniqueId": "339-2828",
            "panel": 4
        },
        {
            "time": "8:30",
            "uniqueId": "69-4780",
            "panel": 5
        },
        {
            "time": "8:40",
            "uniqueId": "74-7066",
            "panel": 1
        },
        {
            "time": "8:40",
            "uniqueId": "269-7625",
            "panel": 3
        },
        {
            "time": "8:40",
            "uniqueId": "422-5488",
            "panel": 4
        },
        {
            "time": "8:40",
            "uniqueId": "33-4055",
            "panel": 5
        },
        {
            "time": "8:50",
            "uniqueId": "268-2561",
            "panel": 3
        },
        {
            "time": "8:50",
            "uniqueId": "56-3982",
            "panel": 4
        },
        {
            "time": "8:50",
            "uniqueId": "58-8520",
            "panel": 5
        },
        {
            "time": "9:00",
            "uniqueId": "9-9015",
            "panel": 3
        }
    ]
}
