import fs from 'fs';
import csv from 'csv-parser';

/**
 * Parse CSV file and log the first 5 rows
 * @param {Object} file - The uploaded CSV file
 * @returns {Promise<void>}
 */
const parseCSVToTable = async (file) => {
  console.log('Parsing CSV file:', file.originalname);
  
  // Create a readable stream from the file buffer
  const bufferStream = fs.createReadStream(file.path);
  
  const results = [];
  let rowCount = 0;
  
  return new Promise((resolve, reject) => {
    bufferStream
      .pipe(csv())
      .on('data', (data) => {
        if (rowCount < 5) {
          results.push(data);
          rowCount++;
        }
      })
      .on('end', () => {
        console.log('First 5 rows of the CSV file:');
        console.log(results);
        resolve(results);
      })
      .on('error', (error) => {
        console.error('Error parsing CSV:', error);
        reject(error);
      });
  });
};

/**
 * Handle CSV file upload
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const uploadCSV = async (req, res) => {
  try {
    // Check if file exists in the request
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }
    
    // Check if the file is a CSV
    if (!req.file.originalname.endsWith('.csv')) {
      return res.status(400).json({ error: 'Uploaded file is not a CSV' });
    }
    
    // Forward the file to parseCSVToTable function
    await parseCSVToTable(req.file);
    
    return res.status(200).json({ 
      message: 'CSV file uploaded and processed successfully',
      filename: req.file.originalname
    });
  } catch (error) {
    console.error('Error in uploadCSV:', error);
    return res.status(500).json({ error: 'Failed to process CSV file' });
  }
};

export { uploadCSV, parseCSVToTable };