import supabase from '../config/database.js';

/**
 * Upload teams data to the 'Teams Data' table in the database
 * @param {Array} parsedCSV - 2D array containing the parsed CSV data with headers
 * @returns {Promise<Object>} - Result of the database operation
 */
const uploadTeamsCSV = async (parsedCSV) => {
  try {
    console.log('Uploading teams data to database...');
    
    // Skip the header row (first row) and convert the 2D array to an array of objects
    const header = parsedCSV[0];
    const dataRows = parsedCSV.slice(1);
    
    // Convert each row to an object with properties matching the column names
    const teamsData = dataRows.map(row => {
      const teamObject = {};
      header.forEach((column, index) => {
        teamObject[column] = row[index];
      });
      return teamObject;
    });
    
    // Insert the data into the 'Teams Data' table
    const { data, error } = await supabase
      .from('Teams Data')
      .insert(teamsData);
    
    if (error) {
      console.error('Error uploading teams data:', error);
      throw error;
    }
    
    console.log(`Successfully uploaded ${teamsData.length} teams to the database`);
    return { success: true, count: teamsData.length };
  } catch (error) {
    console.error('Error in uploadTeamsCSV:', error);
    throw error;
  }
};

export { uploadTeamsCSV };