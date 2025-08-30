import { themeTeamFetch } from '../service/themeDisplayService.js';

export async function themeDisplay(req, res) {
  //console.log('themeDisplay controller called'); // Add this line
  const { parameter } = req.params;
  //console.log(parameter);
  try {
    res.set('Cache-Control', 'no-store'); // Disable caching
    const data = await themeTeamFetch(parameter);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
