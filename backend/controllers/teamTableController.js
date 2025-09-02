import { themeTeamFetch } from "../service/themeDisplayService.js";
export async function teamsFetcher(req, res) {
    const theme = req.params.themename;
    if (!theme) {
        return res.status(400).json({ error: 'Theme parameter is required' });
    }
    try {
        const data = await themeTeamFetch(theme);
        
        // Handle both array and object structures
        let teams = [];
        if (Array.isArray(data)) {
            teams = data;
        } else if (data && data.teams && Array.isArray(data.teams)) {
            teams = data.teams;
        } else {
            return res.json({
                themeName: theme,
                teams: []
            });
        }
        
        // Transform the data to the required format
        const themeIndex = themeNames.findIndex(t => t === theme);
        const themeIndexStr = String(themeIndex).padStart(2, '0');
        
        // Generate a set of existing random numbers to avoid duplicates
        const existingRandomNumbers = new Set();
        
        const transformedData = {
            themeName: theme,
            teams: teams.map(team => {
                return {
                    uniqueId: team.id,
                    teamName: team.teamName,
                    teamId: team.teamId.toString(),
                    problemStatement: team.problemStatementId || ''
                };
            })
        };
        
        res.json(transformedData);
        
    } catch (error) {
        console.error('Error in teamsFetcher:', error);
        res.status(500).json({ error: error.message });
    }
}

export const themeNames = [
  'MedTech / BioTech / HealthTech',
  'Travel & Tourism',
  'Transportation & Logistics',
  'Agriculture',
  'Disaster Management',
  'Smart Education',
  'Clean & Green Technology',
  'Smart Automation',
  'Blockchain & Cybersecurity',
  'Miscellaneous',
  'Renewable / Sustainable Energy',
  'Robotics and Drones',
  'Heritage & Culture',
  'Fitness & Sports'
];