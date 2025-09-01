import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { uploadTeamsCSV } from '../service/uploadService.js';

/**
 * Fetch theme for a given problemStatementId from themes.sorted.csv
 * @param {string} problemStatementId - The problem statement ID to look up
 * @returns {Promise<string>} - The theme associated with the problemStatementId
 */
const fetchTheme = async (problemStatementId) => {
  // Get the directory name using ES modules approach
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  
  // Path to themes.sorted.csv (going up from controllers to project root)
  const themesFilePath = path.join(__dirname, '..', '..', 'themes.sorted.csv');
  return new Promise((resolve, reject) => {
    let found = false;
    fs.createReadStream(themesFilePath)
      .pipe(csv())
      .on('data', (data) => {
        // Check if this row matches the problemStatementId
        if (data.problemStatementId === problemStatementId) {
          found = true;
          resolve(data.theme);
        }
      })
      .on('end', () => {
        if (!found) {
          // If no matching theme was found, resolve with a default value
          resolve('Unknown');
        }
      })
      .on('error', (error) => {
        console.error('Error reading themes file:', error);
        reject(error);
      });
  });
};

/**
 * Parse CSV file, check for required columns, and add theme information
 * @param {Object} file - The uploaded CSV file
 * @returns {Promise<Array>} - The parsed CSV data with added theme column
 */
const parseCSVToTable = async (file) => {
  
  
  // Create a readable stream from the file buffer
  const bufferStream = fs.createReadStream(file.path);
  
  // Array to store all parsed rows
  const rawData = [];
  
  // First, read all data from the CSV
  const readData = new Promise((resolve, reject) => {
    bufferStream
      .pipe(csv())
      .on('data', (data) => {
        rawData.push(data);
      })
      .on('end', () => {
        resolve(rawData);
      })
      .on('error', (error) => {
        console.error('Error parsing CSV:', error);
        reject(error);
      });
  });
  
  // Wait for all data to be read
  const data = await readData;
  
  // Check if the CSV has the required columns
  if (data.length > 0) {
    const firstRow = data[0];
    const requiredColumns = ['teamId', 'teamName', 'problemStatementId'];
    
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      throw new Error(`CSV is missing required columns: ${missingColumns.join(', ')}`);
    }
  } else {
    throw new Error('CSV file is empty');
  }
  
  // Create the 2D array with header row
  const parsedCSV = [
    ['teamId', 'teamName', 'problemStatementId', 'theme']
  ];
  
  // Process each row and add theme information
  for (const row of data) {
    const theme = await fetchTheme(row.problemStatementId);
    parsedCSV.push([row.teamId, row.teamName, row.problemStatementId, theme]);
  }
  
  // Upload the parsed CSV data to the database
  try {
    const result = await uploadTeamsCSV(parsedCSV);
  } catch (error) {
    console.error('Error uploading to database:', error);
    throw new Error(`Failed to upload to database: ${error.message}`);
  }
  
  return parsedCSV;
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
    const parsedData = await parseCSVToTable(req.file);
    
    return res.status(200).json({ 
      message: 'CSV file uploaded and processed successfully',
      filename: req.file.originalname,
      databaseUpload: 'Teams data uploaded to database'
    });
  } catch (error) {
    console.error('Error in uploadCSV:', error);
    return res.status(500).json({ error: 'Failed to process CSV file' });
  }
};

export { uploadCSV, parseCSVToTable, fetchTheme };