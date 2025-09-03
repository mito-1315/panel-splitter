import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS for frontend requests
app.use(cors());
app.use(express.json()); // Add this line to parse JSON bodies

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Accept only CSV files
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Panel Splitter API',
      version: '1.0.0',
      description: 'API for uploading and processing CSV files for panel splitting',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ]
  },
  apis: ['./routes/*.js'] // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Import routes
import uploadRoute from './routes/uploadRoute.js';
import themeDisplayRoute from './routes/themeDisplayRoute.js'; // Add this line
import downloadRoute from './routes/downloadRoute.js';
import teamTableRoute from './routes/teamTableRoute.js';
import panelTableRoute from './routes/panelTableRoute.js';

// Use routes
app.use('/', uploadRoute);
app.use('/api', uploadRoute); // Prefix routes with /api
app.use('/api', themeDisplayRoute); // Mount themeDisplayRoute under /api
app.use('/api', downloadRoute);
app.use('/api', teamTableRoute); // Fix spacing issue here
app.use('/api',panelTableRoute)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});