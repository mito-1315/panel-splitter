let durationConfig = {
  startTime: '08:00',
  endTime: '17:00',
  duration: 10
};

export async function saveDurationConfig(req, res) {
  try {
    const { startTime, endTime, duration } = req.body;
    
    if (!startTime || !endTime || !duration) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    durationConfig = { startTime, endTime, duration };
    console.log('Duration config saved:', durationConfig);
    
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
