import supabase from "../config/database.js";

export default async function savePanelService(panelData) {
    try {
        const { data, error } = await supabase
            .from('Panel Data')
            .insert(panelData);
        if (error) {
            console.error('Error saving panel data to database:', error);
        }
    } catch (error) {
        console.error('Unexpected error saving panel data to database:', error);
    }
}

export async function fetchTeamsData(id) {
    try {
        //console.log(`Fetching data for team ID: ${teamsDataId}`);
        
        const { data, error } = await supabase
            .from('Teams Data')
            .select('*')
            .eq('id', id)
            .single();
            
        if (error) {
            console.error(`Error fetching team data for ID ${id}:`, error);
            return null;
        }
        
        if (!data) {
            console.log(`No data found for team ID: ${id}`);
            return null;
        }
        
        return data;
    } catch (error) {
        console.error(`Unexpected error fetching team data for ID ${id}:`, error);
        return null;
    }
}

export async function deleteAllRows() {
    try {
        const { data, error } = await supabase
            .from('Panel Data')
            .delete()
            .neq('id', 0); // This condition ensures all rows are deleted
    } catch (error) {
        console.error('Error deleting all rows from Panel Data:', error);
    }
}

export async function savePanelData(id, duration, time, panel, teamsDataId, teamName, teamId, problemStatementId, theme) {
  try {
    const { data, error } = await supabase
      .from('Panel Data')
      .insert([
        {
          id,
          duration,
          time,
          panel,
          teamsDataId,
          teamName,
          teamId,
          problemStatementId,
          theme
        }
      ]);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error saving panel data:', error);
    throw error;
  }
}

export async function fetchAllPanels() {
  try {
    const { data, error } = await supabase
      .from('Panel Data')
      .select('*')
      .order('panel', { ascending: true })
      .order('time', { ascending: true });
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching all panels:', error);
    throw error;
  }
}