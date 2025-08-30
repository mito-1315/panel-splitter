import supabase from '../config/database.js';

/**
 * Fetch all teams with the given theme name
 * @param {string} themeName - The theme to filter by
 * @returns {Promise<Array>} - Array of rows with the specified theme
 */
export async function themeTeamFetch(themeName) {
  const { data, error } = await supabase
    .from('Teams Data')
    .select('*')
    .eq('theme', themeName);

  if (error) {
    throw error;
  }
  return data;
}
